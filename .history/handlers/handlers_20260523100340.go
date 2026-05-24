package handlers

import (
	"fmt"
	"net/http"
	"os/exec"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
)

var startTime = time.Now()

type ProcessInfo struct {
	Name string  `json:"name"`
	CPU  float64 `json:"cpu"`
}

func GetHealth(c *gin.Context) {

	c.JSON(http.StatusOK, gin.H{
		"status": "running",
	})
}

func GetUptime(c *gin.Context) {

	uptime := time.Since(startTime)

	c.JSON(http.StatusOK, gin.H{
		"uptime": formatDuration(uptime),
	})
}

func GetCPU(c *gin.Context) {

	percent, err := cpu.Percent(time.Second, false)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "CPU error",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cpu": fmt.Sprintf("%.2f%%", percent[0]),
	})
}

func GetRAM(c *gin.Context) {

	vm, err := mem.VirtualMemory()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "RAM error",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ram": fmt.Sprintf("%.2f%%", vm.UsedPercent),
	})
}

func GetDisk(c *gin.Context) {

	diskStat, err := disk.Usage("C:")

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Disk error",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"disk": fmt.Sprintf("%.2f%%", diskStat.UsedPercent),
	})
}

func GetSystemInfo(c *gin.Context) {

	info, err := host.Info()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "System error",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"os":       info.OS,
		"platform": info.Platform,
		"hostname": info.Hostname,
	})
}

func GetDockerInfo(c *gin.Context) {

	cmd := exec.Command(
		"docker",
		"ps",
		"-a",
		"--format",
		"{{.State}}",
	)

	output, err := cmd.Output()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Docker not available",
		})

		return
	}

	lines := strings.Split(
		strings.TrimSpace(string(output)),
		"\n",
	)

	running := 0
	stopped := 0

	for _, state := range lines {

		if state == "running" {

			running++

		} else if state != "" {

			stopped++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"running": running,
		"stopped": stopped,
		"total":   running + stopped,
	})
}

func GetProcesses(c *gin.Context) {

	processes, err := process.Processes()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get processes",
		})

		return
	}

	var processList []ProcessInfo

	for _, p := range processes {

		name, err := p.Name()

		if err != nil {
			continue
		}

		cpuPercent, err := p.CPUPercent()

		if err != nil {
			continue
		}

		processList = append(processList, ProcessInfo{
			Name: name,
			CPU:  cpuPercent,
		})
	}

	sort.Slice(processList, func(i, j int) bool {
		return processList[i].CPU >
			processList[j].CPU
	})

	if len(processList) > 5 {
		processList = processList[:5]
	}

	c.JSON(http.StatusOK, processList)
}

func formatDuration(duration time.Duration) string {

	hours := int(duration.Hours())

	minutes := int(duration.Minutes()) % 60

	seconds := int(duration.Seconds()) % 60

	return fmt.Sprintf(
		"%dh %dm %ds",
		hours,
		minutes,
		seconds,
	)
}