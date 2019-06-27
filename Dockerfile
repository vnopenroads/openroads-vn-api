FROM node:8.16.0-alpine

RUN apk --update add postgresql-client && \
    apk add python && \
    apk add --update alpine-sdk

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
ADD . /opt/app
RUN npm run gendoc

EXPOSE 4000
CMD ["npm", "start"]
