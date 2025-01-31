# Stage 1: Build the static files using Bun
FROM oven/bun:latest AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY bun.lock package.json ./

# Install dependencies
RUN bun install

# Copy the rest of the project files
COPY . .

# Build the static files
RUN bun run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine AS server

# Set the working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx index page
RUN rm -rf ./*

# Copy built files from the builder stage
COPY --from=builder /app/dist .

# Set up a default Nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
    error_page 404 /index.html; \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
