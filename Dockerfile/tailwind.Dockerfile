ARG node_tag
FROM node:$node_tag

WORKDIR /home/node

# init node package / project
#RUN npm init -y

# Install tailwindcss
ARG tailwindcss_version
RUN npm install tailwindcss@$tailwindcss_version --no-save

# Install the tailwindcss-transition plugin
ARG tailwindcss_transition_version
RUN npm install tailwindcss-transition@$tailwindcss_transition_version --no-save

# Build the Tailwind project
# This container's main responsibility
CMD ["./node_modules/.bin/tailwind", "build", "./input.css", "-c", "./tailwind.js", "-o", "./styles.css"]
