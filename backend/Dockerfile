FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Render assigns PORT dynamically
ENV PORT=8001
EXPOSE ${PORT}

# Use $PORT so Render can assign its own port
CMD uvicorn server:app --host 0.0.0.0 --port ${PORT}
