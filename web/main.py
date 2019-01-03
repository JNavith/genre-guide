from itertools import groupby
from json import loads
from operator import itemgetter
from typing import Iterator, List

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
@app.route("//")  # Discord
@app.route("/")
async def view_catalog(request: Request):
	query = """
		query get_limited_number_of_tracks_from_before_tomorrow($limit: Int) {
			tracks(limit: $limit) {
				name
				artist
				record_label
				subgenres_with_colors_json: subgenres_flat_json(and_colors: TAILWIND)
				date {
					year
					month_name
					day
				}
			}
		}
	"""
	
	async with ClientSession() as session:
		async with session.post("http://graphql-server/graphql", json={
			"query": query,
			"variables": {"limit": 100}
		}, headers={
			"Content-Type": "application/json",
			"Accept": "application/json",
		}) as response:
			track_data = await response.json()
	
	tracks_by_date: Iterator[str, Iterator] = groupby(track_data["data"]["tracks"], itemgetter("date"))
	tracks_by_date: List[str, List] = [(date_, list(tracks)) for (date_, tracks) in tracks_by_date]
	
	for (date_, tracks) in tracks_by_date:
		for track in tracks:
			track["subgenres_with_colors"] = loads(track["subgenres_with_colors_json"])
	
	template: Template = app.get_template("views/catalog.html")
	return HTMLResponse(template.render(request=request, tracks_by_date=tracks_by_date, zip=zip))


@app.route("/subgenre")
async def view_subgenre(request: Request):
	if request.query_params["name"] == "Space Bass":
		template: Template = app.get_template("views/genre.html")
		return HTMLResponse(template.render(request=request))
	
	return Response("whoops", status_code=404)


@app.route("/svg/song-missing-art.svg")
async def song_missing_art(request: Request):
	query = """
		query get_subgenre_color($name: String!) {
			subgenre(name: $name) {
				color {
					# Ask for the hex representation because we're rendering an SVG file without CSS
					foreground(representation: HEX)
					background(representation: HEX)
				}
			}
		}
	"""
	
	async with ClientSession() as session:
		async with session.post("http://graphql-server/graphql", json={
			"query": query,
			"variables": {"name": request.query_params["subgenre"]}
		}, headers={
			"Content-Type": "application/json",
			"Accept": "application/json",
		}) as response:
			data = await response.json()
	
	if data["errors"] is None:
		color_info = data["data"]["subgenre"]["color"]
		background_color, foreground_color = color_info["background"], color_info["foreground"]
	else:
		background_color, foreground_color = "#000000", "#ffffff"
	
	template: Template = app.get_template("components/song-missing-art.svg")
	
	return Response(template.render(request=request, background_color=background_color, fill_color=foreground_color), media_type="image/svg+xml")


if __name__ == '__main__':
	run(app, host='0.0.0.0', port=80, loop=loop)
