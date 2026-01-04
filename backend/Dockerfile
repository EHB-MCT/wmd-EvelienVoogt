
FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install --quiet

COPY knexfile.js ./knexfile.js
COPY migrations ./migrations
COPY seeds ./seeds
COPY src ./src


CMD ["npm", "start"]

