# Base image
FROM node:8.5.0

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

## Install app dependencies
RUN npm install

## tell the port number the container should expose
EXPOSE 3000

## run the application
CMD ["npm", "run", "dev"]

## our base image
#FROM node:6.9.1
#
## Create app directory
#RUN mkdir -p /usr/src/app
#WORKDIR /usr/src/app
#
## Install app dependencies
#COPY package.json /usr/src/app/
#RUN npm install && \
#    npm install -g nodemon
#
## Bundle app source
#COPY . /usr/src/app
#

#
## run the application
#CMD ["nodemon", "app.js"]
