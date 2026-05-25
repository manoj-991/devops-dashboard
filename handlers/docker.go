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

// =========================
// GET ALL CONTAINERS
// =========================
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Docker not available",
		})
		return
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")

	var containers []DockerContainer

	for _, line := range lines {

		parts := strings.Split(line, "|")

		if len(parts) < 4 {
			continue
		}

		containers = append(containers, DockerContainer{
			Name:   parts[0],
			Image:  parts[1],
			State:  parts[2],
			Status: parts[3],
		})
	}

	c.JSON(http.StatusOK, containers)
}

// =========================
// GET CONTAINER STATS
// =========================
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Docker stats failed",
		})
		return
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")

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

// =========================
// GET CONTAINER LOGS
// =========================
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch logs",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs": string(output),
	})
}

// =========================
// RESTART CONTAINER
// =========================
func RestartContainer(c *gin.Context) {

	name := c.Param("name")

	cmd := exec.Command(
		"docker",
		"restart",
		name,
	)

	err := cmd.Run()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Restart failed",
		})
		return
	}

	WriteAuditLog("Container restarted: " + name)

	c.JSON(http.StatusOK, gin.H{
		"message": "Container restarted successfully",
	})
}

// =========================
// START CONTAINER
// =========================
func StartContainer(c *gin.Context) {

	name := c.Param("name")

	cmd := exec.Command(
		"docker",
		"start",
		name,
	)

	err := cmd.Run()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Start failed",
		})
		return
	}

	WriteAuditLog("Container started: " + name)

	c.JSON(http.StatusOK, gin.H{
		"message": "Container started successfully",
	})
}

// =========================
// STOP CONTAINER
// =========================
func StopContainer(c *gin.Context) {

	name := c.Param("name")

	cmd := exec.Command(
		"docker",
		"stop",
		name,
	)

	err := cmd.Run()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to stop container",
		})
		return
	}

	WriteAuditLog("Container stopped: " + name)

	c.JSON(http.StatusOK, gin.H{
		"message": "Container stopped successfully",
	})
}

	
// DELETE CONTAINER
// =========================

func DeleteContainer(c *gin.Context) {

	name := c.Param("name")

	cmd := exec.Command(
		"docker",
		"rm",
		"-f",
		name,
	)

	err := cmd.Run()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Delete failed",
		})

		return
	}

	WriteAuditLog("Container deleted: " + name)

	c.JSON(http.StatusOK, gin.H{
		"message": "Container deleted successfully",
	})
}