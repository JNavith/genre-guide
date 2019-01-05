ARG node_tag 
FROM node:${node_tag}

WORKDIR /home/node

COPY . .

RUN npm install

CMD ["npm", "run", "build"]
