package routes

import (
	"devops-dashboard/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	router.GET("/api/health", handlers.GetHealth)

	router.GET("/api/uptime", handlers.GetUptime)

	router.GET("/api/cpu", handlers.GetCPU)

	router.GET("/api/ram", handlers.GetRAM)

	router.GET("/api/disk", handlers.GetDisk)

	router.GET("/api/system", handlers.GetSystemInfo)

	router.GET("/api/docker", handlers.GetDockerInfo)

	router.GET("/api/processes", handlers.GetProcesses)

	router.GET("/api/logs", handlers.GetLogs)
}