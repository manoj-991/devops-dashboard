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

# ---------- BUILD STAGE ----------
FROM golang:1.25 AS builder

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# ---------- FINAL STAGE ----------
FROM gcr.io/distroless/static-debian12

WORKDIR /

COPY --from=builder /app/main /main
COPY --from=builder /app/frontend /frontend

EXPOSE 8080

ENTRYPOINT ["/main"]
