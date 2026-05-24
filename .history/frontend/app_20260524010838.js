const cpuChartCtx =
    document.getElementById("cpuChart")

const ramChartCtx =
    document.getElementById("ramChart")

const cpuChart =
    new Chart(cpuChartCtx, {

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
    })

const ramChart =
    new Chart(ramChartCtx, {

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
    })

async function loadDashboard() {

    try {

        // HEALTH
        const healthRes =
            await fetch("/api/health")

        const health =
            await healthRes.json()

        document
            .getElementById("health")
            .innerText =
            health.status


        // UPTIME
        const uptimeRes =
            await fetch("/api/uptime")

        const uptime =
            await uptimeRes.json()

        document
            .getElementById("uptime")
            .innerText =
            uptime.uptime


        // CPU
        const cpuRes =
            await fetch("/api/cpu")

        const cpu =
            await cpuRes.json()

        document
            .getElementById("cpu")
            .innerText =
            cpu.cpu


        // RAM
        const ramRes =
            await fetch("/api/ram")

        const ram =
            await ramRes.json()

        document
            .getElementById("ram")
            .innerText =
            ram.ram


        // DISK
        const diskRes =
            await fetch("/api/disk")

        const disk =
            await diskRes.json()

        document
            .getElementById("disk")
            .innerText =
            disk.disk


        // SYSTEM
        const systemRes =
            await fetch("/api/system")

        const system =
            await systemRes.json()

        document
            .getElementById("system")
            .innerHTML = `

        OS: ${system.os}
        <br><br>

        Platform:
        ${system.platform}

        <br><br>

        Host:
        ${system.hostname}
        `


        // NETWORK
        const networkRes =
            await fetch("/api/network")

        const network =
            await networkRes.json()

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


        // PROCESSES
        const processRes =
            await fetch("/api/processes")

        const processes =
            await processRes.json()

        let processHTML = ""

        processes.forEach(process => {

            processHTML += `

            <div style="margin-bottom:12px;">

                <strong>
                ${process.name}
                </strong>

                <br>

                CPU:
                ${process.cpu.toFixed(2)}%

            </div>
            `
        })

        document
            .getElementById("processes")
            .innerHTML =
            processHTML


        // DOCKER
        const dockerRes =
            await fetch("/api/docker")

        const containers =
            await dockerRes.json()

        let dockerHTML = ""
containers.forEach(container => {

    dockerHTML += `

    <div class="container-item">

        <strong>
        ${container.name || "Unknown"}
        </strong>

        <br><br>

        Image:
        ${container.image || "N/A"}

        <br><br>

        State:

        <span class="
        ${container.state === "running"
        ? "status-running"
        : "status-exited"}
        ">

        ${container.state || "unknown"}

        </span>

        <br><br>

        Status:
        ${container.status || "N/A"}

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

        document
            .getElementById("containerStats")
            .innerHTML =
            statsHTML


        // LOGS
        const logsRes =
            await fetch("/api/logs")

        const logs =
            await logsRes.json()

        document
            .getElementById("logs")
            .innerText =
            logs.logs


        // CPU HISTORY
        const cpuHistoryRes =
            await fetch("/api/cpu-history")

        const cpuHistory =
            await cpuHistoryRes.json()

        cpuChart.data.labels =
            cpuHistory.map(point => point.time)

        cpuChart.data.datasets[0].data =
            cpuHistory.map(point => point.value)

        cpuChart.update()


        // RAM HISTORY
        const ramHistoryRes =
            await fetch("/api/ram-history")

        const ramHistory =
            await ramHistoryRes.json()

        ramChart.data.labels =
            ramHistory.map(point => point.time)

        ramChart.data.datasets[0].data =
            ramHistory.map(point => point.value)

        ramChart.update()


        // ALERTS
        const alerts =
            document.getElementById("alerts")

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

    const response =
        await fetch(
            `/api/container-logs/${name}`
        )

    const data =
        await response.json()

    document
        .getElementById("logModal")
        .style.display =
        "flex"

    document
        .getElementById("modalLogs")
        .innerText =
        data.logs
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
){

    await fetch(
        `/api/container-${action}/${name}`,
        {
            method:"POST"
        }
    )

    loadDashboard()
}
loadDashboard()

setInterval(
    loadDashboard,
    5000
)