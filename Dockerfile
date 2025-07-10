FROM node:24

WORKDIR /upscale-banking

COPY . /upscale-banking
RUN npm install
RUN npm run build

CMD ["npm","start"]