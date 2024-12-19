#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found, installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
else
    echo "Docker is already installed"
fi

# Pull required Docker images
docker pull node:latest
docker pull openjdk:latest
docker pull python:latest
docker pull ruby:latest
docker pull golang:latest

# Start the Node.js application
nodemon src/server.js