#    genre.guide - purgecss Dockerfile
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

ARG node_tag
FROM node:$node_tag

WORKDIR /home/node

# Install purgecss
ARG purgecss_version
RUN npm install purgecss@$purgecss_version --no-save

CMD ["./node_modules/purgecss/bin/purgecss", "--css", "./css/styles.css", "--content", "./html/*.html", "--out", "./css"]
