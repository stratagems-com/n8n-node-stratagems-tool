#!/bin/bash

# Simple deployment script for ST Open Source
echo "Building and pushing ST Open Source image..."

# Configuration
DOCKER_USERNAME="naim090301"
IMAGE_NAME="st-os"
TAG="latest"

# Build the image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} ../st-open-source

# Tag for Docker Hub
echo "Tagging image for Docker Hub..."
docker tag ${IMAGE_NAME}:${TAG} ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}

# Push to Docker Hub
echo "Pushing image to Docker Hub..."
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}

echo "Deployment completed! Run 'docker-compose up -d' to start the services." 