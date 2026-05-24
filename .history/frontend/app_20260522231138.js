async function checkBackend() {

    const response = await fetch("/api/health");

    const data = await response.json();

    document.getElementById("result").innerText =
        data.message;
}

async function getUptime() {

    const response = await fetch("/api/uptime");

    const data = await response.json();
    async function loadBackendStatus() {

        const response = await fetch("/api/health");

        const data = await response.json();

        document.getElementById("backend-status").innerText =
            data.status;
    }

    async function loadUptime() {

        const response = await fetch("/api/uptime");

        const data = await response.json();

        document.getElementById("uptime-result").innerText =
            data.uptime;
    }

    async function loadDashboard() {

        await loadBackendStatus();

        await loadUptime();
    }

    // Initial load
    loadDashboard();

    // Auto refresh every 5 seconds
    setInterval(loadDashboard, 5000);
    document.getElementById("uptime-result").innerText =
        data.uptime;
}