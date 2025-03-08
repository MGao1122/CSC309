FROM gcc:12.2.0
WORKDIR /app
COPY . /app
CMD ["bash", "-c", "g++ code.cpp -o code && ./code"]
