package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

var startTime = time.Now()

func main() {

	router := gin.Default()

	router.Static("/frontend", "./frontend")

	// HEALTH
	router.GET("/api/health", func(c *gin.Context) {

		c.JSON(http.StatusOK, gin.H{
			"status": "running",
		})
	})

	// APP UPTIME
	router.GET("/api/uptime", func(c *gin.Context) {

		uptime := time.Since(startTime)

		c.JSON(http.StatusOK, gin.H{
			"uptime": formatDuration(uptime),
		})
	})

	// CPU
	router.GET("/api/cpu", func(c *gin.Context) {

		percent, err := cpu.Percent(time.Second, false)

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "CPU error",
			})

			return
		}

		c.JSON(http.StatusOK, gin.H{
			"cpu": fmt.Sprintf("%.2f%%", percent[0]),
		})
	})

	// RAM
	router.GET("/api/ram", func(c *gin.Context) {

		vm, err := mem.VirtualMemory()

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "RAM error",
			})

			return
		}

		c.JSON(http.StatusOK, gin.H{
			"ram": fmt.Sprintf("%.2f%%", vm.UsedPercent),
		})
	})

	// DISK
	router.GET("/api/disk", func(c *gin.Context) {

		diskStat, err := disk.Usage("/")

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Disk error",
			})

			return
		}

		c.JSON(http.StatusOK, gin.H{
			"disk": fmt.Sprintf("%.2f%%", diskStat.UsedPercent),
		})
	})

	// HOST INFO
	router.GET("/api/system", func(c *gin.Context) {

		info, err := host.Info()

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Host info error",
			})

			return
		}

		c.JSON(http.StatusOK, gin.H{
			"os":       info.OS,
			"platform": info.Platform,
			"hostname": info.Hostname,
		})
	})

	router.Run(":8080")
}

func formatDuration(duration time.Duration) string {

	hours := int(duration.Hours())

	minutes := int(duration.Minutes()) % 60

	seconds := int(duration.Seconds()) % 60

	return fmt.Sprintf(
		"%dh %dm %ds",
		hours,
		minutes,
		seconds,
	)
}