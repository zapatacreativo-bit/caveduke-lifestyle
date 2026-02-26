FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on package-lock.json (if available) or package.json
COPY package*.json ./
RUN npm install

# Copy all files and build the Astro project
COPY . .
RUN npm run build

# Use Nginx to serve the static site
FROM nginx:alpine

# Copy the generated build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
