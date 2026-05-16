FROM node:24-alpine
WORKDIR /app


RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

COPY package*.json pnpm-lock.yaml* .npmrc* ./

RUN pnpm install --frozen-lockfile --allow-builds

COPY . .

RUN DATABASE_URL="postgresql://fake:fake@localhost:5432/fake" pnpm exec prisma generate

ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]
