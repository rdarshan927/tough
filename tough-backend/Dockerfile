# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data and tokens directories
RUN mkdir -p data tokens

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=src/app.py

# Expose port
EXPOSE 3001

# Run the application
CMD ["python", "-m", "src.app"]
