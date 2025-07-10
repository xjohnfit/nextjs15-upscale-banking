FROM node:19-alpine3.15

WORKDIR /upscale-banking

COPY . /upscale-banking
RUN npm install
RUN npm run build

CMD ["npm","start"]