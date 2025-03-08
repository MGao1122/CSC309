FROM rocker/r-base:4.3.0
WORKDIR /app
COPY . /app
CMD ["Rscript", "code.r"]
