FROM augurproject/dev-node-geth:latest

# Install Node
RUN apk update \
  && apk upgrade \
  && apk add nodejs-current \
  && apk add --update nodejs nodejs-npm \
  && apk --no-cache add curl

# Copy augur.js repo into it and get it set up
COPY . /augur.js
WORKDIR /augur.js
RUN  npm install \
  && npm run build

ENTRYPOINT ["./scripts/run-geth-and-deploy.sh"]
