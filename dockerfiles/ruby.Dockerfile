FROM ruby:3.2-slim
WORKDIR /app
COPY . /app
CMD ["ruby", "code.rb"]
