FROM python:3.11-alpine AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apk add --no-cache --virtual .build-deps \
    gcc \
    g++ \
    musl-dev \
    linux-headers \
    libffi-dev \
    openblas-dev \
    lapack-dev \
    gfortran

COPY requirements.txt .

RUN pip install --no-cache-dir \
    numpy \
    && pip install --no-cache-dir -r requirements.txt

RUN apk del .build-deps

FROM python:3.11-alpine AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apk add --no-cache \
    libstdc++ \
    openblas \
    lapack

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY main.py .

RUN adduser -D -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8002/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "2"]