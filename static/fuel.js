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
    // console.log({ year, percentages: fuelPercentages })
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
