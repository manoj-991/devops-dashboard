const cpuChart =
    new Chart(
        document.getElementById("cpuChart"),
        {
            type: "line",

            data: {
                labels: [],
                datasets: [{
                    label: "CPU %",
                    data: [],
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            }
        }
    )

const ramChart =
    new Chart(
        document.getElementById("ramChart"),
        {
            type: "line",

            data: {
                labels: [],
                datasets: [{
                    label: "RAM %",
                    data: [],
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            }
        }
    )

async function loadDashboard() {
    const audit =
        await fetch(
            "/api/audit-logs"
        )
            .then(r => r.json())

    document
        .getElementById("auditLogs")
        .innerText =
        audit.logs || "No audit logs"

    try {

        // HEALTH
        const health =
            await fetch("/api/health")
                .then(r => r.json())

        document
            .getElementById("health")
            .innerText =
            health.status || "Unknown"


        // UPTIME
        const uptime =
            await fetch("/api/uptime")
                .then(r => r.json())

        document
            .getElementById("uptime")
            .innerText =
            uptime.uptime || "N/A"


        // CPU
        const cpu =
            await fetch("/api/cpu")
                .then(r => r.json())

        document
            .getElementById("cpu")
            .innerText =
            cpu.cpu || "N/A"


        // RAM
        const ram =
            await fetch("/api/ram")
                .then(r => r.json())

        document
            .getElementById("ram")
            .innerText =
            ram.ram || "N/A"


        // DISK
        const disk =
            await fetch("/api/disk")
                .then(r => r.json())

        document
            .getElementById("disk")
            .innerText =
            disk.disk || "N/A"


        // NETWORK
        const network =
            await fetch("/api/network")
                .then(r => r.json())

        document
            .getElementById("network")
            .innerHTML = `

        Upload:
        ${(network.bytes_sent / 1024 / 1024)
                .toFixed(2)} MB

        <br><br>

        Download:
        ${(network.bytes_received / 1024 / 1024)
                .toFixed(2)} MB
        `


        // SYSTEM
        const system =
            await fetch("/api/system")
                .then(r => r.json())

        document
            .getElementById("system")
            .innerHTML = `

        OS:
        ${system.os}

        <br><br>

        Platform:
        ${system.platform}

        <br><br>

        Host:
        ${system.hostname}
        `


        // SERVICES
        const services =
            await fetch("/api/services")
                .then(r => r.json())

        let servicesHTML = ""

        if (Array.isArray(services)) {

            services.forEach(service => {

                servicesHTML += `

                <div
                style="
                margin-bottom:10px;
                ">

                    <span class="
                    status-running
                    ">
                    ●
                    </span>

                    ${service.name}

                </div>
                `
            })
        }

        document
            .getElementById("services")
            .innerHTML =
            servicesHTML


        // PORTS
        const ports =
            await fetch("/api/ports")
                .then(r => r.json())

        let portsHTML = ""

        if (Array.isArray(ports.ports)) {

            ports.ports
                .slice(0, 8)
                .forEach(port => {

                    portsHTML += `

                <div
                style="
                margin-bottom:8px;
                ">

                    ${port}

                </div>
                `
                })
        }

        document
            .getElementById("ports")
            .innerHTML =
            portsHTML


        // LAST UPDATED
        document
            .getElementById("lastUpdated")
            .innerText =
            new Date()
                .toLocaleTimeString()


        // PROCESSES
        const processes =
            await fetch("/api/processes")
                .then(r => r.json())

        let processHTML = ""

        if (Array.isArray(processes)) {

            processes.forEach(process => {

                processHTML += `

                <div
                style="
                margin-bottom:12px;
                ">

                    <strong>
                    ${process.name}
                    </strong>

                    <br>

                    CPU:
                    ${process.cpu.toFixed(2)}%

                </div>
                `
            })
        }

        document
            .getElementById("processes")
            .innerHTML =
            processHTML


        // DOCKER
        const containers =
            await fetch("/api/docker")
                .then(r => r.json())

        let dockerHTML = ""

        if (Array.isArray(containers)) {

            containers.forEach(container => {

                dockerHTML += `

                <div class="container-item">

                    <strong>
                    ${container.name}
                    </strong>

                    <br><br>

                    Image:
                    ${container.image}

                    <br><br>

                    State:

                    <span class="
                    ${container.state === "running"
                        ? "status-running"
                        : "status-exited"}
                    ">

                    ${container.state}

                    </span>

                    <br><br>

                    Status:
                    ${container.status}

                    <div class="btn-group">

                        <button
                        class="logs-btn"
                        onclick="
                        showContainerLogs(
                        '${container.name}'
                        )
                        ">
                            Logs
                        </button>

                        <button
                        class="start-btn"
                        onclick="
                        containerAction(
                        'start',
                        '${container.name}'
                        )
                        ">
                            Start
                        </button>

                        <button
                        class="stop-btn"
                        onclick="
                        containerAction(
                        'stop',
                        '${container.name}'
                        )
                        ">
                            Stop
                        </button>

                        <button
                        class="restart-btn"
                        onclick="
                        containerAction(
                        'restart',
                        '${container.name}'
                        )
                        ">
                            Restart
                        </button>

                    </div>

                </div>
                `
            })
        }

        document
            .getElementById("docker")
            .innerHTML =
            dockerHTML


        // CONTAINER STATS
        const stats =
            await fetch("/api/container-stats")
                .then(r => r.json())

        let statsHTML = ""

        if (Array.isArray(stats)) {

            stats.forEach(stat => {

                statsHTML += `

                <div
                style="
                margin-bottom:14px;
                ">

                    <strong>
                    ${stat.name}
                    </strong>

                    <br>

                    CPU:
                    ${stat.cpu}

                    <br>

                    Memory:
                    ${stat.memory}

                </div>
                `
            })
        }

        document
            .getElementById("containerStats")
            .innerHTML =
            statsHTML


        // LOGS
        const logs =
            await fetch("/api/logs")
                .then(r => r.json())

        document
            .getElementById("logs")
            .innerText =
            logs.logs || "No logs"


        // CPU HISTORY
        const cpuHistory =
            await fetch("/api/cpu-history")
                .then(r => r.json())

        if (Array.isArray(cpuHistory)) {

            cpuChart.data.labels =
                cpuHistory.map(
                    point => point.time
                )

            cpuChart.data.datasets[0].data =
                cpuHistory.map(
                    point => point.value
                )

            cpuChart.update()
        }


        // RAM HISTORY
        const ramHistory =
            await fetch("/api/ram-history")
                .then(r => r.json())

        if (Array.isArray(ramHistory)) {

            ramChart.data.labels =
                ramHistory.map(
                    point => point.time
                )

            ramChart.data.datasets[0].data =
                ramHistory.map(
                    point => point.value
                )

            ramChart.update()
        }


        // ALERTS
        const alerts =
            document
                .getElementById("alerts")

        alerts.innerHTML = ""

        const ramValue =
            parseFloat(ram.ram)

        if (ramValue > 80) {

            alerts.innerHTML += `

            <div class="alert-box">

                HIGH RAM USAGE

            </div>
            `
        }

    } catch (error) {

        console.log(error)
    }
}

async function showContainerLogs(name) {

    const data =
        await fetch(
            `/api/container-logs/${name}`
        )
            .then(r => r.json())

    document
        .getElementById("logModal")
        .style.display =
        "flex"

    document
        .getElementById("modalLogs")
        .innerText =
        data.logs || "No logs"
}

function closeModal() {

    document
        .getElementById("logModal")
        .style.display =
        "none"
}

async function containerAction(
    action,
    name
) {

    await fetch(
        `/api/container-${action}/${name}`,
        {
            method: "POST"
        }
    )

    loadDashboard()
}

loadDashboard()

setInterval(
    loadDashboard,
    5000
)