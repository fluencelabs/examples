FROM debian:latest

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 16.4.0

RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# got node ?
RUN node -v
RUN npm -v

# install fluence app
RUN mkdir -p fluence
WORKDIR fluence

COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]
COPY aqua ./aqua
COPY src ./src

RUN npm install

# compile aqua
RUN npm run compile-aqua
# RUN npm start

ENTRYPOINT [ "npm", "start" ]