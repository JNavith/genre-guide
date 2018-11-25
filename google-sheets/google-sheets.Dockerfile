ARG python_tag=3.7.1-stretch
FROM python:$python_tag

#ARG python_tag=3.7.1-prod
#FROM bitnami/python:${python_tag}

WORKDIR /app

ARG gspread_version=3.0.1
ARG oauth2client_version=4.1.3
RUN pip3 install --no-cache gspread==${gspread_version} oauth2client==${oauth2client_version}

CMD ["python3", "./main.py"]
