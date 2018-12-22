from graphene import ObjectType, Schema, String
from graphql.execution.executors.asyncio import AsyncioExecutor
from starlette.applications import Starlette
from starlette.graphql import GraphQLApp
from uvicorn import run
from uvicorn.loops.uvloop import uvloop_setup

app = Starlette()
loop = uvloop_setup()


class Query(ObjectType):
	hello = String(name=String(default_value="stranger"))
	
	async def resolve_hello(self, info, name):
		return "Hello " + name


app.add_route('/graphql', GraphQLApp(schema=Schema(query=Query, auto_camelcase=False), executor=AsyncioExecutor(loop=loop)))

if __name__ == '__main__':
	run(app, host='0.0.0.0', port=80, loop=loop)
