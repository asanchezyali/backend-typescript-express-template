# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY ["package.json","package-lock.json","tsconfig.json","tsconfig.build.json","./"]
RUN npm install --omit=dev --ignore-scripts

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]