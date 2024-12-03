# Use Node.js as the base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application code (from the src folder)
COPY ./src ./src

# Ensure nodemon is installed globally (optional but useful for quick debugging)
RUN npm install -g nodemon

# Expose the application port
ENV PORT 3000

# Optional for documentation purposes
EXPOSE $PORT

# Start the application using npm
CMD ["npm", "run", "start"]
