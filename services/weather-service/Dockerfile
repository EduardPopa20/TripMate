FROM node:18-alpine

WORKDIR /

COPY shared/ /shared/

WORKDIR /services/weather-service

COPY services/weather-service/package*.json ./

RUN npm install --production

COPY services/weather-service/ .

EXPOSE 3004

WORKDIR /services/weather-service

CMD ["npm", "start"]
