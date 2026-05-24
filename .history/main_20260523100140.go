package main

import (
	"devops-dashboard/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	router := gin.Default()

	router.Static("/frontend", "./frontend")

	routes.SetupRoutes(router)

	router.Run(":8080")
}