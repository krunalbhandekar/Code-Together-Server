# Use official Node.js image as the base image
FROM node:18-slim

# Install additional services (Ruby, Java, Python)
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    ruby-full \
    python3 \
    python3-pip \
    golang \
    && apt-get clean

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install Node.js dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose ports for each service (e.g., 3000 for Node.js)
EXPOSE 3000

# Start the services (use a custom entrypoint script if needed)
CMD ["npm", "start"]
