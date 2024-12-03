# Use Node.js as the base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock for installing dependencies
COPY ../package.json ../yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY ../ ./

# Ensure Rollup is installed globally (optional but useful for quick debugging)
RUN yarn global add rollup

# Build the application using Rollup
RUN yarn run build

# Install additional dependencies for language support
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    ruby-full \
    golang \
    && rm -rf /var/lib/apt/lists/*

# Expose the application port
ENV PORT 3000

# Optional for documentation purposes
EXPOSE $PORT

# Start the application
CMD ["yarn", "start"]
