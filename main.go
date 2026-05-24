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

	store :=
		cookie.NewStore(
			[]byte("secret"),
		)

	router.Use(
		sessions.Sessions(
			"devops-session",
			store,
		),
	)

	router.Static(
		"/frontend",
		"./frontend",
	)

	handlers.StartMetricCollector()

	routes.SetupRoutes(router)

	router.Run(":" + config.Port)
}