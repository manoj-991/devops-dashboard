console.log("APP JS LOADED");

async function loadBackendStatus() {

    try {

        const response = await fetch("/api/health");

        const data = await response.json();

        document.getElementById("backend-status").innerText =
            data.status;

    } catch (error) {

        document.getElementById("backend-status").innerText =
            "API Error";

        console.error(error);
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

        console.error(error);
    }
}

async function loadDashboard() {

    await loadBackendStatus();

    await loadUptime();
}

loadDashboard();

setInterval(loadDashboard, 5000);