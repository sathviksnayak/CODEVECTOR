# Build once with:
#   docker build -t cpp-judge:16.1.0 -f Dockerfile .
#
# gcc:16.1.0 does not ship GNU time (/usr/bin/time), only bash's
# builtin `time`, which can report wall-clock time but not peak
# memory. We need /usr/bin/time -f "%e:%M" for RSS in KB.
FROM gcc:16.1.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends time \
    && rm -rf /var/lib/apt/lists/*
