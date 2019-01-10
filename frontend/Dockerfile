ARG node_tag 
FROM node:${node_tag}

WORKDIR /home/node
CMD ["npm", "run", "build"]

COPY ./package.json .

RUN npm install

COPY . .
