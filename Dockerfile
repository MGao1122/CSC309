FROM ubuntu:20.04

# Set environment variables to avoid tzdata prompt
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/New_York

# Install necessary packages
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    nodejs npm \
    openjdk-11-jdk \
    ruby \
    gcc g++ \
    mono-mcs \
    php \
    golang \
    rustc \
    swift \
    perl \
    lua5.3 \
    r-base \
    ghc \
    && apt-get clean
