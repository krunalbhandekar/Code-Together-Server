#!/bin/bash

# Check if python3 is installed
if ! command -v python3 &> /dev/null
then
    echo "python3 could not be found, installing..."
    apt-get update && apt-get install -y python3 python3-pip
else
    echo "python3 is already installed"
fi

# Check if python is installed as well
if ! command -v python &> /dev/null
then
    echo "python could not be found, creating symlink to python3..."
    ln -s /usr/bin/python3 /usr/bin/python
else
    echo "python is already installed"
fi

# Install g++ if not installed
if ! command -v g++ &> /dev/null
then
    echo "g++ could not be found, installing..."
    apt-get update && apt-get install -y g++
else
    echo "g++ is already installed"
fi

# Install dependencies
npm install
