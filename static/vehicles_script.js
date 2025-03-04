import {Histogram} from "./abstract.js";

function loadVehiclesCSV() {
    fetch("data/vehiculos.csv")
        .then(response => response.text())
        .then(text => {
            parseVehiclesCSV(text);
            vehicleHistogram.draw();
        })
        .catch(error => console.error("Error loading vehicles CSV:", error));
}

let vehicleData = [];

function parseVehiclesCSV(text) {
    const lines = text.trim().split("\n");
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


function drawVerticalText(text, x, y, ctx) {
    {
        ctx.save();
        ctx.translate(x, y); // Move origin to desired location
        ctx.rotate(-Math.PI / 2); // Rotate 90° counterclockwise for vertical text
        ctx.font = "bold 10px Arial";
        ctx.fillText(text, 0, 0);
        ctx.restore();

    }
}


class VehicleHistogram extends Histogram {
    draw() {
        super.draw();

        let ponderedSum = 0;
        const grandTotal = this.data[this.data.length - 1].cumulativeTotal;
        let medianYear = 0;
        let isMedianCalculated = false;
        this.data.forEach((d, i) => {
            ponderedSum += d.total * d.year;
            if (d.cumulativeTotal >= grandTotal / 2 && !isMedianCalculated) {
                medianYear = d.year;
                isMedianCalculated = true;
            }
        });

        const firstYear = this.data[0].year;
        const lastYear = this.data[this.data.length - 1].year;

        super.drawLegend({
            name: "Media",
            color: "red",
            value: (ponderedSum / grandTotal).toFixed(1)
        }, {
            name: "Mediana",
            color: "orange",
            value: medianYear
        });

        const meanX = this.marginLeft + ((ponderedSum / grandTotal - firstYear) / (lastYear - firstYear)) * this.chartWidth;
        const medianX = this.marginLeft + ((medianYear - firstYear) / (lastYear - firstYear)) * this.chartWidth;
        super.drawVerticalLines(meanX, "red");
        super.drawVerticalLines(medianX, "orange");
    }
}

const vehicleHistogram = new VehicleHistogram("vehicleHistogram", vehicleData, "Parque movil español a 2023")

// Ensure histogram updates when theme toggles
themeToggle.addEventListener("click", () => {
    vehicleHistogram.draw();
});
// Load vehicles CSV once the page loads
document.addEventListener("DOMContentLoaded", loadVehiclesCSV);

