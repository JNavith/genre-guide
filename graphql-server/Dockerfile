ARG starlette_tag
FROM starlette:${starlette_tag} as base

ARG graphene_version
RUN pip install --no-cache graphene==${graphene_version}
