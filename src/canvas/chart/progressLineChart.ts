import { asPercentNumber, getSafeNumber } from "../utils";
import LineChart from "./lineChart";


export default class ProgressLineChart extends LineChart {
    style: colorStyle & { process: string };
    progress: number;

    constructor(options: ProgressLineChartOptions) {
        super(options)
    }

    drawProgress(progress: number) {
        const { x: { max: xMax } } = this.axisOptions;
        const percent = Math.min(getSafeNumber(progress / xMax), 1);
        const width = this.width * percent;
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, this.height);
        ctx.clip()
        this.drawChart(ctx, this.points, {
            ...this.style,
            fill: this.style.process || "rgba(255,255,255,0.40)"
        })
        ctx.restore();
    }

    /**
     * 设置进度，完成进度的值为初始化设置的 axis.x.max
     * @param progress 
     */
    setProgress(progress: number) {
        window.requestAnimationFrame(() => {
            this.clear()
            this.drawChart()
            this.drawProgress(progress);
        })
    }

    /**
     * 
     * @param progress 限制 0 - 1
     */
    setProgressPercent(progress: number = this.progress) {
        if (this.canDraw) {
            progress = asPercentNumber(progress);
            this.progress = progress;
            const _progress = this.axisOptions.x.max * progress;
            this.setProgress(_progress);
        }
    }

    handleWidthChange(newWidth: number, oldWidth: number): void {

        // console.log(this);
        // debugger
        super.handleWidthChange(newWidth, oldWidth);
        this.setProgressPercent();
    }

}
