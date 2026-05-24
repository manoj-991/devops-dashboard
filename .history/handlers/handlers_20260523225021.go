package handlers

import (
	"net/http"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type DockerStat struct {
	Name   string `json:"name"`
	CPU    string `json:"cpu"`
	Memory string `json:"memory"`
}

func GetContainerStats(c *gin.Context) {

	cmd := exec.Command(
		"docker",
		"stats",
		"--no-stream",
		"--format",
		"{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}",
	)

	output, err := cmd.Output()

	if err != nil {

		c.JSON(http.StatusInternalServerError,
			gin.H{
				"error": "Docker stats failed",
			},
		)

		return
	}

	lines := strings.Split(
		strings.TrimSpace(string(output)),
		"\n",
	)

	var stats []DockerStat

	for _, line := range lines {

		parts := strings.Split(line, "|")

		if len(parts) < 3 {
			continue
		}

		stats = append(stats, DockerStat{
			Name:   parts[0],
			CPU:    parts[1],
			Memory: parts[2],
		})
	}

	c.JSON(http.StatusOK, stats)
}