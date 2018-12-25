ARG starlette_tag
FROM starlette:${starlette_tag} as base

ARG jinja2_version
ARG aiohttp_version
RUN pip install --no-cache Jinja2==${jinja2_version} aiohttp==${aiohttp_version}
