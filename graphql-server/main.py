from contextlib import closing
from json import loads
from os import getenv
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
	name = String(required=True)
	hex = String(required=True)
	
	@staticmethod
	async def _get_hex_color(genre_name: str) -> Optional[str]:
		"""Returns None for subgenres, and a hex code like "#00aaff" for genres"""
		return loads((await redis.hget(Subgenre._get_redis_key(genre_name), "color")).decode("utf8"))
	
	async def resolve_hex(self, info):
		return await Color._get_hex_color(self.name)


class Subgenre(ObjectType):
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
		result: Optional[str] = await redis.hget(self._redis_key, "is_genre")
		
		# Implied returning None for None (though that shouldn't happen?)
		if result is not None:
			return loads(result)
	
	async def resolve_genre(self, info):
		return Subgenre(name=(await redis.hget(self._redis_key, "genre")).decode("utf8"))
	
	async def resolve_color(self, info):
		genre = await self.resolve_genre(info)
		name = genre.name
		return Color(name=name)
	
	async def resolve_origins(self, info):
		return [Subgenre(name=name) for name in loads(await redis.hget(self._redis_key, "origins"))]
	
	async def resolve_subgenres(self, info):
		return [Subgenre(name=name) for name in loads(await redis.hget(self._redis_key, "subgenres"))]


class Query(ObjectType):
	all_subgenres = List(Subgenre)
	
	async def resolve_all_subgenres(self, info):
		subgenres = []
		for subgenre in await redis.smembers("subgenres"):
			subgenres.append(Subgenre(name=subgenre.decode("utf8")))
		
		return subgenres


app.add_route('/graphql', GraphQLApp(schema=Schema(query=Query, auto_camelcase=False), executor=AsyncioExecutor(loop=loop)))

if __name__ == '__main__':
	# Yes, we are really using a global redis connection for all queries, without authentication or rate-limiting
	redis: Redis = loop.run_until_complete(create_redis_pool("redis://redis", password=getenv("REDIS_PASSWORD")))
	with closing(redis):
		run(app, host='0.0.0.0', port=80, loop=loop)
