#    genre.guide - Google Sheets downloader to Redis Dockerfile
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

ARG python3_base_tag
FROM python3-base:${python3_base_tag} as base

ARG aioredis_version
ARG gspread_version
ARG gspread_formatting_version
ARG oauth2client_version
RUN pip install --no-cache aioredis==${aioredis_version} gspread==${gspread_version} gspread-formatting==${gspread_formatting_version} oauth2client==${oauth2client_version}
