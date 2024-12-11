# Use a Node.js base image
FROM node:18.12.1-bullseye-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the port
EXPOSE 9000

# Start the application
CMD ["npm", "start"]
