FROM node:18-alpine

WORKDIR /

COPY shared/ /shared/

WORKDIR /services/places-service

COPY services/places-service/package*.json ./

RUN npm install --production

COPY services/places-service/ .

EXPOSE 3005

WORKDIR /services/places-service

CMD ["npm", "start"]
