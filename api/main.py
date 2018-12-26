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
from json import loads
from os import getenv
from re import sub
from typing import List as typing_List, Optional, cast

from aioredis import Redis, create_redis_pool
from graphene import Boolean, Enum, Field, List, ObjectType, Schema, String
from graphql import GraphQLError
from graphql.execution.executors.asyncio import AsyncioExecutor
from starlette.applications import Starlette
from starlette.graphql import GraphQLApp
from uvicorn import run
from uvicorn.loops.uvloop import uvloop_setup

app = Starlette()
loop = uvloop_setup()


class ColorRepresentation(Enum):
	"A format that a color can come in, such as HEX"
	
	HEX = 0
	TAILWIND = 1
	
	@property
	def description(self):
		if self == ColorRepresentation.HEX:
			return 'The color as a hex code in a string, such as "#ec00db"'
		elif self == ColorRepresentation.TAILWIND:
			return 'The color as a TailwindCSS color name (as found in a class name), such as "genre-ambient"'


class Color(ObjectType):
	"""A color for genres and subgenres. Includes information about the name (which genre it's tied to) and a hex representation."""
	
	from_genre = Field(String, description="The name of the genre that this color comes from")
	foreground = Field(String, representation=ColorRepresentation(name="representation", description="The format for the color, such as HEX"), description="The text color that appears on top of this color on the Genre Sheet")
	background = Field(String, representation=ColorRepresentation(name="representation", description="The format for the color, such as HEX"), description="The background color for the genre on the Genre Sheet")
	
	@staticmethod
	async def _get_hex_colors(genre_name: str) -> Optional[typing_List[str]]:
		"""Returns None for subgenres, and a list of hex codes like ["#ec00db", "#ffffff"] for genres"""
		return loads((await do_redis("hget", Subgenre._get_redis_key(genre_name), "color")).decode("utf8"))
	
	async def _get_or_cache_colors(self):
		try:
			return self._cached_colors
		except AttributeError:
			self._cached_colors = result = await Color._get_hex_colors(self.from_genre)
			
			if result is None:
				raise GraphQLError("no color -- not sure how")
			
			return result
	
	async def resolve_foreground(self, info, representation=ColorRepresentation.HEX):
		if representation == ColorRepresentation.HEX:
			return (await self._get_or_cache_colors())[1]
		elif representation == ColorRepresentation.TAILWIND:
			foreground = (await self._get_or_cache_colors())[1].lower()
			
			# These are the only colors we use, so why bother with anything else?
			if foreground == "#ffffff":
				return "white"
			elif foreground == "#000000":
				return "black"
			
			raise GraphQLError("internal error: the foreground color represented by hex {foreground} is neither white nor black")
		
		raise GraphQLError(f"unknown representation {representation!r} for foreground color")
	
	async def resolve_background(self, info, representation=ColorRepresentation.HEX):
		if representation == ColorRepresentation.HEX:
			return (await self._get_or_cache_colors())[0]
		elif representation == ColorRepresentation.TAILWIND:
			words: typing_List[str] = (cast(str, self.from_genre)).lower().split()
			words_alpha_only: typing_List[str] = ["".join([letter for letter in word if letter.isalpha()]) for word in words]
			words_hyphenated: str = '-'.join(words_alpha_only)
			reduced_hyphens: str = sub(r"-+", "-", words_hyphenated)
			
			return f"genre-{reduced_hyphens}"
		
		raise GraphQLError(f"unknown representation {representation!r} for background color")


class Subgenre(ObjectType):
	"""A subgenre, as understood on the Genre Sheet"""
	
	name = String(required=True, description='The name of the subgenre, e.x. "Brostep"')
	is_genre = Boolean(required=True, description='Whether the subgenre is actually a genre (has its own category and color), e.x. true for Rock, false for Future House')
	genre = Field(lambda: Subgenre, required=True, description="The category that this subgenre belongs to, and that it inherits its color from, e.x. Vaporwave for Vaportrap, Future Bass for Future Bass")
	color = Field(Color, description="Color information about this subgenre, including the text color it uses on the Genre Sheet and the background color")
	origins = List(lambda: Subgenre, required=True, description='The list of subgenres that this subgenre comes directly from, e.x. {Detroit Techno,} for Big Room Techno, {UK Hip Hop, 2-Step Garage} for Grime')
	subgenres = List(lambda: Subgenre, required=True, description='The list of subgenres who originate directly from this subgenre, e.x. {Deathstep, Drumstep} for Dubstep, {} for Footwork, {Electro Swing, Jazzstep} for Nu-Jazz')
	
	@staticmethod
	def _get_redis_key(subgenre_name: str) -> str:
		return f"subgenre:{subgenre_name}"
	
	@property
	def _redis_key(self):
		return Subgenre._get_redis_key(self.name)
	
	async def resolve_is_genre(self, info):
		result: Optional[str] = await do_redis("hget", self._redis_key, "is_genre")
		return loads(result)
	
	async def resolve_genre(self, info):
		return Subgenre(name=(await do_redis("hget", self._redis_key, "genre")).decode("utf8"))
	
	async def resolve_color(self, info):
		genre = await self.resolve_genre(info)
		return Color(from_genre=genre.name)
	
	async def resolve_origins(self, info):
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "origins"))]
	
	async def resolve_subgenres(self, info):
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "subgenres"))]


class Query(ObjectType):
	all_subgenres = List(Subgenre, description="Retrieve all subgenres from the database")
	subgenre = Field(Subgenre, name=String(description='The name of the subgenre to retrieve, e.x. "Vaporwave"'), description="Retrieve a particular subgenre from the database")
	
	async def resolve_all_subgenres(self, info):
		return [Subgenre(name=subgenre.decode("utf8")) for subgenre in await do_redis("smembers", "subgenres")]
	
	async def resolve_subgenre(self, info, name):
		if not (await do_redis("sismember", "subgenres", name)):
			raise GraphQLError(f"{name} is not a valid subgenre!")
		
		return Subgenre(name=name)


async def do_redis(command_name: str, *args, **kwds):
	return await getattr(redis, command_name)(*args, **kwds)


app.add_route('/graphql', GraphQLApp(schema=Schema(query=Query, auto_camelcase=False), executor=AsyncioExecutor(loop=loop)))

if __name__ == '__main__':
	redis: Redis = loop.run_until_complete(create_redis_pool("redis://redis", password=getenv("REDIS_PASSWORD")))
	with closing(redis):
		run(app, host='0.0.0.0', port=80, loop=loop)
