package handlers

import (
	"os"
	"time"
)

const auditFile =
	"logs/audit.log"

func WriteAuditLog(
	event string,
) {

	file, err := os.OpenFile(
		auditFile,
		os.O_APPEND|
			os.O_CREATE|
			os.O_WRONLY,
		0644,
	)

	if err != nil {
		return
	}

	defer file.Close()

	log :=
		"[" +
			time.Now().Format(
				"2006-01-02 03:04:05 PM",
			) +
			"] " +
			event +
			"\n"

	file.WriteString(log)
}