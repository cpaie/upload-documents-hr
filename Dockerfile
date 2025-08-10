# Use the official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (use npm ci for faster, reliable builds)
RUN npm ci --omit=dev

# Copy the server file
COPY server-gcs.js ./

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV GCS_PROJECT_ID=famous-store-468216-p6
ENV GCS_BUCKET_NAME=pdf-upload-myapp

# Start the application
CMD ["node", "server-gcs.js"]
