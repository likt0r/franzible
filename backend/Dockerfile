FROM node:lts-alpine3.12

# create destination directory
RUN mkdir -p /usr/src/feather-app
WORKDIR /usr/src/feather-app

# create upload directory
RUN mkdir -p /mnt/volume

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /usr/src/feather-app/
RUN npm install

# build necessary, even if no static files are needed,
# since it builds the server as well
RUN npm run build

# expose 5000 on container
EXPOSE 5000


ENV API_SOCKET = http://api:80/
ENV API_URL = http://api:80/
# set upload folder
ENV MEDIA_FOLDER=/mnt/media

# start the appcd
CMD [ "npm", "start" ]
