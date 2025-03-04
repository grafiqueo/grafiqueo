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


//****************************************************************
// Global variable to store parsed fuel CSV data
let fuelChartData = [];

// Load the CSV file and parse its content
function loadFuelCSV() {
  fetch("data/vehiculos_combustible.csv")
    .then(response => response.text())
    .then(text => {
      parseFuelCSV(text);
      drawFuelChart();
    })
    .catch(error => console.error("Error loading fuel CSV:", error));
}

// Parse CSV content and compute fuel type percentages
function parseFuelCSV(text) {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (row.length < 2) continue;

    let year = row[0];
    let fuelCounts = row.slice(1).map(Number);
    let total = fuelCounts.reduce((sum, val) => sum + val, 0);
    let fuelPercentages = fuelCounts.map(val => (val / total) * 100);

    fuelChartData.push({ year, percentages: fuelPercentages });
    console.log({ year, percentages: fuelPercentages })
  }
}

// Draw the stacked area chart
function drawFuelChart() {
  const canvas = document.getElementById("fuelChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const marginLeft = 50;
  const marginRight = 20;
  const marginBottom = 40;
  const topMargin = 60;
  const chartWidth = canvas.width - marginLeft - marginRight;
  const chartHeight = canvas.height - topMargin - marginBottom;

  const isLightTheme = document.body.classList.contains("light-theme");
  const textColor = isLightTheme ? "#031c2a" : "#dfffff";
  ctx.fillStyle = textColor;
  ctx.strokeStyle = textColor;

  const n = fuelChartData.length;
  if (n === 0) return;

  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Porcentaje de vehículos por tipo de combustible", canvas.width / 2, 30);

  const yearSpacing = chartWidth / (n - 1);
  let cumulativeValues = Array(fuelChartData[0].percentages.length).fill(0);
  const colors = ["#e24448", "#3f649f", "#63e080", "#f4a261", "#2a9d8f"]; // Color palette

  for (let i = 0; i < n - 1; i++) {
    let x1 = marginLeft + yearSpacing * i;
    let x2 = marginLeft + yearSpacing * (i + 1);
    let prevY = canvas.height - marginBottom;

    for (let j = 0; j < fuelChartData[i].percentages.length; j++) {
      let y1 = prevY - (fuelChartData[i].percentages[j] / 100) * chartHeight;
      let y2 = prevY - (fuelChartData[i + 1].percentages[j] / 100) * chartHeight;

      ctx.fillStyle = colors[j % colors.length];
      ctx.beginPath();
      ctx.moveTo(x1, prevY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, prevY);
      ctx.closePath();
      ctx.fill();

      prevY = y1;
    }
  }

  ctx.fillStyle = textColor;
  fuelChartData.forEach((d, i) => {
    if (i % Math.ceil(n / 10) === 0) {
        let x = marginLeft + yearSpacing * i;
        ctx.fillText(d.year.toString(), x ,canvas.height - 10);
    }
  
  });
}

document.addEventListener("DOMContentLoaded", loadFuelCSV);
