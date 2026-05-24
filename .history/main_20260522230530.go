package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

var startTime = time.Now()

func main() {

	router := gin.Default()

	// Serve frontend files
	router.Static("/frontend", "./frontend")

	// Health API
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "running",
			"message": "DevOps Dashboard Backend Working",
		})
	})

	// Uptime API
	router.GET("/api/uptime", func(c *gin.Context) {

		uptime := time.Since(startTime)

		c.JSON(http.StatusOK, gin.H{
			"uptime": formatUptime(uptime),
		})
	})

	router.Run(":8080")
}

func formatUptime(duration time.Duration) string {

	hours := int(duration.Hours())

	minutes := int(duration.Minutes()) % 60

	seconds := int(duration.Seconds()) % 60

	return fmt.Sprintf("%dh %dm %ds",
		hours,
		minutes,
		seconds,
	)
}