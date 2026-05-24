# Base image
FROM golang:1.26.3

# Working directory inside container
WORKDIR /app

# Copy go files
COPY go.mod ./
COPY go.sum ./

# Download dependencies
RUN go mod download

# Copy project files
COPY . .

# Build application
RUN go build -o devops-dashboard

# Expose backend port
EXPOSE 8080

# Start application
CMD ["./devops-dashboard"]
