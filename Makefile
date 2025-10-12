up:
	docker-compose up -d postgres

down:
	docker-compose down

build:
	docker-compose up --build

dev:
	npm run dev

migrate:
	npx prisma migrate dev

studio:
	npx prisma studio
