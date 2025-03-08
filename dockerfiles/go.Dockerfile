FROM golang:1.21
WORKDIR /app
COPY . /app
CMD ["go", "run", "code.go"]
