ARG node_tag 
FROM node:${node_tag}

WORKDIR /home/node

COPY ./package.json .

RUN npm install

RUN npm install 

CMD ["npm", "run", "prod"]
