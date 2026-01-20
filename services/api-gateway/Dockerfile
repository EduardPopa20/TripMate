FROM node:18-alpine

WORKDIR /

COPY shared/ /shared/

WORKDIR /services/api-gateway

COPY services/api-gateway/package*.json ./

RUN npm install --production

COPY services/api-gateway/ .

EXPOSE 3000

WORKDIR /services/api-gateway

CMD ["npm", "start"]
