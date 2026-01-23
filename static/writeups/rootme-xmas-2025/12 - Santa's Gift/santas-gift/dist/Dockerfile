FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-flask \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=root:root --chmod=0755 chall /app/chall

COPY --chown=root:root --chmod=0644 server.py /app/server.py

COPY static /app/static
RUN chown -R root:root /app/static \
    && chmod -R 0755 /app/static


RUN useradd -m chall

COPY --chown=root:root --chmod=0644 flag.txt /app/flag.txt

RUN mkdir /app/uploads \
    && chown root:root /app/uploads \
    && chmod 1733 /app/uploads


USER chall

EXPOSE 8080

CMD ["python3", "/app/server.py"]
