FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Run on port 7860 which is required by Hugging Face Spaces
ENV PORT=7860
EXPOSE 7860

CMD ["node", "backend/server.js"]
