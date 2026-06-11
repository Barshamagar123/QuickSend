FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN mkdir -p /app/storage
COPY . .
RUN npm run build
EXPOSE 3005
CMD ["node", "dist/index.js"]
