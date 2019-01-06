ARG node_tag 
FROM node:${node_tag}

WORKDIR /home/node

COPY ./package.json .

RUN npm install

COPY . .

CMD ["npm", "run", "build"]
