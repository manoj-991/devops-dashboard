const cpuChartCtx =
document
.getElementById("cpuChart")

const ramChartCtx =
document
.getElementById("ramChart")

const cpuChart =
new Chart(cpuChartCtx, {

    type:"line",

    data:{
        labels:[],
        datasets:[{
            label:"CPU %",
            data:[],
            borderWidth:2,
            tension:0.4,
            fill:true
        }]
    }
})

const ramChart =
new Chart(ramChartCtx, {

    type:"line",

    data:{
        labels:[],
        datasets:[{
            label:"RAM %",
            data:[],
            borderWidth:2,
            tension:0.4,
            fill:true
        }]
    }
})

async function loadDashboard(){

    try{

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
        await