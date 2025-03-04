// Global variable to store parsed CSV data
let chartData = [];

// Colors (hex values chosen to match your Python palette)
const colors = ["#e24448", "#3f649f", "#63e080"];

// Load the CSV file and parse its content
function loadCSV() {
  // Adjust the file path if needed.
  fetch("data/merged_output.csv")
    .then(response => response.text())
    .then(text => {
      parseCSV(text);
      drawChart();

    })
    .catch(error => console.error("Error loading CSV:", error));
}

// A simple CSV parser (assumes no commas within fields)
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");

  // Expected header: Date, expending_ipc_adj, expending_child_adj, expending_all_adj
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (row.length < 4) continue; // skip incomplete rows

    const dataPoint = {
      date: row[header.indexOf("Date")],
      expending_ipc_adj: parseFloat(row[header.indexOf("expending_ipc_adj")]),
      expending_child_adj: parseFloat(row[header.indexOf("expending_child_adj")]),
      expending_all_adj: parseFloat(row[header.indexOf("expending_all_adj")])
    };
    chartData.push(dataPoint);
  }
}

// Draw the grouped bar chart on the canvas
function drawChart() {
  const canvas = document.getElementById("barChart");
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get the current background color
  const isLightTheme = document.body.classList.contains("light-theme");
  console.log(isLightTheme)
  const textColor = isLightTheme ? "#031c2a" : "#dfffff";
  console.log(textColor)
  console.log("\n")
  ctx.fillStyle = textColor;
  ctx.strokeStyle = textColor;

  // Define chart margins and dimensions
  const marginLeft = 50;
  const marginRight = 20;
  const marginBottom = 40;
  const topMargin = 60; // Increased top margin for title
  const chartWidth = canvas.width - marginLeft - marginRight;
  const chartHeight = canvas.height - topMargin - marginBottom;

  const n = chartData.length;
  if (n === 0) return; // nothing to draw

  // Draw chart title
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Evolución del gasto por persona. (ajustado a la inflación en base a 2006)", canvas.width / 2, 30);

  // Calculate group spacing and bar width
  const groupSpacing = chartWidth / n;
  const barWidth = groupSpacing / 4;

  // Compute the maximum value across all data for scaling
  let maxVal = 0;
  chartData.forEach(d => {
    maxVal = Math.max(maxVal, d.expending_ipc_adj, d.expending_child_adj, d.expending_all_adj);
  });

  ctx.font = "12px Arial"; // Set font for labels

  // Draw x-axis line
  const xAxisY = canvas.height - marginBottom;
  ctx.beginPath();
  ctx.moveTo(marginLeft, xAxisY);
  ctx.lineTo(canvas.width - marginRight, xAxisY);
  ctx.stroke();

  // Draw each group of bars and labels
  chartData.forEach((d, i) => {
    // Center position for the group
    const groupCenter = marginLeft + groupSpacing * (i + 0.5);

    // Calculate bar heights relative to chartHeight
    const barHeight1 = (d.expending_ipc_adj / maxVal) * chartHeight;
    const barHeight2 = (d.expending_child_adj / maxVal) * chartHeight;
    const barHeight3 = (d.expending_all_adj / maxVal) * chartHeight;

    // Set transparency for bars
    ctx.globalAlpha = 0.6;

    // Draw first bar (left)
    const x1 = groupCenter - barWidth - barWidth / 2;
    const y1 = xAxisY - barHeight1;
    ctx.fillStyle = colors[0];
    ctx.fillRect(x1, y1, barWidth, barHeight1);

    // Draw second bar (middle)
    const x2 = groupCenter - barWidth / 2;
    const y2 = xAxisY - barHeight2;
    ctx.fillStyle = colors[1];
    ctx.fillRect(x2, y2, barWidth, barHeight2);

    // Draw third bar (right)
    const x3 = groupCenter + barWidth / 2;
    const y3 = xAxisY - barHeight3;
    ctx.fillStyle = colors[2];
    ctx.fillRect(x3, y3, barWidth, barHeight3);

    // Reset alpha for text
    ctx.globalAlpha = 1.0;

    // Add label for the third bar (expending_all_adj)
    ctx.fillStyle = textColor; // Ensure labels match contrast color
    const label = d.expending_all_adj.toFixed(0);
    const textWidth = ctx.measureText(label).width;
    ctx.fillText(label, x3 + barWidth / 2 - textWidth / 2, y3 - 5);

    // Draw the x-axis label using the year from the Date column
    const year = new Date(d.date).getFullYear();
    const labelText = year.toString();
    const labelWidth = ctx.measureText(labelText).width;
    ctx.fillText(labelText, groupCenter - labelWidth / 2, xAxisY + 15);
  });
}

// Ensure the chart updates when theme toggles
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  drawChart(); // Redraw chart with updated colors
});

// Load CSV data once the page has loaded
document.addEventListener("DOMContentLoaded", loadCSV);
