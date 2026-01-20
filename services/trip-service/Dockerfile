FROM node:18-alpine

WORKDIR /

COPY shared/ /shared/

WORKDIR /services/trip-service

COPY services/trip-service/package*.json ./

RUN npm install --production

COPY services/trip-service/ .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

WORKDIR /services/trip-service

CMD ["node", "index.js"]
