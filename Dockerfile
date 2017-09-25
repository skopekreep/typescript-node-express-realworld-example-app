# Base image
FROM node:8.5.0

## Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

## Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

## tell the port number the container should expose
EXPOSE 3000

## run the application
CMD ["npm", "run", "dev"]
