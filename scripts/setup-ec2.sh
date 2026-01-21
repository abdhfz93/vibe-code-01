#!/bin/bash
# Setup script for EC2 (Ubuntu) to install Docker and Docker Compose

# 1. Update system
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install Docker
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 3. Enable Docker for current user
sudo usermod -aG docker $USER

# 4. Install Docker Compose (v2)
sudo apt-get install -y docker-compose

echo "Setup complete! Please log out and log back in for group changes to take effect."
