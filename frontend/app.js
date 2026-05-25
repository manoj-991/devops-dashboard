/* =========================
   GLOBALS
========================= */

let cpuChart = null
let ramChart = null

let currentHost =
    "http://localhost:9090"

let activeLogSocket = null

/* =========================
   DOM
========================= */

const cpuCanvas =
    document.getElementById("cpuChart")

const ramCanvas =
    document.getElementById("ramChart")

/* =========================
   FETCH HELPER
========================= */

async function fetchData(url) {

    try {

        const response =
            await fetch(
                `${currentHost}${url}`
            )

        return await response.json()

    } catch (error) {

        console.error(
            "Fetch failed:",
            url,
            error
        )

        return null
    }
}

/* =========================
   SAFE VALUE
========================= */

function safeValue(
    value,
    fallback = "N/A"
) {

    if (
        value === undefined ||
        value === null
    ) {

        return fallback
    }

    return value
}

/* =========================
   CONTAINER ACTIONS
========================= */

async function containerAction(
    action,
    name
) {

    try {

        await fetch(

            `${currentHost}/api/container-${action}/${name}`,

            {
                method: "POST"
            }
        )

        loadDashboard()

    } catch (error) {

        console.error(error)
    }
}

/* =========================
   DELETE CONTAINER
========================= */

async function deleteContainer(name) {

    const confirmDelete =
        confirm(
            `Delete ${name}?`
        )

    if (!confirmDelete) return

    try {

        await fetch(

            `${currentHost}/api/container-delete/${name}`,

            {
                method: "DELETE"
            }
        )

        loadDashboard()

    } catch (error) {

        console.error(error)
    }
}

/* =========================
   CLOSE LOGS MODAL
========================= */

const closeLogsBtn =
    document.getElementById(
        "closeLogs"
    )

if (closeLogsBtn) {

    closeLogsBtn.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "logsModal"
                )
                .style.display =
                "none"

            if (activeLogSocket) {

                activeLogSocket.close()
            }
        }
    )
}

/* =========================
   MAIN DASHBOARD
========================= */

async function loadDashboard() {

    const results =
        await Promise.all([

            fetchData("/api/health"),
            fetchData("/api/uptime"),
            fetchData("/api/cpu"),
            fetchData("/api/ram"),
            fetchData("/api/disk"),
            fetchData("/api/docker"),
            fetchData("/api/container-stats"),
            fetchData("/api/cpu-history"),
            fetchData("/api/ram-history"),
            fetchData("/api/system"),
            fetchData("/api/processes"),
            fetchData("/api/network"),
            fetchData("/api/ports"),
            fetchData("/api/logs"),
            fetchData("/api/audit-logs")

        ])

    const health =
        results[0]

    const uptime =
        results[1]

    const cpu =
        results[2]

    const ram =
        results[3]

    const disk =
        results[4]

    const docker =
        results[5]

    const stats =
        results[6]

    const cpuHistory =
        results[7]

    const ramHistory =
        results[8]

    const system =
        results[9]

    const processes =
        results[10]

    const network =
        results[11]

    const ports =
        results[12]

    const logs =
        results[13]

    const auditLogs =
        results[14]


    /* =========================
       REFRESH TIME
    ========================= */

    const refresh =
        document.getElementById(
            "lastRefresh"
        )

    if (refresh) {

        refresh.innerText =

            "Last Refresh: " +

            new Date()
                .toLocaleTimeString()
    }

    /* =========================
       TOP METRICS
    ========================= */

    document.getElementById(
        "health"
    ).innerText =

        safeValue(
            health?.status,
            "running"
        )

    document.getElementById(
        "uptime"
    ).innerText =

        safeValue(
            uptime?.uptime,
            "0m"
        )

    const cpuValue =

        safeValue(
            cpu?.usage ||
            cpu?.cpu,
            "0%"
        )

    const ramValue =

        safeValue(
            ram?.usage ||
            ram?.ram,
            "0%"
        )

    const diskValue =

        safeValue(
            disk?.usage ||
            disk?.disk,
            "0%"
        )

    document.getElementById(
        "cpu"
    ).innerText =
        cpuValue

    document.getElementById(
        "ram"
    ).innerText =
        ramValue

    document.getElementById(
        "disk"
    ).innerText =
        diskValue

    document.getElementById(
        "cpuBar"
    ).style.width =
        cpuValue

    document.getElementById(
        "ramBar"
    ).style.width =
        ramValue

    document.getElementById(
        "diskBar"
    ).style.width =
        diskValue

    let alertsHTML = ""

    if (cpuValue !== "0%") {

        const cpuNum = parseFloat(cpuValue)

        if (cpuNum > 80) {

            alertsHTML += `
            <div class="alert danger">
                High CPU Usage: ${cpuValue}
            </div>
        `
        }
    }

    if (ramValue !== "0%") {

        const ramNum = parseFloat(ramValue)

        if (ramNum > 80) {

            alertsHTML += `
            <div class="alert warning">
                High RAM Usage: ${ramValue}
            </div>
        `
        }
    }

    if (!alertsHTML) {

        alertsHTML = `
        <div class="alert success">
            No active alerts
        </div>
    `
    }

    document.getElementById(
        "alerts"
    ).innerHTML = alertsHTML


    /* =========================
       DOCKER TABLE
    ========================= */

    let dockerHTML = ""

    if (Array.isArray(docker)) {

        docker.forEach(container => {

            const badge =

                container.state ===
                    "running"

                    ? "running-badge"

                    : "stopped-badge"

            dockerHTML += `

<tr>

<td>
${container.id}
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
${container.ports || "N/A"}
</td>

<td>
<div class="container-actions">

${container.state === "running" ? `

<button
class="text-btn stop-btn"
onclick="containerAction('stop','${container.name}')">
Stop
</button>

<button
class="text-btn restart-btn"
onclick="containerAction('restart','${container.name}')">
Restart
</button>

` : `

<button
class="text-btn start-btn"
onclick="containerAction('start','${container.name}')">
Start
</button>

`}

<button
class="text-btn logs-btn"
onclick="window.openLogs('${container.name}')">
Logs
</button>

<button
class="text-btn delete-btn"
onclick="deleteContainer('${container.name}')">
Delete
</button>

</div>

</td >

</tr >
            `
        })
    }

    document.getElementById(
        "docker"
    ).innerHTML =
        dockerHTML

    /* =========================
       CONTAINER STATS
    ========================= */

    let statsHTML = ""

    if (Array.isArray(stats)) {

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
    /* =========================
       SYSTEM INFO
    ========================= */

    document.getElementById(
        "system"
    ).innerHTML =

        `
OS:
            ${safeValue(system?.os)}

            < br > <br>

            Platform:
            ${safeValue(system?.platform)}

            <br><br>

                Host:
                ${safeValue(system?.hostname)}
                `

    /* =========================
       PROCESSES
    ========================= */

    document.getElementById(
        "processes"
    ).innerHTML = `

<pre class="process-table">
${(processes?.processes || [])
            .slice(0, 20)
            .join("\n")}
</pre>
`

    /* =========================
       NETWORK
    ========================= */

    document.getElementById(
        "network"
    ).innerHTML =

        `
                <pre>
                    ${network?.network || "No network data"}
                </pre>
                `

    /* =========================
       PORTS
    ========================= */

    document.getElementById(
        "ports"
    ).innerHTML =

        (ports?.ports || [])
            .slice(0, 20)
            .map(p => `

                <div class="port-item">
                    ${p}
                </div>

                `)
            .join("")

    /* =========================
       LIVE LOGS
    ========================= */

    document.getElementById(
        "logs"
    ).innerHTML =

        `
                <pre>
                    ${logs?.logs || "No logs"}
                </pre>
                `

    /* =========================
       AUDIT LOGS
    ========================= */

    document.getElementById(
        "auditLogs"
    ).innerHTML =

        `
                <pre>
                    ${auditLogs?.audit || "No audit logs"}
                </pre>
                `

    /* =========================
       CPU CHART
    ========================= */

    const cpuLabels =

        (cpuHistory || [])
            .map(item => item.time)

    const cpuValues =

        (cpuHistory || [])
            .map(item => item.value)

    if (!cpuChart) {

        cpuChart =
            new Chart(
                cpuCanvas,
                {

                    type: "line",

                    data: {

                        labels:
                            cpuLabels,

                        datasets: [{

                            label:
                                "CPU Usage %",

                            data:
                                cpuValues,

                            borderColor:
                                "#3b82f6",

                            backgroundColor:
                                "rgba(59,130,246,0.15)",

                            fill: true,

                            tension: 0.4
                        }]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        animation: false,

                        scales: {

                            y: {

                                beginAtZero: true,

                                max: 100
                            }
                        }
                    }
                }
            )

    } else {

        cpuChart.data.labels =
            cpuLabels

        cpuChart.data.datasets[0].data =
            cpuValues

        cpuChart.update()
    }

    /* =========================
       RAM CHART
    ========================= */

    const ramLabels =

        (ramHistory || [])
            .map(item => item.time)

    const ramValues =

        (ramHistory || [])
            .map(item => item.value)

    if (!ramChart) {

        ramChart =
            new Chart(
                ramCanvas,
                {

                    type: "line",

                    data: {

                        labels:
                            ramLabels,

                        datasets: [{

                            label:
                                "RAM Usage %",

                            data:
                                ramValues,

                            borderColor:
                                "#a855f7",

                            backgroundColor:
                                "rgba(168,85,247,0.18)",

                            fill: true,

                            tension: 0.4
                        }]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        animation: false,

                        scales: {

                            y: {

                                beginAtZero: true,

                                max: 100
                            }
                        }
                    }
                }
            )

    } else {

        ramChart.data.labels =
            ramLabels

        ramChart.data.datasets[0].data =
            ramValues

        ramChart.update()
    }
}

/* =========================
   HOST SELECTOR
========================= */

const hostSelector =
    document.getElementById(
        "hostSelector"
    )

if (hostSelector) {

    hostSelector.addEventListener(
        "change",
        (e) => {

            currentHost =
                e.target.value

            loadDashboard()
        }
    )
}

/* =========================
                THEME TOGGLE
========================= */

const themeToggle =
    document.getElementById(
        "themeToggle"
    )

if (themeToggle) {

    themeToggle.addEventListener(
        "change",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            )
        }
    )
}
window.openLogs = async function (containerName) {

    try {

        console.log("Opening logs for:", containerName);

        const response = await fetch(
            `${currentHost}/api/container-logs/${containerName}`
        );

        const data = await response.json();

        console.log(data);

        document.getElementById(
            "logsModal"
        ).style.display = "block";

        document.getElementById(
            "containerLogs"
        ).textContent = data.logs;

    } catch (err) {

        console.error(err);

        alert("Failed to load logs");
    }
}
loadDashboard()

setInterval(() => {

    loadDashboard()

}, 3000)