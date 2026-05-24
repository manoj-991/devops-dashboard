package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var Port string

var CPUAlert int

var RAMAlert int

var MetricInterval int

func LoadConfig() {

	err := godotenv.Load()

	if err != nil {

		log.Fatal("Error loading .env")
	}

	Port =
		os.Getenv("PORT")

	CPUAlert, _ =
		strconv.Atoi(
			os.Getenv("CPU_ALERT"),
		)

	RAMAlert, _ =
		strconv.Atoi(
			os.Getenv("RAM_ALERT"),
		)

	MetricInterval, _ =
		strconv.Atoi(
			os.Getenv("METRIC_INTERVAL"),
		)
}