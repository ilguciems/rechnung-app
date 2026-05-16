# Use official Node.js image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

RUN DATABASE_URL="postgresql://fake:fake@localhost:5432/fake" npx prisma generate

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build the application
RUN MAILJET_API_KEY="fake" MAILJET_API_SECRET="fake" ABLY_API_KEY="fake" EMAIL_FROM="fake" npm run build

EXPOSE 3000

CMD ["npm", "start"]