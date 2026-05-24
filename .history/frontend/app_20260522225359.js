async function checkBackend() {

    const response = await fetch("/api/health");

    const data = await response.json();

    document.getElementById("result").innerText =
        data.message;
}