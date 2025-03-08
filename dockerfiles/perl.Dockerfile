FROM perl:5.38
WORKDIR /app
COPY . /app
CMD ["perl", "code.pl"]
