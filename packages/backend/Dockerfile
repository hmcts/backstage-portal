# This dockerfile builds an image for the backend package.
# It should be executed with the root of the repo as docker context.
#
# Before building this image, be sure to have run the following commands in the repo root:
#
# yarn install --immutable
# yarn tsc
# yarn build:backend
#
# Once the commands have been run, you can build the image using `yarn build-image`
#
# Alternatively, there is also a multi-stage Dockerfile documented here:
# https://backstage.io/docs/deployment/docker#multi-stage-build

FROM node:20-bookworm-slim

# Set Python interpreter for `node-gyp` to use
ENV PYTHON=/usr/bin/python3

# Install dependencies for node-gyp and sqlite3, plus pip for mkdocs
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      g++ \
      build-essential \
      libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# Install mkdocs + TechDocs plugins
RUN pip3 install --no-cache-dir mkdocs-techdocs-core

# From here on we use the least-privileged `node` user to run the backend.
USER node

# This should create the app dir as `node`.
WORKDIR /app

# Copy files needed by Yarn
COPY --chown=node:node .yarn ./.yarn
COPY --chown=node:node .yarnrc.yml ./
COPY --chown=node:node backstage.json ./

# Switch many Node.js dependencies to production mode.
ENV NODE_ENV=production

# Disable node snapshot for Node 20 to work with the Scaffolder
ENV NODE_OPTIONS="--no-node-snapshot"

# Copy repo skeleton first, to avoid unnecessary docker cache invalidation.
COPY --chown=node:node yarn.lock package.json packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN --mount=type=cache,target=/home/node/.cache/yarn,sharing=locked,uid=1000,gid=1000 \
    yarn workspaces focus --all --production && rm -rf "$(yarn cache clean)"

# This will include the examples, if you don't need these simply remove this line
COPY --chown=node:node examples ./examples

# Then copy the rest of the backend bundle, along with any other files we might want.
COPY --chown=node:node packages/backend/dist/bundle.tar.gz app-config*.yaml ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

# Expose backend port
EXPOSE 7007

CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
