FROM node:19-alpine3.15

WORKDIR /nextjs15-upscale-banking

COPY . /nextjs15-upscale-banking
RUN npm install 

EXPOSE 5004
CMD ["npm","run","start"]