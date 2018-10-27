ARG node_tag
FROM node:$node_tag

WORKDIR /home/node

# init node package / project
#RUN npm init -y

ARG purgecss_version
RUN npm install purgecss@$purgecss_version --no-save

#COPY ./ts/purgecss.ts .

#CMD ["node", "./purgecss.ts"]
CMD ["./node_modules/purgecss/bin/purgecss", "--css", "./css/styles.css", "--content", "./html/*.html", "--out", "./css"]

#COPY ./sh/purgecss-init.sh .
#CMD ["sh", "./purgecss-init.sh"]
