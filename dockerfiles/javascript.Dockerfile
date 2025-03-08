FROM node:16-slim
WORKDIR /app
COPY . /app
CMD ["node", "code.js"]
