#    genre.guide - Google Sheets downloader Dockerfile
#    Copyright (C) 2018 Navith
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program. If not, see <https://www.gnu.org/licenses/>.

ARG python_tag=3.7.1-stretch
FROM python:$python_tag

#ARG python_tag=3.7.1-prod
#FROM bitnami/python:${python_tag}

WORKDIR /app

ARG gspread_version=3.0.1
ARG oauth2client_version=4.1.3
RUN pip3 install --no-cache gspread==${gspread_version} oauth2client==${oauth2client_version}

CMD ["python3", "./main.py"]
