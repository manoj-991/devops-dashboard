const cpuChart = new Chart(
    document.getElementById("cpuChart"),
    {
        type: "line",

        data: {
            labels: [],
            datasets: [{
                label: "CPU %",
                data: [],
                tension: 0.4,
                fill: true,
            }]
        }
    }
);

const ramChart = new Chart(
    document.getElementById("ramChart"),
    {
        type: "line",

        data: {
            labels: [],
            datasets: [{
                label: "RAM %",
                data: [],
                tension: 0.4,
                fill: true,
            }]
        }
    }
);

async function fetchData(url) {

    const response = await fetch(url);

    return await response.json();
}

function toggleTheme() {

    document.body.classList.toggle("dark");
}

function showAlert(message) {

    const alertBox =
        document.getElementById("alert-box");

    alertBox.innerText = message;

    alertBox.style.display = "block";

    setTimeout(() => {

        alertBox.style.display = "none";

    }, 3000);
}

async function loadCharts() {

    try {

        const cpuHistory =
            await fetchData("/api/cpu-history");

        cpuChart.data.labels =
            cpuHistory.map(x => x.time);

        cpuChart.data.datasets[0].data =
            cpuHistory.map(x => x.value);

        cpuChart.update();

    } catch (err) {

        console.log(err);
    }

    try {

        const ramHistory =
            await fetchData("/api/ram-history");

        ramChart.data.labels =
            ramHistory.map(x => x.time);

        ramChart.data.datasets[0].data =
            ramHistory.map(x => x.value);

        ramChart.update();

    } catch (err) {

        console.log(err);
    }
}

async function loadDashboard() {
    try {

        const stats =
            await fetchData(
                "/api/container-stats"
            );

        let html = "";

        stats.forEach(stat => {

            html += `
<div style="margin-bottom:15px">

<strong>${stat.name}</strong><br>

CPU:
${stat.cpu}<br>

Memory:
${stat.memory}

</div>
`;
        });

        document.getElementById(
            "container-stats"
        ).innerHTML = html;

    } catch (err) {

        console.log(err);
    }
    try {

        const network =
            await fetchData("/api/network");

        const sent =
            (network.bytes_sent / 1024 / 1024)
                .toFixed(2);

        const received =
            (network.bytes_received / 1024 / 1024)
                .toFixed(2);

        document.getElementById(
            "network-result"
        ).innerHTML =
            `
Upload:
${sent} MB<br>

Download:
${received} MB
`;

    } catch (err) {

        console.log(err);
    }

    try {

        const health =
            await fetchData("/api/health");

        document.getElementById(
            "backend-status"
        ).innerText = health.status;

    } catch (err) {

        console.log(err);
    }

    try {

        const uptime =
            await fetchData("/api/uptime");

        document.getElementById(
            "uptime-result"
        ).innerText = uptime.uptime;

    } catch (err) {

        console.log(err);
    }

    try {

        const cpu =
            await fetchData("/api/cpu");

        document.getElementById(
            "cpu-result"
        ).innerText = cpu.cpu;

        const cpuValue =
            parseFloat(cpu.cpu);

        if (cpuValue > 80) {

            showAlert("HIGH CPU");
        }

    } catch (err) {

        console.log(err);
    }

    try {

        const ram =
            await fetchData("/api/ram");

        document.getElementById(
            "ram-result"
        ).innerText = ram.ram;

        const ramValue =
            parseFloat(ram.ram);

        if (ramValue > 80) {

            showAlert("HIGH RAM");
        }

    } catch (err) {

        console.log(err);
    }

    try {

        const disk =
            await fetchData("/api/disk");

        document.getElementById(
            "disk-result"
        ).innerText = disk.disk;

    } catch (err) {

        console.log(err);
    }

    try {

        const system =
            await fetchData("/api/system");

        document.getElementById(
            "system-result"
        ).innerHTML =
            `
${system.hostname}<br>
${system.platform}
`;

    } catch (err) {

        console.log(err);
    }

    try {

        const processes =
            await fetchData("/api/processes");

        let html = "";

        processes.forEach(proc => {

            html += `
<p>
${proc.name}<br>
CPU: ${proc.cpu.toFixed(2)}%
</p>
`;
        });

        document.getElementById(
            "process-result"
        ).innerHTML = html;

    } catch (err) {

        console.log(err);
    }

    try {

        const containers =
            await fetchData("/api/docker");

        let html = "";

        containers.forEach(container => {

            html += `
<div style="margin-bottom:15px">

<strong>${container.name}</strong><br>

Image:
${container.image}<br>

State:
${container.state}<br>

Status:
${container.status}

</div>
`;
        });

        document.getElementById(
            "docker-result"
        ).innerHTML = html;

    } catch (err) {

        console.log(err);
    }

    try {

        const logs =
            await fetchData("/api/logs");

        document.getElementById(
            "logs"
        ).innerText = logs.logs;

    } catch (err) {

        console.log(err);
    }

    await loadCharts();
    async function showContainerLogs(name) {

        const response =
            await fetch(
                `/api/container-logs/${name}`
            )

        const data =
            await response.json()

        document
            .getElementById("logModal")
            .style.display = "flex"

        document
            .getElementById("modalLogs")
            .innerText = data.logs
    }

    function closeModal() {

        document
            .getElementById("logModal")
            .style.display = "none"
    }
}

loadDashboard();

setInterval(loadDashboard, 3000);