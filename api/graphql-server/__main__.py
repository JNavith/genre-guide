#    genre.guide - GraphQL server main Python file
#    Copyright (C) 2018 Navith
#    
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#    
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#    
#    You should have received a copy of the GNU Affero General Public License
#    along with this program. If not, see <https://www.gnu.org/licenses/>.

from contextlib import closing
from datetime import date, timedelta
from itertools import count
from os import getenv
from sys import stderr
from typing import Generator, List as typing_List, Optional, cast

from aioredis import Redis, create_redis_pool
from graphene import Boolean, Date, Field, ID, Int, List, ObjectType, Schema, String
from graphql import GraphQLError, GraphQLObjectType
from graphql.execution.executors.asyncio import AsyncioExecutor
from starlette.applications import Starlette
from starlette.graphql import GraphQLApp
from starlette.middleware.cors import CORSMiddleware
from uvicorn import run
from uvicorn.loops.uvloop import uvloop_setup

from .subgenres import Subgenre
from .tracks import Track

app = Starlette()
print("running uvloop setup", file=stderr, flush=True)
loop = uvloop_setup()
print("finished uvloop setup", file=stderr, flush=True)


def all_dates_between(start: date, end: date, reverse: bool = False) -> Generator[date, None, None]:
	range_ = range((end - start).days + 1)
	if reverse:
		range_ = reversed(range_)
	
	for i in range_:
		yield start + timedelta(days=i)


def all_dates_before(end: date) -> Generator[date, None, None]:
	for i in count(0):
		yield end - timedelta(days=i)


class Query(ObjectType):
	all_subgenres = List(Subgenre, description="Retrieve all subgenres from the database")
	subgenre = Field(Subgenre, name=String(description='The name of the subgenre to retrieve, e.x. "Vaporwave"'), description="Retrieve a particular subgenre from the database")
	
	all_genres = List(Subgenre, description="Retrieve all genres (subgenres with their own color and category) from the database")
	
	tracks = List(Track,
	              before=Date(description="The newest date of songs to retrieve (inclusive)", required=False),
	              after=Date(description="The oldest date of songs to retrieve (inclusive)", required=False),
	              newest_first=Boolean(description="Whether to sort the returned tracks from newest to oldest, or oldest to newest", required=False),
	              limit=Int(description="The maximum number of songs to return", required=False),
	              description="Retrieve a range of tracks from the Genre Sheet")
	
	track = Field(Track, id=ID(description="The ID of the track to retrieve"), description="Retrieve a particular track from the database")
	
	async def resolve_all_subgenres(self, info):
		return [Subgenre(name=subgenre.decode("utf8")) for subgenre in await do_redis("smembers", "subgenres")]
	
	async def resolve_subgenre(self, info, name):
		if not (await do_redis("sismember", "subgenres", name)):
			if not name.startswith("?"):
				raise GraphQLError(f"{name} is not a valid subgenre!")
			
			name = Subgenre._transform_unknown_subgenre(name)
			
			if not (await do_redis("sismember", "subgenres", name)):
				raise GraphQLError(f"{name} is not a valid subgenre!")
		
		return Subgenre(name=name)
	
	async def resolve_all_genres(self, info):
		return [Subgenre(name=genre.decode("utf8")) for genre in await do_redis("smembers", "genres")]
	
	async def resolve_tracks(self, info, after=None, before=None, limit: Optional[int] = None, newest_first: bool = True):
		if before is None:
			# Two days from now
			before = date.today() + timedelta(days=2)
		
		if limit is None:
			limit = 100
		
		limit: int = min(limit, 1000)
		
		tracks: typing_List[Track] = []
		
		if after is not None:
			for date_ in all_dates_between(after, before, reverse=newest_first):
				for track_id in await do_redis("lrange", f"date:{date_.strftime('%Y-%m-%d')}", 0, -1):
					tracks.append(Track(id=track_id.decode("utf8")))
					
					if len(tracks) >= limit:
						return tracks
		else:
			if not newest_first:
				raise GraphQLError("`newest_first` must be true when `after` is not specified")
			
			for date_ in all_dates_before(before):
				for track_id in await do_redis("lrange", f"date:{date_.strftime('%Y-%m-%d')}", 0, -1):
					tracks.append(Track(id=track_id.decode("utf8")))
					
					if len(tracks) >= limit:
						return tracks
		
		# If the limit is not reached (for either of the cases from above), just return the list like this
		return tracks
	
	async def resolve_track(self, info, id):
		if not (await do_redis("exists", Track._get_redis_key(id))):
			raise GraphQLError(f"There is no track with id {id!r}!")
		
		return Track(id=id)


async def do_redis(command_name: str, *args, **kwds):
	return await getattr(redis, command_name)(*args, **kwds)


# TODO: Remove (probably a security problem)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.add_route('/graphql', GraphQLApp(schema=Schema(query=cast(GraphQLObjectType, Query), auto_camelcase=False), executor=AsyncioExecutor(loop=loop)))

if __name__ == '__main__':
	redis: Redis = loop.run_until_complete(create_redis_pool(getenv("REDIS_HOST", "redis://redis"), password=getenv("REDIS_PASSWORD"), ssl=(getenv("REDIS_SSL", "False") == "True")))
	with closing(redis):
		run(app, host='0.0.0.0', port=80, loop=loop)
