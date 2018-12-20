ARG python_tag
FROM bitnami/python:$python_tag as base

RUN pip install --upgrade pip

ARG starlette_version
ARG uvicorn_version
ARG jinja2_version=2.10
RUN pip install --no-cache starlette==${starlette_version} uvicorn==${uvicorn_version} Jinja2==${jinja2_version}

CMD ["python3", "/app/main.py"]
