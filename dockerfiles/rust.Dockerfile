FROM rust:1.73
WORKDIR /app
COPY . /app
CMD ["bash", "-c", "rustc code.rs -o code && ./code"]
