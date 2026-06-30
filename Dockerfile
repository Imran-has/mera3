# Step 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Cloud Run / Cloud Build will pass the Gemini API Key as an argument
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Build the Vite application for production
RUN npm run build

# Step 2: Serve the app using Nginx
FROM nginx:alpine

# Copy our custom Nginx configuration to support client-side routing and Cloud Run's port
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run's default expected port)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
