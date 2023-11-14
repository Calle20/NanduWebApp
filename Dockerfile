# Use Node.js 14, name this stage 'frontend'
FROM node:latest AS frontend

# Our working directory within the image
WORKDIR /build

# Copy package and lock files then install dependencies
COPY package.json .             
COPY package-lock.json .
RUN npm install --force

# Copy the rest of the files for the frontend
COPY rollup.config.js .
COPY svelte-app ./svelte-app

# Build - this'll output files to /build/wwwroot
RUN npm run build



# Use .NET Core SDK, name this stage 'backend'
FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS backend
WORKDIR /build

# Copy the csproj file then install dependencies
COPY NanduWebApp.csproj .
RUN dotnet restore NanduWebApp.csproj

# Copy everything else
COPY . .

# Publish, and output the results to /publish
RUN dotnet publish -c Release -o /publish


# ASP.NET Core Runtime
FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine

# Where our application will live
WORKDIR /app

# Copy the build results of the frontend stage
COPY --from=frontend /build/wwwroot ./wwwroot

# Copy the build results of the backend stage
COPY --from=backend /publish .

# Run our web application on startup (will listen on port 80 by default)
ENTRYPOINT /app/NanduWebApp

# Expose port 80
EXPOSE 80