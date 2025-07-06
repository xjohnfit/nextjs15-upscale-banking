FROM node:20.12.2-alpine

WORKDIR /nextjs15-upscale-banking

# Upgrade Alpine packages to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache

COPY . /nextjs15-upscale-banking
RUN npm install 
RUN npm run build

EXPOSE 5004
CMD ["npm","run","start"]