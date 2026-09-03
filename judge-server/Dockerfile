# Build once with:
#   docker build -t cpp-judge:latest -f judge.Dockerfile .
#
# gcc:latest does not ship GNU time (/usr/bin/time), only bash's
# builtin `time`, which can report wall-clock time but not peak
# memory. We need /usr/bin/time -f "%e:%M" for RSS in KB.
FROM gcc:latest

RUN apt-get update \
    && apt-get install -y --no-install-recommends time \
    && rm -rf /var/lib/apt/lists/*
