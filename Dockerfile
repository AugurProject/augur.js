FROM dev-node-geth:latest
# augurproject/dev-node-geth:latest

# Install Node
RUN apk update \
  && apk upgrade \
  && apk add nodejs-current \
  && apk add nodejs-npm

# Copy augur.js repo into it and get it set up
COPY . /augur.js
WORKDIR /augur.js
RUN  npm install

RUN chmod +x scripts/run-geth-and-deploy.sh
RUN ./scripts/run-geth-and-deploy.sh

RUN cat src/contracts/addresses.json

EXPOSE 8545 8546 30303 30303/udp 30304/udp

WORKDIR /
ENTRYPOINT [ "/start.sh" ]
