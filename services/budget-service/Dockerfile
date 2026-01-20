FROM node:18-alpine

WORKDIR /

COPY shared/ /shared/

WORKDIR /services/budget-service

COPY services/budget-service/package*.json ./

RUN npm install --production

COPY services/budget-service/ .

EXPOSE 3003

WORKDIR /services/budget-service

CMD ["npm", "start"]
