# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Run stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from the build stage
COPY --from=builder /app/server .

# Expose the port (Render sets PORT env var)
EXPOSE 8081

CMD ["./server"]
