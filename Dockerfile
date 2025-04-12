FROM node:18.18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3052

CMD ["npm", "run", "dev"]
