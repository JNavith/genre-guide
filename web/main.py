from jinja2 import Template
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import HTMLResponse, Response
from uvicorn import run

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
	# todo: proper solution (probably over graphql)
	lookup = {
		"Space Bass": ("#404040", "#ffffff")
	}
	
	template: Template = app.get_template("components/song-missing-art.svg")
	
	background_color, fill_color = lookup.get(request.query_params["genre"], (None, None))
	
	return Response(template.render(request=request, background_color=background_color, fill_color=fill_color), media_type="image/svg+xml")


if __name__ == '__main__':
	run(app, host='0.0.0.0', port=80)
