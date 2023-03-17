const url = '/chart-data';

fetch(url)
    .then(response => response.json())
    .then(chartDataArray => {
        chartDataArray.forEach((chartData, i) => {
           
            const ctx = document.getElementById(`myChart${i + 1}`).getContext('2d');
            const myChart = new Chart(ctx, {
                data: chartData
            });
            if(i===0){
                const travelCount = document.getElementById("travelCount");
                travelCount.textContent = "Travel Articles: "+myChart.data.datasets[0].data[2];
                const worldCount = document.getElementById("worldCount");
                worldCount.textContent = "World Articles: "+myChart.data.datasets[0].data[1];
                const techCount = document.getElementById("techCount");
                techCount.textContent = "Tech Articles: "+myChart.data.datasets[0].data[0];
            }
      
        });

    });