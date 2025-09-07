# Backend: Node + Express
FROM node:20-alpine

WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el código
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]