ARG python_tag
FROM bitnami/python:${python_tag} as base

WORKDIR /app
CMD ["python3", "./main.py"]

RUN pip install --upgrade pip && \
    pip install --upgrade setuptools || true

ARG starlette_version
ARG uvicorn_version
RUN pip3 install --no-cache starlette==${starlette_version} uvicorn==${uvicorn_version}

