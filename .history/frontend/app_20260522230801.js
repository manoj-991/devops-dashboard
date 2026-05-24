async function checkBackend() {

    const response = await fetch("/api/health");

    const data = await response.json();

    document.getElementById("result").innerText =
        data.message;
}

async function getUptime() {

    const response = await fetch("/api/uptime");

    const data = await response.json();

    document.getElementById("uptime-result").innerText =
        data.uptime;
}