# Franzible

## Build Frontend Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

## Deployment on Linux

1. Clone repository
2. Add enviroment variables to yout bash_profile
   $ nano ~/.profile
   ```
   export FRANZIBLE_AUTH_SECRET=yourAuthSecret
   export FRANZIBLE_DOMAIN=www.yourdomain.com
   export FRANZIBLE_PORT=PortFranzibleShouldRunOn 
   export FRANZIBLE_MEDIA_PATH=pathToYourAudiobooks
   ```
  $ source ~./profile
3. go to franzible directory
   docker-compose up -d
