from json import loads
from sys import stderr

from aiohttp import ClientSession
from jinja2 import Template
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import HTMLResponse, Response
from uvicorn import run
from uvicorn.loops.uvloop import uvloop_setup

loop = uvloop_setup()
app = Starlette(template_directory="templates")


@app.route("/catalog")
@app.route("/")
async def view_catalog(request: Request):
	template: Template = app.get_template("views/catalog.html")
	return HTMLResponse(template.render(request=request))


@app.route("/genre")
async def view_genre(request: Request):
	if request.query_params["name"] == "Space Bass":
		template: Template = app.get_template("views/genre.html")
		return HTMLResponse(template.render(request=request))
	
	return Response("whoops", status_code=404)


@app.route("/svg/song-missing-art.svg")
async def song_missing_art(request: Request):
	genre_name: str = request.query_params["genre"]
	
	query = """
		query get_subgenre_color($name: String!) {
			subgenre(name: $name) {
				color {
					hex
				}
			}
		}
	"""
	
	async with ClientSession() as session:
		async with session.post("http://graphql-server/graphql", json={
			"query": query,
			"variables": {"name": genre_name}
		}, headers={
			"Content-Type": "application/json",
			"Accept": "application/json",
		}) as response:
			data = loads(await response.text())
	
	print(data, file=stderr, flush=True)
	
	# background_color, fill_color = lookup.get(request.query_params["genre"], (None, None))
	
	# todo: add get_accessible_primary_color graphql query
	fill_color = "#ffffff"
	background_color = data["data"]["subgenre"]["color"]["hex"]
	
	template: Template = app.get_template("components/song-missing-art.svg")
	
	return Response(template.render(request=request, background_color=background_color, fill_color=fill_color), media_type="image/svg+xml")


if __name__ == '__main__':
	run(app, host='0.0.0.0', port=80, loop=loop)
