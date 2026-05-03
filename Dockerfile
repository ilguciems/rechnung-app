# Use official Node.js image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Deploy migrations
RUN npx prisma migrate deploy

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
