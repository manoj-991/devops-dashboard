async function fetchData(url) {

    const response = await fetch(url);

    return await response.json();
}

async function loadDashboard() {

    try {

        const health = await fetchData("/api/health");

        document.getElementById("backend-status").innerText =
            health.status;

    } catch {

        document.getElementById("backend-status").innerText =
            "Error";
    }

    try {

        const uptime = await fetchData("/api/uptime");

        document.getElementById("uptime-result").innerText =
            uptime.uptime;

    } catch {

        document.getElementById("uptime-result").innerText =
            "Error";
    }

    try {

        const cpu = await fetchData("/api/cpu");

        document.getElementById("cpu-result").innerText =
            cpu.cpu;

    } catch {

        document.getElementById("cpu-result").innerText =
            "Error";
    }

    try {

        const ram = await fetchData("/api/ram");

        document.getElementById("ram-result").innerText =
            ram.ram;

    } catch {

        document.getElementById("ram-result").innerText =
            "Error";
    }

    try {

        const disk = await fetchData("/api/disk");

        document.getElementById("disk-result").innerText =
            disk.disk;

    } catch {

        document.getElementById("disk-result").innerText =
            "Error";
    }

    try {

        const system = await fetchData("/api/system");

        document.getElementById("system-result").innerText =
            `${system.hostname}
${system.platform}`;

    } catch {

        document.getElementById("system-result").innerText =
            "Error";
    }
    try {

    const processes = await fetchData("/api/processes");

    let html = "";

    processes.forEach(proc => {

        html += `
            <p>
                ${proc.name}<br>
                CPU: ${proc.cpu.toFixed(2)}%
            </p>
        `;
    });

    document.getElementById("process-result").innerHTML =
        html;

} catch {

    document.getElementById("process-result").innerText =
        "Process Error";
}
}

loadDashboard();

setInterval(loadDashboard, 5000);