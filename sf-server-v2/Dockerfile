FROM node:18-slim

WORKDIR /usr/src/app

# Optional memory limit for Node
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install dependencies including Chromium
RUN apt-get update && apt-get install -y \
  chromium \
  chromium-driver \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  wget \
  curl \
  unzip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Puppeteer
RUN yarn add puppeteer@13.5.0

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
COPY .env .env

RUN yarn build

EXPOSE 3000
EXPOSE 81

CMD ["yarn", "start:prod"]
