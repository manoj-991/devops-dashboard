const cpuElement =
    document.getElementById("cpu")

const ramElement =
    document.getElementById("ram")

const diskElement =
    document.getElementById("disk")

const uptimeElement =
    document.getElementById("uptime")

const healthElement =
    document.getElementById("health")

let cpuChart
let ramChart

async function loadDashboard() {

    try {

        // HEALTH

        const health =
            await fetch("/api/health")
                .then(r => r.json())

        healthElement.innerText =
            health.status || "Running"

        // CPU

        const cpu =
            await fetch("/api/cpu")
                .then(r => r.json())

        cpuElement.innerText =
            cpu.cpu

        document.getElementById(
            "cpuBar"
        ).style.width =
            cpu.cpu

        // RAM

        const ram =
            await fetch("/api/ram")
                .then(r => r.json())

        ramElement.innerText =
            ram.ram

        document.getElementById(
            "ramBar"
        ).style.width =
            ram.ram

        // DISK

        const disk =
            await fetch("/api/disk")
                .then(r => r.json())

        diskElement.innerText =
            disk.disk

        document.getElementById(
            "diskBar"
        ).style.width =
            disk.disk

        // UPTIME

        const uptime =
            await fetch("/api/uptime")
                .then(r => r.json())

        uptimeElement.innerText =
            uptime.uptime

        // DOCKER CONTAINERS

        const docker =
            await fetch("/api/docker")
                .then(r => r.json())

        let dockerHTML = ""

        if (Array.isArray(docker)) {

            docker.forEach(container => {

                const statusClass =
                    container.state === "running"
                        ? "running-badge"
                        : "stopped-badge"

                const actionButton =
                    container.state === "running"
                        ? `
        <button
        class="action-btn stop-btn">

            Stop

        </button>
        `
                        : `
        <button
        class="action-btn start-btn">

            Start

        </button>
        `

                dockerHTML += `
        <tr>

            <td>

                <div class="docker-name">

                    ${container.name}

                </div>

                <div class="docker-sub">

                    ${container.image}

                </div>

            </td>

            <td>

                <span class="${statusClass}">

                    ${container.state}

                </span>

            </td>

            <td>

                <div class="port-badge">

                    8080/tcp

                </div>

            </td>

            <td>

                <div class="docker-actions">

                    ${actionButton}

                    <button
                    class="action-btn restart-btn">

                        Restart

                    </button>

                    <button
                    class="action-btn logs-btn">

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
        // CONTAINER STATS

        const stats =
            await fetch("/api/container-stats")
                .then(r => r.json())

        let statsHTML = ""

        if (Array.isArray(stats)) {

            stats.forEach(stat => {

                statsHTML += `
        <tr>

            <td>
                ${stat.name}
            </td>

            <td>

                <div class="mini-bar-bg">

                    <div
                    class="mini-bar cpu-mini"
                    style="
                    width:${stat.cpu};
                    ">

                    </div>

                </div>

                ${stat.cpu}

            </td>

            <td>

                ${stat.memory}

            </td>

        </tr>
        `
            })
        }

        document.getElementById(
            "containerStats"
        ).innerHTML =
            statsHTML

        // PROCESSES

        const processes =
            await fetch("/api/processes")
                .then(r => r.json())

        let processHTML = `
        <table>
            <tr>
                <th>Name</th>
                <th>CPU</th>
            </tr>
        `

        if (Array.isArray(processes)) {

            processes.forEach(p => {

                processHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.cpu}</td>
                </tr>
                `
            })
        }

        processHTML += `</table>`

        document.getElementById(
            "processes"
        ).innerHTML =
            processHTML

        // NETWORK

        const network =
            await fetch("/api/network")
                .then(r => r.json())

        document.getElementById(
            "network"
        ).innerHTML = `
        <div>
            Upload:
            ${network.upload || "N/A"}
        </div>

        <div>
            Download:
            ${network.download || "N/A"}
        </div>
        `

        // PORTS

        try {

            const portsResponse =
                await fetch("/api/ports")

            const portsData =
                await portsResponse.json()

            let portsArray = []

            if (Array.isArray(portsData)) {

                portsArray = portsData

            } else if (
                Array.isArray(
                    portsData.ports
                )
            ) {

                portsArray =
                    portsData.ports
            }

            let portsHTML = `
            <table>
                <tr>
                    <th>PORTS</th>
                </tr>
            `

            portsArray.forEach(port => {

                portsHTML += `
                <tr>
                    <td>${port}</td>
                </tr>
                `
            })

            portsHTML += `
            </table>
            `

            document.getElementById(
                "ports"
            ).innerHTML =
                portsHTML

        } catch (err) {

            document.getElementById(
                "ports"
            ).innerHTML =
                "Failed to load ports"
        }

        // SYSTEM

        const system =
            await fetch("/api/system")
                .then(r => r.json())

        document.getElementById(
            "system"
        ).innerHTML = `
        <div>
            OS:
            ${system.os}
        </div>

        <div>
            Platform:
            ${system.platform}
        </div>

        <div>
            Host:
            ${system.hostname}
        </div>
        `

        // SERVICES

        const services =
            await fetch("/api/services")
                .then(r => r.json())

        let servicesHTML = ""

        if (Array.isArray(services)) {

            services.forEach(service => {

                servicesHTML += `
                <div>
                    • ${service}
                </div>
                `
            })
        }

        document.getElementById(
            "services"
        ).innerHTML =
            servicesHTML

        // LOGS

        const logs =
            await fetch("/api/logs")
                .then(r => r.json())

        document.getElementById(
            "logs"
        ).innerText =
            logs.logs || "No logs"

        // AUDIT LOGS

        const audit =
            await fetch("/api/audit-logs")
                .then(r => r.json())

        document.getElementById(
            "auditLogs"
        ).innerText =
            audit.logs || "No audit logs"

        // CPU HISTORY

        const cpuHistory =
            await fetch("/api/cpu-history")
                .then(r => r.json())

        const cpuLabels =
            cpuHistory.map(x => x.time)

        const cpuValues =
            cpuHistory.map(x => x.value)

        if (cpuChart) {

            cpuChart.destroy()
        }

        cpuChart =
            new Chart(
                document.getElementById(
                    "cpuChart"
                ),
                {
                    type: "line",

                    data: {
                        labels: cpuLabels,

                        datasets: [{
                            label: "CPU %",
                            data: cpuValues,
                            borderColor: "#3b82f6",
                            backgroundColor:
                                "rgba(59,130,246,0.2)",
                            fill: true,
                            tension: 0.4
                        }]
                    }
                }
            )

        // RAM HISTORY

        const ramHistory =
            await fetch("/api/ram-history")
                .then(r => r.json())

        const ramLabels =
            ramHistory.map(x => x.time)

        const ramValues =
            ramHistory.map(x => x.value)

        if (ramChart) {

            ramChart.destroy()
        }

        ramChart =
            new Chart(
                document.getElementById(
                    "ramChart"
                ),
                {
                    type: "line",

                    data: {
                        labels: ramLabels,

                        datasets: [{
                            label: "RAM %",
                            data: ramValues,
                            borderColor: "#a855f7",
                            backgroundColor:
                                "rgba(168,85,247,0.2)",
                            fill: true,
                            tension: 0.4
                        }]
                    }
                }
            )

    } catch (error) {

        console.log(error)
    }
}

loadDashboard()

setInterval(
    loadDashboard,
    5000
)

// DARK MODE

const toggle =
    document.getElementById(
        "themeToggle"
    )

toggle.addEventListener(
    "change",
    () => {

        document.body.classList
            .toggle("dark-mode")
    }
)

// EXPANDABLE CARDS
