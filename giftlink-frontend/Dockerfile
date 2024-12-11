# Use the official Node.js image as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Build the React application
COPY . .
RUN npm run build

# Use nginx to serve the built files
FROM nginx:stable
COPY --from=0 /app/build /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
