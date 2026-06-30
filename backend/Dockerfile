FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
EXPOSE 5000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/app.js"]