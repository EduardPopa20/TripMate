FROM node:18-alpine

WORKDIR /

COPY shared/ /shared/

WORKDIR /services/currency-service

COPY services/currency-service/package*.json ./

RUN npm install --production

COPY services/currency-service/ .

EXPOSE 3006

WORKDIR /services/currency-service

CMD ["npm", "start"]
