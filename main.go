package main

import (
	"devops-dashboard/config"
	"devops-dashboard/handlers"
	"devops-dashboard/routes"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {

	config.LoadConfig()

	router := gin.Default()
	
router.Static("/frontend", "./frontend")
router.GET("/", func(c *gin.Context) {
    c.File("./frontend/index.html")
})
	store := cookie.NewStore(
		[]byte("secret"),
	)

	router.Use(
		sessions.Sessions(
			"devops-session",
			store,
		),
	)
	

	handlers.StartMetricCollector()

	// ROUTES
	routes.SetupRoutes(router)

	router.GET(
		"/api/container-logs/:id",
		handlers.GetContainerLogs,
	)

	router.DELETE(
		"/api/container-delete/:name",
		handlers.DeleteContainer,
	)

	// START SERVER
	router.Run(":9090")
}