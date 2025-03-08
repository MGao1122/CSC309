FROM mono:latest
WORKDIR /app
COPY . /app
CMD ["bash", "-c", "mcs code.cs -out:code.exe && mono code.exe"]
