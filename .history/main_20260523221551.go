package main

import (
	"devops-dashboard/config"
	"devops-dashboard/handlers"
	"devops-dashboard/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	config.LoadConfig()

	router := gin.Default()

	router.Static(
		"/frontend",
		"./frontend",
	)

	handlers.StartMetricCollector()

	routes.SetupRoutes(router)

	router.Run(":" + config.Port)
}