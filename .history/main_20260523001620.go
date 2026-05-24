package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/cpu"
)

var startTime = time.Now()

func main() {

	router := gin.Default()

	router.Static("/frontend", "./frontend")

	// Health API
	router.GET("/api/health", func(c *gin.Context) {

		c.JSON(http.StatusOK, gin.H{
			"status": "running",
		})
	})

	// Uptime API
	router.GET("/api/uptime", func(c *gin.Context) {

		uptime := time.Since(startTime)

		c.JSON(http.StatusOK, gin.H{
			"uptime": formatUptime(uptime),
		})
	})

	// CPU API
	router.GET("/api/cpu", func(c *gin.Context) {

		percent, err := cpu.Percent(time.Second, false)

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to get CPU usage",
			})

			return
		}

		c.JSON(http.StatusOK, gin.H{
			"cpu_usage": fmt.Sprintf("%.2f%%", percent[0]),
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