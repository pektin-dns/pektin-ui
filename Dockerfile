# 0. build stage
FROM node:16.13.0-alpine3.14 as build-stage
RUN apk add git bash sed
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN sh scripts/install-modules.sh
RUN yarn build

# 1. execution stage
FROM nginx:alpine
ENV CSP_CONNECT_SRC=*
COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY ./server/nginx.conf.template /etc/nginx/templates/default.conf.template
