const cpuCanvas =
    document.getElementById("cpuChart")

const ramCanvas =
    document.getElementById("ramChart")

let cpuChart
let ramChart

async function fetchData(url) {

    try {

        const response =
            await fetch(url)

        return await response.json()

    } catch (error) {

        console.error(error)

        return null
    }
}

async function containerAction(
    action,
    name
) {

    try {

        await fetch(
            `/api/container-${action}/${name}`,
            {
                method: "POST"
            }
        )

        loadDashboard()

    } catch (error) {

        console.error(error)
    }
}

function safeValue(value, fallback = "N/A") {

    if (
        value === undefined ||
        value === null
    ) {

        return fallback
    }

    return value
}

async function loadDashboard() {

    const [
        health,
        uptime,
        cpu,
        ram,
        disk,
        docker,
        stats,
        logs,
        cpuHistory,
        ramHistory,
        network,
        processes,
        system,
        ports,
        services
    ] = await Promise.all([

        fetchData("/api/health"),
        fetchData("/api/uptime"),
        fetchData("/api/cpu"),
        fetchData("/api/ram"),
        fetchData("/api/disk"),
        fetchData("/api/docker"),
        fetchData("/api/container-stats"),
        fetchData("/api/logs"),
        fetchData("/api/cpu-history"),
        fetchData("/api/ram-history"),
        fetchData("/api/network"),
        fetchData("/api/processes"),
        fetchData("/api/system"),
        fetchData("/api/ports"),
        fetchData("/api/services")
    ])

    /* REFRESH */

    document.getElementById(
        "lastRefresh"
    ).innerText =
        "Last Refresh: " +
        new Date()
            .toLocaleTimeString()

    /* METRICS */

    const cpuUsage =
        safeValue(cpu?.usage || cpu?.cpu, "0%")

    const ramUsage =
        safeValue(ram?.usage || ram?.ram, "0%")

    const diskUsage =
        safeValue(disk?.usage || disk?.disk, "0%")

    document.getElementById(
        "health"
    ).innerText =
        safeValue(health?.status, "running")

    document.getElementById(
        "uptime"
    ).innerText =
        safeValue(uptime?.uptime, "0m")

    document.getElementById(
        "cpu"
    ).innerText =
        cpuUsage

    document.getElementById(
        "ram"
    ).innerText =
        ramUsage

    document.getElementById(
        "disk"
    ).innerText =
        diskUsage

    document.getElementById(
        "cpuBar"
    ).style.width =
        cpuUsage

    document.getElementById(
        "ramBar"
    ).style.width =
        ramUsage

    document.getElementById(
        "diskBar"
    ).style.width =
        diskUsage

    /* ALERT SYSTEM */

    let alertsHTML = ""

    let criticalCount = 0
    let warningCount = 0
    let infoCount = 0

    const cpuNumber =
        parseFloat(cpuUsage)

    const ramNumber =
        parseFloat(ramUsage)

    const diskNumber =
        parseFloat(diskUsage)

    /* =========================
       CRITICAL ALERTS
    ========================= */

    if (cpuNumber >= 95) {

        criticalCount++

        alertsHTML += `

    <div class="alert-item alert-critical">

        <div>

            🔴 CPU usage critically high
            (${cpuUsage})

        </div>

        <div class="alert-meta">

            Immediate investigation required

        </div>

    </div>
    `
    }

    if (ramNumber >= 90) {

        criticalCount++

        alertsHTML += `

    <div class="alert-item alert-critical">

        <div>

            🔴 RAM usage critically high
            (${ramUsage})

        </div>

        <div class="alert-meta">

            Possible system instability

        </div>

    </div>
    `
    }

    if (diskNumber >= 85) {

        criticalCount++

        alertsHTML += `

    <div class="alert-item alert-critical">

        <div>

            🔴 Disk usage critically high
            (${diskUsage})

        </div>

        <div class="alert-meta">

            Storage capacity nearing limit

        </div>

    </div>
    `
    }

    /* =========================
       WARNING ALERTS
    ========================= */

    if (cpuNumber >= 75 &&
        cpuNumber < 95) {

        warningCount++

        alertsHTML += `

    <div class="alert-item alert-warning">

        <div>

            🟡 CPU usage elevated
            (${cpuUsage})

        </div>

        <div class="alert-meta">

            Monitor workload trends

        </div>

    </div>
    `
    }

    if (ramNumber >= 80 &&
        ramNumber < 90) {

        warningCount++

        alertsHTML += `

    <div class="alert-item alert-warning">

        <div>

            🟡 RAM usage elevated
            (${ramUsage})

        </div>

        <div class="alert-meta">

            Memory consumption increasing

        </div>

    </div>
    `
    }

    if (diskNumber >= 70 &&
        diskNumber < 85) {

        warningCount++

        alertsHTML += `

    <div class="alert-item alert-warning">

        <div>

            🟡 Disk usage elevated
            (${diskUsage})

        </div>

        <div class="alert-meta">

            Cleanup recommended soon

        </div>

    </div>
    `
    }

    /* =========================
       CONTAINER HEALTH
    ========================= */

    if (Array.isArray(stats)) {

        stats.forEach(stat => {

            const cpuStat =
                parseFloat(stat.cpu)

            if (cpuStat >= 80) {

                warningCount++

                alertsHTML += `

            <div class="alert-item alert-warning">

                <div>

                    🟡 High container CPU:
                    ${stat.name}

                </div>

                <div class="alert-meta">

                    ${stat.cpu} CPU usage

                </div>

            </div>
            `
            }
        })
    }

    /* =========================
       HEALTH STATUS
    ========================= */

    if (
        health &&
        health.status &&
        health.status !== "running"
    ) {

        criticalCount++

        alertsHTML += `

    <div class="alert-item alert-critical">

        <div>

            🔴 Backend health degraded

        </div>

        <div class="alert-meta">

            API status abnormal

        </div>

    </div>
    `
    }

    /* =========================
       HEALTHY STATE
    ========================= */

    if (alertsHTML === "") {
        infoCount++

        alertsHTML += `

<div class="alert-item alert-good">

    <div>

        🟢 Monitoring system healthy

    </div>

    <div class="alert-meta">

        Automated infrastructure checks
        running every 10 minutes

    </div>

</div>

    `
    }

    /* =========================
       ALERT HEADER COUNTS
    ========================= */

    const alertSummary = `

<div class="alert-summary">

    <span class="critical-counter">

        🔴 ${criticalCount} Critical

    </span>

    <span class="warning-counter">

        🟡 ${warningCount} Warning

    </span>

    <span class="info-counter">

        🔵 ${infoCount} Info

    </span>

</div>

`

    document.getElementById(
        "alerts"
    ).innerHTML =
        alertSummary +
        alertsHTML

    /* DOCKER */

    let dockerHTML = ""

    if (Array.isArray(docker)) {

        docker.forEach(container => {

            const badge =
                container.state === "running"
                    ? "running-badge"
                    : "stopped-badge"

            dockerHTML += `
            <tr>

                <td>

                    ${Math.random()
                    .toString(16)
                    .substring(2, 9)}

                </td>

                <td>

                    ${container.name}

                </td>

                <td>

                    ${container.image}

                </td>

                <td>

                    <span class="${badge}">

                        ${container.state}

                    </span>

                </td>

                <td>

                    80/tcp

                </td>

                <td>

                   <div class="actions">

    <button
        class="text-btn start-btn"
        onclick="containerAction(
            'start',
            '${container.name}'
        )"
    >
        Start
    </button>

    <button
        class="text-btn restart-btn"
        onclick="containerAction(
            'restart',
            '${container.name}'
        )"
    >
        Restart
    </button>

   <button
    class="text-btn logs-btn"
    onclick="openLogs('${container.name}')"
>
    Logs
</button>

</div>
                </td>

            </tr>
            `
        })
    }

    document.getElementById(
        "docker"
    ).innerHTML =
        dockerHTML

    /* STATS */

    let statsHTML = ""

    if (Array.isArray(stats)) {

        statsHTML += `

    <table class="metrics-table">

        <thead>

            

        </thead>

        <tbody>
    `

        stats.forEach(stat => {
            statsHTML += `

<div class="metric-row">

    <div class="metric-col metric-name">

        ${stat.name}

    </div>

    <div class="metric-col">

        ${stat.cpu}

    </div>

    <div class="metric-col">

        ${stat.memory}

    </div>

</div>
`
        })

        statsHTML += `
        </tbody>

    </table>
    `
    }
    document.getElementById(
        "containerStats"
    ).innerHTML = `

<div class="metric-header">

    <div class="metric-col metric-name">

        CONTAINER

    </div>

    <div class="metric-col">

        CPU

    </div>

    <div class="metric-col">

        MEMORY

    </div>

</div>

${statsHTML}
`

    /* LOGS */
    let logContent =
        "No logs available"

    if (logs) {

        if (typeof logs === "string") {

            logContent =
                logs

        } else if (logs.logs) {

            logContent =
                logs.logs
        }
    }

    document.getElementById(
        "logs"
    ).innerText =
        logContent

    document.getElementById(
        "auditLogs"
    ).innerText =
        `
[INFO] Dashboard refreshed
[INFO] Monitoring active
[INFO] Containers healthy
`

    /* =========================
     NETWORK
  ========================= */

    let upload =
        "N/A"

    let download =
        "N/A"

    if (network) {

        upload =
            network.upload ||
            network.Upload ||
            "N/A"

        download =
            network.download ||
            network.Download ||
            "N/A"
    }

    document.getElementById(
        "network"
    ).innerHTML =
        `
<div>

    <b>Upload:</b>
    ${upload}

</div>

<br>

<div>

    <b>Download:</b>
    ${download}

</div>
`

    /* =========================
       PORTS
    ========================= */

    let portsHTML = ""

    if (Array.isArray(ports)) {

        ports.forEach(port => {

            portsHTML += `

        <div style="
        padding:8px 0;
        border-bottom:
        1px solid #e5e7eb;
        ">

            🔌 ${port}

        </div>
        `
        })

    } else if (typeof ports === "string") {

        portsHTML = `

    <div>

        🔌 ${ports}

    </div>
    `
    } else {

        portsHTML = `

    <div>

        No active ports detected

    </div>
    `
    }

    document.getElementById(
        "ports"
    ).innerHTML =
        portsHTML

    /* PROCESSES */

    let processHTML = ""

    if (Array.isArray(processes)) {

        processes.forEach(process => {

            processHTML += `
            <div>

                <b>

                    ${safeValue(process.name)}

                </b>

                <br>

                CPU:
                ${safeValue(process.cpu)}

            </div>
            `
        })
    }

    document.getElementById(
        "processes"
    ).innerHTML =
        processHTML

    /* SYSTEM */

    document.getElementById(
        "system"
    ).innerHTML =
        `
    OS:
    ${safeValue(system?.os)}

    <br><br>

    Platform:
    ${safeValue(system?.platform)}

    <br><br>

    Host:
    ${safeValue(system?.hostname)}
    `
    /* SERVICES */

    let servicesHTML = ""

    if (Array.isArray(services)) {

        services.forEach(service => {

            servicesHTML += `

        <div class="service-row">

            <div class="service-name">
                ${service.name}
            </div>

            <div class="service-status running-badge">
                ${service.status}
            </div>

        </div>
        `
        })
    }

    document.getElementById("services").innerHTML =
        servicesHTML

    /* =========================
    CPU + RAM CHARTS
 ========================= */

    if (cpuChart) {

        cpuChart.destroy()
    }

    if (ramChart) {

        ramChart.destroy()
    }

    /* TIME LABELS */

    const labels =
        cpuHistory.map(
            item => item.time
        )

    /* CPU */

    cpuChart = new Chart(
        cpuCanvas,
        {

            type: "line",

            data: {

                labels: labels,

                datasets: [{

                    label: "CPU Usage %",

                    data:
                        cpuHistory.map(
                            item => item.value
                        ),

                    borderColor: "#3b82f6",

                    backgroundColor:
                        "rgba(59,130,246,0.15)",

                    fill: true,

                    tension: 0.45,

                    pointRadius: 4,

                    pointHoverRadius: 7,

                    pointBackgroundColor: "#3b82f6",

                    borderWidth: 3
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false
                },

                plugins: {

                    legend: {

                        display: true,

                        labels: {

                            font: {
                                size: 14,
                                weight: "bold"
                            }
                        }
                    },

                    tooltip: {

                        enabled: true,

                        backgroundColor: "#111827",

                        titleColor: "#ffffff",

                        bodyColor: "#ffffff",

                        padding: 12,

                        cornerRadius: 10,

                        displayColors: true,

                        callbacks: {

                            label: function (context) {

                                return `CPU Usage: ${context.raw}%`
                            }
                        }
                    }
                },

                scales: {

                    y: {

                        beginAtZero: true,

                        max: 100,

                        ticks: {

                            stepSize: 10,

                            color: "#64748b",

                            font: {
                                size: 12
                            }
                        },

                        title: {

                            display: true,

                            text: "CPU Usage %",

                            font: {
                                size: 14,
                                weight: "bold"
                            }
                        },

                        grid: {

                            color: "rgba(148,163,184,0.15)"
                        }
                    },

                    x: {

                        ticks: {

                            color: "#64748b",

                            maxRotation: 35,

                            minRotation: 35,

                            autoSkip: true,

                            maxTicksLimit: 8
                        },

                        title: {

                            display: true,

                            text: "Time (5 sec interval)",

                            font: {
                                size: 13,
                                weight: "bold"
                            }
                        },

                        grid: {

                            color: "rgba(148,163,184,0.1)"
                        }
                    }
                }
            }
        }
    )

    /* RAM */

    ramChart = new Chart(
        ramCanvas,
        {

            type: "line",

            data: {

                labels: labels,

                datasets: [{

                    label: "RAM Usage %",

                    data:
                        ramHistory.map(
                            item => item.value
                        ),

                    borderColor: "#a855f7",

                    backgroundColor:
                        "rgba(168,85,247,0.18)",

                    fill: true,

                    tension: 0.45,

                    pointRadius: 4,

                    pointHoverRadius: 7,

                    pointBackgroundColor: "#a855f7",

                    borderWidth: 3
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false
                },

                plugins: {

                    legend: {

                        display: true,

                        labels: {

                            font: {
                                size: 14,
                                weight: "bold"
                            }
                        }
                    },

                    tooltip: {

                        enabled: true,

                        backgroundColor: "#111827",

                        titleColor: "#ffffff",

                        bodyColor: "#ffffff",

                        padding: 12,

                        cornerRadius: 10,

                        callbacks: {

                            label: function (context) {

                                return `RAM Usage: ${context.raw}%`
                            }
                        }
                    }
                },

                scales: {

                    y: {

                        beginAtZero: true,

                        max: 100,

                        ticks: {

                            stepSize: 10,

                            color: "#64748b",

                            font: {
                                size: 12
                            }
                        },

                        title: {

                            display: true,

                            text: "RAM Usage %",

                            font: {
                                size: 14,
                                weight: "bold"
                            }
                        },

                        grid: {

                            color: "rgba(148,163,184,0.15)"
                        }
                    },

                    x: {

                        ticks: {

                            color: "#64748b",

                            maxRotation: 35,

                            minRotation: 35,

                            autoSkip: true,

                            maxTicksLimit: 8
                        },

                        title: {

                            display: true,

                            text: "Time (5 sec interval)",

                            font: {
                                size: 13,
                                weight: "bold"
                            }
                        },

                        grid: {

                            color: "rgba(148,163,184,0.1)"
                        }
                    }
                }
            }
        }
    )
}
loadDashboard()

setInterval(
    loadDashboard,
    5000
)

document
    .getElementById("themeToggle")
    .addEventListener(
        "change",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            )
        }
    )
async function openLogs(name) {

    try {

        const response =
            await fetch(
                `/api/container-logs/${name}`
            )

        const data =
            await response.json()

        document.getElementById(
            "containerLogs"
        ).innerText =
            data.logs

        document.getElementById(
            "logsModal"
        ).style.display =
            "flex"

    } catch (error) {

        console.error(error)
    }
}
document
    .getElementById("closeLogs")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("logsModal")
                .style.display =
                "none"
        }
    )