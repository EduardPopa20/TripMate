FROM node:18-alpine

WORKDIR /

COPY shared/ /shared/

WORKDIR /services/itinerary-service

COPY services/itinerary-service/package*.json ./

RUN npm install --production

COPY services/itinerary-service/ .

EXPOSE 3002

WORKDIR /services/itinerary-service

CMD ["npm", "start"]
