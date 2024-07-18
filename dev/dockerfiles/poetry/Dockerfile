ARG PYTHON_VERSION_SHORT=3.9
ARG PYTHON_VERSION=3.9.12
FROM python:${PYTHON_VERSION}-slim-bullseye

ARG POETRY_VERSION=1.8.2

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

RUN \
    apt-get update -qq && \
    apt-get install -y locales -qq && \
    locale-gen en_US.UTF-8 en_us && \
    dpkg-reconfigure locales && \
    dpkg-reconfigure locales && \
    locale-gen C.UTF-8 && \
    /usr/sbin/update-locale LANG=C.UTF-8

ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
ENV LC_ALL=C.UTF-8


WORKDIR /docker
CMD ["bash"]

RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        wget \
        # git-core \
        # gcc \
        # make \
        # netcat-traditional \
        # g++ \
        # command-not-found \
        # gettext \
        # build-essential \
        # pkg-config \
        # tzdata \
        # libssl-dev \
        # python3-lxml \
        # libxml2 \
        # libxml2-dev \
        # libxslt1-dev \
        python3-dev \
        # curl \
        # libcurl4-openssl-dev \
        && \
    pip install -U pip && \
    pip install "poetry==$POETRY_VERSION" && \
    poetry config virtualenvs.create false 
    # poetry self add poetry-plugin-up
