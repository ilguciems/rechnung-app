FROM node:24-alpine4.0.4
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN DATABASE_URL="postgresql://fake:fake@localhost:5432/fake" npx prisma generate

ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]