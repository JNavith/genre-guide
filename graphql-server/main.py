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
from asyncio import sleep
from contextlib import closing
from json import loads
from os import getenv
from sys import stderr
from typing import Optional

from aioredis import Redis, create_redis_pool
from graphene import Boolean, Field, List, ObjectType, Schema, String
from graphql.execution.executors.asyncio import AsyncioExecutor
from starlette.applications import Starlette
from starlette.graphql import GraphQLApp
from uvicorn import run
from uvicorn.loops.uvloop import uvloop_setup

app = Starlette()
loop = uvloop_setup()


class Color(ObjectType):
	"""A color for genres and subgenres. Includes information about the name (which genre it's tied to) and a hex representation."""
	
	name = String(required=True)
	hex = String(required=True)
	
	@staticmethod
	async def _get_hex_color(genre_name: str) -> Optional[str]:
		"""Returns None for subgenres, and a hex code like "#00aaff" for genres"""
		return loads((await do_redis("hget", Subgenre._get_redis_key(genre_name), "color")).decode("utf8"))
	
	async def resolve_hex(self, info):
		return await Color._get_hex_color(self.name)


class Subgenre(ObjectType):
	"""A subgenre, as understood on the Genre Sheet"""
	
	name = String(required=True)
	is_genre = Boolean(required=True)
	genre = Field(lambda: Subgenre, required=True)
	color = Field(Color)
	origins = List(lambda: Subgenre, required=True)
	subgenres = List(lambda: Subgenre, required=True)
	
	@staticmethod
	def _get_redis_key(subgenre_name: str) -> str:
		return f"subgenre:{subgenre_name}"
	
	@property
	def _redis_key(self):
		return Subgenre._get_redis_key(self.name)
	
	async def resolve_is_genre(self, info):
		result: Optional[str] = await do_redis("hget", self._redis_key, "is_genre")
		
		# Implied returning None for None (though that shouldn't happen?)
		if result is not None:
			return loads(result)
	
	async def resolve_genre(self, info):
		return Subgenre(name=(await do_redis("hget", self._redis_key, "genre")).decode("utf8"))
	
	async def resolve_color(self, info):
		genre = await self.resolve_genre(info)
		name = genre.name
		return Color(name=name)
	
	async def resolve_origins(self, info):
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "origins"))]
	
	async def resolve_subgenres(self, info):
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "subgenres"))]


class Query(ObjectType):
	all_subgenres = List(Subgenre, description="Retrieve all subgenres from the database")
	subgenre = Field(Subgenre(), name=String(), description="Retrieve a particular subgenre from the database")
	
	async def resolve_all_subgenres(self, info):
		subgenres = []
		for subgenre in await do_redis("smembers", "subgenres"):
			subgenres.append(Subgenre(name=subgenre.decode("utf8")))
		
		return subgenres
	
	async def resolve_subgenre(self, info, name):
		return Subgenre(name=name)


async def do_redis(command_name: str, *args, **kwds):
	global actions
	actions += 1
	
	return await getattr(redis_transaction, command_name)(*args, **kwds)


async def supervise_redis_transactions():
	global actions
	global redis_transaction
	
	DIVISIONS_PER_GROUP: int = 4
	SECONDS_PER_GROUP: float = 1 / 4
	ACTIONS_THRESHOLD: int = 10
	
	while True:
		for _ in range(DIVISIONS_PER_GROUP):
			if actions >= ACTIONS_THRESHOLD:
				print(f"{actions} actions exceeds threshold {ACTIONS_THRESHOLD}, executing right now", flush=True, file=stderr)
				await redis_transaction.execute()
				redis_transaction = redis.multi_exec()
				actions = 0
				break
			
			await sleep(SECONDS_PER_GROUP / DIVISIONS_PER_GROUP)
		else:
			if actions > 0:
				print(f"only {actions} actions is not enough to meet {ACTIONS_THRESHOLD}, executing soon", flush=True, file=stderr)
				loop.create_task(redis_transaction.execute())
				redis_transaction = redis.multi_exec()
				actions = 0


app.add_route('/graphql', GraphQLApp(schema=Schema(query=Query, auto_camelcase=False), executor=AsyncioExecutor(loop=loop)))

if __name__ == '__main__':
	# Yes, we are really using a global Redis connection for all queries, without authentication or rate-limiting
	redis: Redis = loop.run_until_complete(create_redis_pool("redis://redis", password=getenv("REDIS_PASSWORD")))
	redis_transaction = redis.multi_exec()
	actions = 0
	loop.create_task(supervise_redis_transactions())
	with closing(redis):
		run(app, host='0.0.0.0', port=80, loop=loop)
