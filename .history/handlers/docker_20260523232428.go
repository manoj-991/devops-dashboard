package handlers

import (
	"net/http"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type DockerContainer struct {
	Name   string `json:"name"`
	Image  string `json:"image"`
	State  string `json:"state"`
	Status string `json:"status"`
}

type DockerStat struct {
	Name   string `json:"name"`
	CPU    string `json:"cpu"`
	Memory string `json:"memory"`
}

func GetDockerInfo(c *gin.Context) {

	cmd := exec.Command(
		"docker",
		"ps",
		"-a",
		"--format",
		"{{.Names}}|{{.Image}}|{{.State}}|{{.Status}}",
	)

	output, err := cmd.Output()

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "Docker not available",
			},
		)

		return
	}

	lines := strings.Split(
		strings.TrimSpace(string(output)),
		"\n",
	)

	var containers []DockerContainer

	for _, line := range lines {

		parts := strings.Split(line, "|")

		if len(parts) < 4 {
			continue
		}

		containers = append(
			containers,
			DockerContainer{
				Name:   parts[0],
				Image:  parts[1],
				State:  parts[2],
				Status: parts[3],
			},
		)
	}

	c.JSON(http.StatusOK, containers)
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

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error":
					"Docker stats failed",
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

		stats = append(
			stats,
			DockerStat{
				Name:   parts[0],
				CPU:    parts[1],
				Memory: parts[2],
			},
		)
	}

	c.JSON(http.StatusOK, stats)
}

func GetContainerLogs(c *gin.Context) {

	name := c.Param("name")

	cmd := exec.Command(
		"docker",
		"logs",
		"--tail",
		"50",
		name,
	)

	output, err := cmd.CombinedOutput()

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error":
					"Failed to fetch logs",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs": string(output),
	})
}

func RestartContainer(c *gin.Context) {

	name := c.Param("name")

	cmd := exec.Command(
		"docker",
		"restart",
		name,
	)

	err := cmd.Run()

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error":
					"Restart failed",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":
			"Container restarted",
	})
}