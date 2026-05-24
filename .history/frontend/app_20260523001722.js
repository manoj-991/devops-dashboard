async function loadBackendStatus() {

    try {

        const response = await fetch("/api/health");

        const data = await response.json();

        document.getElementById("backend-status").innerText =
            data.status;

    } catch (error) {

        document.getElementById("backend-status").innerText =
            "API Error";
    }
}

async function loadUptime() {

    try {

        const response = await fetch("/api/uptime");

        const data = await response.json();

        document.getElementById("uptime-result").innerText =
            data.uptime;

    } catch (error) {

        document.getElementById("uptime-result").innerText =
            "API Error";
    }
}

async function loadCPU() {

    try {

        const response = await fetch("/api/cpu");

        const data = await response.json();

        document.getElementById("cpu-result").innerText =
            data.cpu_usage;

    } catch (error) {

        document.getElementById("cpu-result").innerText =
            "API Error";
    }
}

async function loadDashboard() {

    await loadBackendStatus();

    await loadUptime();

    await loadCPU();
}

loadDashboard();

setInterval(loadDashboard, 5000);async function loadBackendStatus() {

    try {

        const response = await fetch("/api/health");

        const data = await response.json();

        document.getElementById("backend-status").innerText =
            data.status;

    } catch (error) {

        document.getElementById("backend-status").innerText =
            "API Error";
    }
}

async function loadUptime() {

    try {

        const response = await fetch("/api/uptime");

        const data = await response.json();

        document.getElementById("uptime-result").innerText =
            data.uptime;

    } catch (error) {

        document.getElementById("uptime-result").innerText =
            "API Error";
    }
}

async function loadCPU() {

    try {

        const response = await fetch("/api/cpu");

        const data = await response.json();

        document.getElementById("cpu-result").innerText =
            data.cpu_usage;

    } catch (error) {

        document.getElementById("cpu-result").innerText =
            "API Error";
    }
}

async function loadDashboard() {

    await loadBackendStatus();

    await loadUptime();

    await loadCPU();
}

loadDashboard();

setInterval(loadDashboard, 5000);