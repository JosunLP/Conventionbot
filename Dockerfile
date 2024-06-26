FROM node:current

# Delete all the files in the current directory
RUN rm -rf /usr/src/app/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm config set registry "https://registry.npmjs.org/"

RUN npm cache clean --force

RUN npm install -g npm@latest

RUN NODE_ENV=development npm ci

# Bundle app source
COPY . .

RUN npm run build
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 8080

CMD [ "node", "dist/server.js" ]

# docker build . -t conventionbot-server
# docker run -p 49160:8080 -d conventionbot-server
