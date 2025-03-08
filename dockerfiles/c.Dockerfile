FROM gcc:12.2.0
WORKDIR /app
COPY . /app
CMD ["bash", "-c", "gcc code.c -o code && ./code"]
