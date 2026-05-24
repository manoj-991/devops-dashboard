const cpuData = [];
const ramData = [];
const labels = [];

const cpuChart = new Chart(
    document.getElementById("cpuChart"),
    {
        type: "line",

        data: {
            labels: labels,
            datasets: [{
                label: "CPU %",
                data: cpuData
            }]
        }
    }
);

const ramChart = new Chart(
    document.getElementById("ramChart"),
    {
        type: "line",

        data: {
            labels: labels,
            datasets: [{
                label: "RAM %",
                data: ramData
            }]
        }
    }
);

async function fetchData(url) {

    const response = await fetch(url);

    return await response.json();
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

function toggleTheme() {

    document.body.classList.toggle("dark");
}

async function loadDashboard() {

    try {

        const health =
            await fetchData("/api/health");

        document.getElementById(
            "backend-status"
        ).innerText = health.status;

    } catch {

        document.getElementById(
            "backend-status"
        ).innerText = "Error";
    }

    try {

        const uptime =
            await fetchData("/api/uptime");

        document.getElementById(
            "uptime-result"
        ).innerText = uptime.uptime;

    } catch {}

    try {

        const cpu =
            await fetchData("/api/cpu");

        document.getElementById(
            "cpu-result"
        ).innerText = cpu.cpu;

        const cpuValue =
            parseFloat(cpu.cpu);

        cpuData.push(cpuValue);

        if (cpuData.length > 20)
            cpuData.shift();

        if (cpuValue > 80)
            showAlert("HIGH CPU USAGE");

    } catch {}

    try {

        const ram =
            await fetchData("/api/ram");

        document.getElementById(
            "ram-result"
        ).innerText = ram.ram;

        const ramValue =
            parseFloat(ram.ram);

        ramData.push(ramValue);

        if (ramData.length > 20)
            ramData.shift();

        if (ramValue > 80)
            showAlert("HIGH RAM USAGE");

    } catch {}

    try {

        const disk =
            await fetchData("/api/disk");

        document.getElementById(
            "disk-result"
        ).innerText = disk.disk;

    } catch {}

    try {

        const docker =
            await fetchData("/api/docker");

        document.getElementById(
            "docker-result"
        ).innerHTML =
            `
Running: ${docker.running}<br>
Stopped: ${docker.stopped}<br>
Total: ${docker.total}
`;

    } catch {}

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

    } catch {}

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

    } catch {}

    try {

        const logs =
            await fetchData("/api/logs");

        document.getElementById(
            "logs"
        ).innerText = logs.logs;

    } catch {}

    labels.push("");

    if (labels.length > 20)
        labels.shift();

    cpuChart.update();
    ramChart.update();
}

loadDashboard();

setInterval(loadDashboard, 3000);