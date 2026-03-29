# Use Playwright base image with Python pre-configured
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

# Set working directory
WORKDIR /app

# Install system dependencies for scrapers and tools
RUN apt-get update && apt-get install -y \
    libxml2-dev \
    libxslt-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install via pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (chromium only for size efficiency)
RUN playwright install chromium

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose the application port
EXPOSE 8080

# Run the FastAPI application using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
