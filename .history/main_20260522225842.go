package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {

	router := gin.Default()

	// frontend route
	router.Static("/frontend", "./frontend")

	// test api
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "running",
			"message": "DevOps Dashboard Backend Working",
		})
	})

	router.Run(":8080")
}