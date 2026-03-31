# Build and serve stage
FROM node:18-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build-only

EXPOSE 5175
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "5175"]