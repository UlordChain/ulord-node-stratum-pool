FROM ubuntu
RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
        ca-certificates \
        build-essential \
        libsodium-dev \
        npm \
        curl \
        wget \
        git \
    && rm -rf /var/lib/apt/lists/*
RUN npm install n -g \ 
    && n 4.8.7
    
ADD . /ulord-node-stratum-pool
WORKDIR /ulord-node-stratum-pool
RUN npm update
CMD ["npm","start"]