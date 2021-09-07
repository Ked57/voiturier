FROM node:16.6.0 as builder

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY src src
COPY tsconfig.json ./

RUN npm run build

FROM node:16.6.0

WORKDIR /app

COPY --from=builder /app/dist .
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .

ENV CLIENT_ID=$CLIENT_ID
ENV GUILD_ID=$GUILD_ID
ENV TOKEN=$TOKEN
ENV PERMISSIONS=$PERMISSIONS
ENV VEHICLE_CHANNEL_ID=$VEHICLE_CHANNEL_ID
ENV VEHICLE_RUNNER_CHANNEL_ID=$VEHICLE_RUNNER_CHANNEL_ID
ENV GLOBAL_COUNT_CHANNEL_ID=$GLOBAL_COUNT_CHANNEL_ID

RUN yarn install --production

CMD ["node", "app.js"]