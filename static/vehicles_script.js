// Function to load vehiculos.csv and draw histogram
function loadVehiclesCSV() {
    fetch("data/vehiculos.csv")
    .then(response => response.text())
    .then(text => {
        parseVehiclesCSV(text);
        drawHistogram();
    })
    .catch(error => console.error("Error loading vehicles CSV:", error));
}

// Function to parse vehiculos.csv
let vehicleData = [];

function parseVehiclesCSV(text) {
    const lines = text.trim().split("\n");
    // const header = lines[0].split(",");
    let cumulativeTotal = 0
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");
        if (row.length < 2) continue; // Skip incomplete rows

        let total = parseInt(row[row.length - 1])
        cumulativeTotal = cumulativeTotal + total
        vehicleData.push({
            year: parseInt(row[0]),
            total: total,
            cumulativeTotal: cumulativeTotal
        });
    }
}


function drawVerticalLines(ctx, xPos, canvasHeight, marginBottom, colour) {{
    ctx.strokeStyle = colour;
    ctx.setLineDash([5, 5]); // Dotted line
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, canvasHeight - marginBottom);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash style
}}
function drawVerticalText(text, x, y, ctx) {{
        ctx.save();
        ctx.translate(x, y); // Move origin to desired location
        ctx.rotate(-Math.PI / 2); // Rotate 90° counterclockwise for vertical text
        ctx.font = "bold 10px Arial";
        ctx.fillText(text, 0, 0);
        ctx.restore();

    }}
function drawLegend(ctx, startX, startY, mean, median) {
    const squareSize = 14;
    ctx.font = "bold " + squareSize + "px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "red";
    ctx.fillRect(startX, startY - squareSize, squareSize, squareSize);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText("Media = " + mean.toFixed(1), startX + squareSize *1.5, startY);


    ctx.fillStyle = "orange";
    ctx.fillRect(startX, startY + 15 - squareSize, squareSize, squareSize);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText("Mediana = " + median, startX + squareSize * 1.5, startY + 15);
}


// Function to draw histogram
function drawHistogram() {
    const canvas = document.getElementById("vehicleHistogram");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isLightTheme = document.body.classList.contains("light-theme");
    const textColor = isLightTheme ? "#031c2a" : "#dfffff";
    ctx.fillStyle = textColor;
    ctx.strokeStyle = textColor;

    const marginLeft = 50, marginRight = 20, marginBottom = 40, topMargin = 60;
    const chartWidth = canvas.width - marginLeft - marginRight;
    const chartHeight = canvas.height - topMargin - marginBottom;

    if (vehicleData.length === 0) return;

    const maxVal = Math.max(...vehicleData.map(d => d.total));
    const barWidth = chartWidth / vehicleData.length;

    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Histograma de Vehículos por Año", canvas.width / 2, 30);

    const xAxisY = canvas.height - marginBottom;
    ctx.beginPath();
    ctx.moveTo(marginLeft, xAxisY);
    ctx.lineTo(canvas.width - marginRight, xAxisY);
    ctx.stroke();

    ctx.font = "12px Arial";

    let ponderedSum = 0
    const grandTotal = vehicleData[vehicleData.length -1].cumulativeTotal
    let medianYear= 0
    let isMedianCalculated = false
    vehicleData.forEach((d, i) => {
        const barHeight = (d.total / maxVal) * chartHeight;
        const x = marginLeft + i * barWidth;
        const y = xAxisY - barHeight;
        ponderedSum = ponderedSum + d.total * d.year
        if ((d.cumulativeTotal >= grandTotal / 2) && !isMedianCalculated ){
            medianYear = d.year;
            isMedianCalculated = true
        }

        ctx.fillStyle = "#3f649f";
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);

        ctx.fillStyle = textColor;
        if (i % Math.ceil(vehicleData.length / 10) === 0) {
            ctx.fillText(d.year.toString(), x + barWidth * 0.4, xAxisY + 15);
        }
    });

    const minYear = Math.min(...vehicleData.map(d => d.year));
    const maxYear = Math.max(...vehicleData.map(d => d.year));


    const meanX = marginLeft + ((ponderedSum/grandTotal - minYear) / (maxYear - minYear)) * chartWidth;
    const medianX = marginLeft + ((medianYear - minYear) / (maxYear - minYear)) * chartWidth;
    // drawVerticalText("Media", meanX, xAxisY + 15, ctx);
    // drawVerticalText("Mediana", medianX, xAxisY + 15, ctx);
    drawLegend(ctx, marginLeft, topMargin, ponderedSum/grandTotal, medianYear);
    drawVerticalLines(ctx, meanX, canvas.height, marginBottom, "red");
    drawVerticalLines(ctx, medianX, canvas.height, marginBottom, "orange");

}

// Ensure histogram updates when theme toggles
themeToggle.addEventListener("click", () => {
    drawHistogram();
});

// Load vehicles CSV once the page loads
document.addEventListener("DOMContentLoaded", loadVehiclesCSV);