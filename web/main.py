from jinja2 import Template
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import HTMLResponse, Response
from uvicorn import run

app = Starlette(template_directory="templates")


@app.route('/genre')
async def homepage(request: Request):
	if request.query_params["name"] == "Space Bass":
		template: Template = app.get_template("view-genre.html")
		return HTMLResponse(template.render(request=request))
	
	return Response("whoops", status_code=404)


if __name__ == '__main__':
	run(app, host='0.0.0.0', port=80)
