FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render sets this dynamically, but good for documentation)
ENV PORT=8000
EXPOSE 8000

# Run the application
# Use host 0.0.0.0 to be accessible from outside the container
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port \${PORT:-8000}"
