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

    } catch { }

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

    } catch { }

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

    } catch { }

    try {

        const disk =
            await fetchData("/api/disk");

        document.getElementById(
            "disk-result"
        ).innerText = disk.disk;

    } catch { }

    try {

        const docker =
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

} catch {

    document.getElementById(
        "docker-result"
    ).innerText =
        "Docker Error";
}

loadDashboard();

setInterval(loadDashboard, 3000);