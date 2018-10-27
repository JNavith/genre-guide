#    genre.guide - Tailwind Dockerfile
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

# Install tailwindcss
ARG tailwindcss_version
RUN npm install tailwindcss@$tailwindcss_version --no-save

# Install the tailwindcss-transition plugin
ARG tailwindcss_transition_version
RUN npm install tailwindcss-transition@$tailwindcss_transition_version --no-save

# Build the Tailwind project
# This container's main responsibility
CMD ["./node_modules/.bin/tailwind", "build", "./input.css", "-c", "./tailwind.js", "-o", "./styles.css"]
