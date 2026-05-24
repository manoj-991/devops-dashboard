package handlers

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

const Username = "admin"
const Password = "admin123"

func Login(c *gin.Context) {

	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err := c.BindJSON(&body)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})
		return
	}

	if body.Username != Username ||
		body.Password != Password {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credentials",
		})
		return
	}

	session := sessions.Default(c)

	session.Set("authenticated", true)
	session.Save()

	WriteAuditLog("Admin logged in")

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
	})
}

func Logout(c *gin.Context) {

	session := sessions.Default(c)

	session.Clear()
	session.Save()

	WriteAuditLog("Admin logged out")

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out",
	})
}

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		session := sessions.Default(c)

		auth := session.Get("authenticated")

		if auth != true {

			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})

			c.Abort()
			return
		}

		c.Next()
	}
}