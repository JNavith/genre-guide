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


class Subgenre(ObjectType):
	name = String(required=True)
	is_genre = Boolean(required=True)
	genre = Field(lambda: Subgenre)
	color = Field(Color)
	origins = List(lambda: Subgenre, required=True)
	subgenres = List(lambda: Subgenre, required=True)
	
	@property
	def _redis_key(self):
		return f"subgenre:{self.name}"
	
	async def resolve_is_genre(self, info):
		result: Optional[str] = await redis.hget(self._redis_key, "is_genre")
		
		if result is not None:
			return loads(result)
	
	async def resolve_genre(self, info):
		return Subgenre(name=(await redis.hget(self._redis_key, "genre")).decode("utf8"))
	
	async def _get_hex_color(self):
		return loads((await redis.hget(self._redis_key, "color")).decode("utf8"))
	
	async def resolve_color(self, info):
		genre = await self.resolve_genre(info)
		name = genre.name
		hex = await genre._get_hex_color()
		return Color(name=name, hex=hex)
	
	async def resolve_origins(self, info):
		return [Subgenre(name=name) for name in loads(await redis.hget(self._redis_key, "origins"))]
	
	async def resolve_subgenres(self, info):
		return [Subgenre(name=name) for name in loads(await redis.hget(self._redis_key, "subgenres"))]


class Query(ObjectType):
	hello = String(name=String(default_value="stranger"))
	
	all_subgenres = List(Subgenre)
	
	async def resolve_hello(self, info, name):
		return "Hello " + name
	
	async def resolve_all_subgenres(self, info):
		subgenres = []
		for subgenre in await redis.smembers("subgenres"):
			subgenres.append(Subgenre(name=subgenre.decode("utf8")))
		
		return subgenres


app.add_route('/graphql', GraphQLApp(schema=Schema(query=Query, auto_camelcase=False), executor=AsyncioExecutor(loop=loop)))

if __name__ == '__main__':
	# Yes, we are really using a global redis connection for all queries
	redis: Redis = loop.run_until_complete(create_redis_pool("redis://redis", password=getenv("REDIS_PASSWORD")))
	with closing(redis):
		run(app, host='0.0.0.0', port=80, loop=loop)
