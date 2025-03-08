FROM haskell:9.6
WORKDIR /app
COPY . /app
CMD ["bash", "-c", "ghc -o code code.hs && ./code"]
