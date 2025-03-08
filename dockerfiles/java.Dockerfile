FROM openjdk:11-jdk-slim
WORKDIR /app
COPY . /app
CMD ["bash", "-c", "javac code.java && java Code"]
