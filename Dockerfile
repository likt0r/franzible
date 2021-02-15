#A lightweight node image
FROM mhart/alpine-node:14

#PM2 will be used as PID 1 process
RUN npm install -g pm2@1.1.3

# Copy package json files for services


RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . /usr/src/nuxt-app/
WORKDIR /usr/src/nuxt-app/backend
RUN npm run compile
WORKDIR /usr/src/nuxt-app/frontend
RUN npm run build
WORKDIR /usr/src/nuxt-app/
RUN cd ..

# Expose ports
EXPOSE 3000
EXPOSE 3030

# Start PM2 as PID 1 process
ENTRYPOINT ["pm2",  "start", "/usr/src/nuxt-app/ecosystem.config.js"]

# Actual script to start can be overridden from `docker run`
# CMD ["ecosystem.config.js"]