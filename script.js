const API_KEY = "YOUR_API_KEY"; // Replace with your Alpha Vantage API key

async function getStockData() {
    const symbol = document.getElementById("symbolInput").value.toUpperCase();
    const resultDiv = document.getElementById("result");

    if (!symbol) return alert("Please enter a stock symbol");

    try {
        // Fetch real-time quote
        const quoteRes = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        );
        const quoteData = await quoteRes.json();
        const stock = quoteData["Global Quote"];

        if (!stock || !stock["05. price"]) {
            resultDiv.innerHTML = `<p style="color: red;">Invalid symbol or API limit reached</p>`;
            return;
        }

        document.getElementById("stockName").textContent = symbol;
        document.getElementById("price").textContent = Number(stock["05. price"]).toFixed(2);
        document.getElementById("change").textContent = `${stock["10. change percent"]}`;

        // Fetch daily time series
        const chartRes = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
        );
        const chartData = await chartRes.json();
        const timeSeries = chartData["Time Series (Daily)"];

        const labels = Object.keys(timeSeries).slice(0, 10).reverse();
        const prices = labels.map(date => parseFloat(timeSeries[date]["4. close"]));

        drawChart(labels, prices);
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<p style="color: red;">Something went wrong</p>`;
    }
}

let chart;

function drawChart(labels, data) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) chart.destroy(); // reset chart if it already exists

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Closing Price',
                data: data,
                borderColor: 'limegreen',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}