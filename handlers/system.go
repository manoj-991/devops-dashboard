package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemMetrics struct {
	CPUUsage  float64 `json:"cpu"`
	RAMUsage  float64 `json:"ram"`
	DiskUsage float64 `json:"disk"`
	Uptime    string  `json:"uptime"`
}

func GetSystemMetrics(c *gin.Context) {

	// CPU
	cpuPercent, _ := cpu.Percent(time.Second, false)

	// RAM
	vmStat, _ := mem.VirtualMemory()

	// Disk
	diskStat, _ := disk.Usage("/")

	// Uptime
	hostStat, _ := host.Info()

	uptime := formatUptime(hostStat.Uptime)

	metrics := SystemMetrics{
		CPUUsage:  cpuPercent[0],
		RAMUsage:  vmStat.UsedPercent,
		DiskUsage: diskStat.UsedPercent,
		Uptime:    uptime,
	}

	c.JSON(http.StatusOK, metrics)
}

func formatUptime(seconds uint64) string {

	duration := time.Duration(seconds) * time.Second

	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60
	secs := int(duration.Seconds()) % 60

	return fmt.Sprintf("%dh %dm %ds", hours, minutes, secs)
}