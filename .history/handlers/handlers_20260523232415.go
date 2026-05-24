package handlers

import (
	"devops-dashboard/config"
	"fmt"
	"net/http"
	"os"
	"sort"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

var startTime = time.Now()

type MetricPoint struct {
	Time  string  `json:"time"`
	Value float64 `json:"value"`
}

type ProcessInfo struct {
	Name string  `json:"name"`
	CPU  float64 `json:"cpu"`
}

var CPUHistory []MetricPoint
var RAMHistory []MetricPoint

func StartMetricCollector() {

	go func() {

		for {

			cpuPercent, _ :=
				cpu.Percent(time.Second, false)

			vm, _ :=
				mem.VirtualMemory()

			currentTime :=
				time.Now().Format("04:05")

			CPUHistory = append(
				CPUHistory,
				MetricPoint{
					Time:  currentTime,
					Value: cpuPercent[0],
				},
			)

			RAMHistory = append(
				RAMHistory,
				MetricPoint{
					Time:  currentTime,
					Value: vm.UsedPercent,
				},
			)

			if len(CPUHistory) > 20 {

				CPUHistory = CPUHistory[1:]
			}

			if len(RAMHistory) > 20 {

				RAMHistory = RAMHistory[1:]
			}

			time.Sleep(
				time.Duration(
					config.MetricInterval,
				) * time.Second,
			)
		}
	}()
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

	percent, err :=
		cpu.Percent(time.Second, false)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "CPU error",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cpu":
			fmt.Sprintf("%.2f%%", percent[0]),
	})
}

func GetRAM(c *gin.Context) {

	vm, err := mem.VirtualMemory()

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "RAM error",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ram":
			fmt.Sprintf("%.2f%%", vm.UsedPercent),
	})
}

func GetDisk(c *gin.Context) {

	diskStat, err :=
		disk.Usage("/")

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "Disk error",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"disk":
			fmt.Sprintf("%.2f%%",
				diskStat.UsedPercent),
	})
}

func GetSystemInfo(c *gin.Context) {

	info, err := host.Info()

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "System error",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"os":       info.OS,
		"platform": info.Platform,
		"hostname": info.Hostname,
	})
}

func GetProcesses(c *gin.Context) {

	processes, err :=
		process.Processes()

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error":
					"Failed to get processes",
			},
		)

		return
	}

	var processList []ProcessInfo

	for _, p := range processes {

		name, err := p.Name()

		if err != nil {
			continue
		}

		cpuPercent, err :=
			p.CPUPercent()

		if err != nil {
			continue
		}

		processList = append(
			processList,
			ProcessInfo{
				Name: name,
				CPU:  cpuPercent,
			},
		)
	}

	sort.Slice(
		processList,
		func(i, j int) bool {

			return processList[i].CPU >
				processList[j].CPU
		},
	)

	if len(processList) > 5 {

		processList = processList[:5]
	}

	c.JSON(http.StatusOK, processList)
}

func GetLogs(c *gin.Context) {

	logFile := "logs/app.log"

	data, err := os.ReadFile(logFile)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error":
					"Cannot read logs",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs": string(data),
	})
}

func GetCPUHistory(c *gin.Context) {

	c.JSON(http.StatusOK, CPUHistory)
}

func GetRAMHistory(c *gin.Context) {

	c.JSON(http.StatusOK, RAMHistory)
}

func GetNetworkStats(c *gin.Context) {

	stats, err :=
		net.IOCounters(false)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error":
					"Network stats error",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{

		"bytes_sent":
			stats[0].BytesSent,

		"bytes_received":
			stats[0].BytesRecv,
	})
}

func GetConnections(c *gin.Context) {

	connections, err :=
		net.Connections("all")

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error":
					"Connections failed",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"connections":
			len(connections),
	})
}

func formatDuration(
	duration time.Duration,
) string {

	hours :=
		int(duration.Hours())

	minutes :=
		int(duration.Minutes()) % 60

	seconds :=
		int(duration.Seconds()) % 60

	return fmt.Sprintf(
		"%dh %dm %ds",
		hours,
		minutes,
		seconds,
	)
}