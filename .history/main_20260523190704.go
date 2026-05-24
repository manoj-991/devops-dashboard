package main

import (
	"devops-dashboard/handlers"
	"devops-dashboard/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	router := gin.Default()

	router.Static("/frontend", "./frontend")

	// Start background metrics collector
	handlers.StartMetricCollector()

	// Register API routes
	routes.SetupRoutes(router)

	// Start server
	router.Run(":8080")
}