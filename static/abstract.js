export class Histogram {
    constructor(canvasId, data, title) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.data = data;
        this.title = title;
        this.marginLeft = 50;
        this.marginRight = 20;
        this.marginBottom = 40;
        this.topMargin = 60;
        this.chartWidth = this.canvas.width - this.marginLeft - this.marginRight;
        this.chartHeight = this.canvas.height - this.topMargin - this.marginBottom;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const isLightTheme = document.body.classList.contains("light-theme");
        const textColor = isLightTheme ? "#031c2a" : "#dfffff";
        this.ctx.fillStyle = textColor;
        this.ctx.strokeStyle = textColor;

        const data_length = this.data.length
        if (data_length === 0) return;

        const maxVal = Math.max(...this.data.map(d => d.total));
        const barWidth = this.chartWidth / data_length;

        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.title, this.canvas.width / 2, 30);

        const xAxisY = this.canvas.height - this.marginBottom;
        this.ctx.beginPath();
        this.ctx.moveTo(this.marginLeft, xAxisY);
        this.ctx.lineTo(this.canvas.width - this.marginRight, xAxisY);
        this.ctx.stroke();

        this.ctx.font = "12px Arial";

        this.data.forEach((d, i) => {
            const barHeight = (d.total / maxVal) * this.chartHeight;
            const x = this.marginLeft + i * barWidth;
            const y = xAxisY - barHeight;

            this.ctx.fillStyle = "#3f649f";
            this.ctx.fillRect(x, y, barWidth * 0.8, barHeight);

            this.ctx.fillStyle = textColor;
            if (i % Math.ceil(this.data.length / 10) === 0) {
                this.ctx.fillText(d.year.toString(), x + barWidth * 0.4, xAxisY + 15);
            }
        });
    }

    drawLegend(...args) {
        const squareSize = 14;
        this.ctx.font = "bold " + squareSize + "px Arial";
        this.ctx.textAlign = "left";

        args.forEach((element, i) => {
            this.ctx.fillStyle = element['color'];
            this.ctx.fillRect(this.marginLeft, this.topMargin + 15 * i - squareSize, squareSize, squareSize);
            this.ctx.fillStyle = this.ctx.strokeStyle;
            this.ctx.fillText(element['name'] + " = " + element['value'], this.marginLeft + squareSize * 1.5, this.topMargin + 15 * i);
        });
    }

    drawVerticalLines(x, colour) {
        this.ctx.strokeStyle = colour;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height - this.marginBottom);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}