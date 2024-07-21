FROM node:12.22.12-bullseye-slim AS certcache-build-deps

RUN \
  apt update && \ 
  apt install -y --no-install-recommends \
    g++ make git


FROM certcache-build-deps AS certcache-build

COPY src /certcachesrc/src
COPY package.json /certcachesrc/package.json

ENV NODE_ENV=production

RUN npm install --production -g /certcachesrc/


FROM node:12.22.12-bullseye-slim AS dist

ARG POETRY_VERSION=1.8.2
ENV PYTHONPATH="$PYTHONPATH:/usr/lib/python3.9/site-packages"

COPY --from=certcache-build /certcachesrc /usr/local/lib/node_modules/certcache
COPY docker/entrypoint.sh /entrypoint.sh

COPY docker/pyproject.toml docker/poetry.lock /certbot/

WORKDIR /certbot/

RUN set -eux && \
  apt update && \
  apt install -y --no-install-recommends build-essential python3 python3-pip python3-dev libffi-dev libssl-dev && \
  pip3 install "poetry==$POETRY_VERSION" && \
  poetry config virtualenvs.create false && \
  poetry install && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /var/tmp/* && \
  rm -rf /usr/share/man/* && \
  rm -rf /usr/share/info/* && \
  rm -rf /var/cache/man/* && \
  rm -rf /tmp/*

WORKDIR /certcache/

RUN ln -s /usr/local/lib/node_modules/certcache/src/cli/cli.js \
    /usr/local/bin/certcache && \
  chmod +x /entrypoint.sh

VOLUME /certcache/bin/
VOLUME /certcache/cache/
VOLUME /certcache/catkeys/
VOLUME /certcache/certs/
VOLUME /certcache/conf/
VOLUME /certcache/credentials/

EXPOSE 53
EXPOSE 80
EXPOSE 4433

ENTRYPOINT ["/entrypoint.sh"]

CMD ["client"]
