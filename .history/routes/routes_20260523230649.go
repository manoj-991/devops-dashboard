package routes

import (
	"devops-dashboard/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {

	router.POST(
		"/api/login",
		handlers.Login,
	)

	router.GET(
		"/api/logout",
		handlers.Logout,
	)

	protected :=
		router.Group("/api")

	protected.Use(
		handlers.AuthMiddleware(),
	)

	protected.GET(
		"/health",
		handlers.GetHealth,
	)

	protected.GET(
		"/uptime",
		handlers.GetUptime,
	)

	protected.GET(
		"/cpu",
		handlers.GetCPU,
	)

	protected.GET(
		"/ram",
		handlers.GetRAM,
	)

	protected.GET(
		"/disk",
		handlers.GetDisk,
	)

	protected.GET(
		"/system",
		handlers.GetSystemInfo,
	)

	protected.GET(
		"/docker",
		handlers.GetDockerInfo,
	)

	protected.GET(
		"/processes",
		handlers.GetProcesses,
	)

	protected.GET(
		"/logs",
		handlers.GetLogs,
	)

	protected.GET(
		"/cpu-history",
		handlers.GetCPUHistory,
	)

	protected.GET(
		"/ram-history",
		handlers.GetRAMHistory,
	)

	protected.GET(
		"/network",
		handlers.GetNetworkStats,
	)
	protected.GET(
	"/container-stats",
	handlers.GetContainerStats,
)
protected.GET(
	"/container-logs/:name",
	handlers.GetContainerLogs,
)


protected.GET(
	"/container-logs/:name",
	handlers.GetContainerLogs,
)

protected.POST(
	"/container-restart/:name",
	handlers.RestartContainer,
)

protected.POST(
	"/container-stop/:name",
	handlers.StopContainer,
)

protected.POST(
	"/container-start/:name",
	handlers.StartContainer,
)
}