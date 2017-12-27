FROM node:9


ADD ./client/package.json /app/client/package.json
RUN cd /app/client && npm install
ADD ./client/bower.json /app/client/bower.json
RUN cd /app/client && ./node_modules/.bin/bower install --allow-root


ADD ./server/package.json /app/server/package.json
RUN cd /app/server && npm install

ADD ./client/ /app/client/
ADD ./server/ /app/server/

RUN mkdir /app/db

EXPOSE 3000 

WORKDIR /app/server/
ENTRYPOINT node app.js 
