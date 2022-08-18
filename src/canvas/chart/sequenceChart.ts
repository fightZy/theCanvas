import PlaneAxis, { PlaneAxisOptions } from "../theCanvas/planeAxis";
import { getSafeNumber } from "../utils";

interface lineData {
    x: number,
    len: number,
}
export interface SequenceItem {
    y: number,
    style: {
        color: string,
        text?: string,
        width?: number,
        cap?: CanvasLineCap,
    },
    lines: lineData[],
}
interface SequenceChartOptions extends PlaneAxisOptions {
    data?: SequenceItem[],
    axisText?: {
        value: (n: number) => number,
        unit: () => string,
    }
    // mainSize?: {
    //     width?: `${number}%` | number,
    //     height?: `${number}%` | number,
    //     position?: [`${number}%` | number, `${number}%` | number | undefined],
    // }
}
export default class SequenceChart extends PlaneAxis {

    data: SequenceItem[]
    axisText: {
        value: (n: number) => number,
        unit: () => string,
    }

    constructor(options: SequenceChartOptions) {
        super(options);
        const { data, axisText } = options;
        this.axisText = axisText;
        if (data) this.setData(data);
    }

    transformData(data: SequenceItem[]) {
        const { handleX, handleY, handleXNumber, limitX } = this.getTransformDataHandle();

        return data.map(item => {
            let { y, lines } = item;
            let _lines: lineData[] = []
            lines = [...lines];
            lines
                .sort((a, b) => a.x - b.x)
                .filter(({ x }) => x < this.axisOptions?.x?.max)
                .map(({ len, x }) => {
                    len = limitX(x + len) - x;
                    return { x: handleX(x), len: handleXNumber(len) }
                })
                .forEach((line, index) => {
                    if (index === 0) _lines.push(line);
                    else {
                        const lastLine = _lines[_lines.length - 1];
                        if (lastLine) {
                            const { x, len } = lastLine;
                            const { x: cX, len: cLen } = line;
                            const lastLineLenX = x + len;

                            // 这一步合并也应该放在外面
                            // 会使得与真实数据发生误差，导致与柄图比例不准
                            if (cX < lastLineLenX || cX - lastLineLenX < 5) {
                                lastLine.len = cX + cLen - x;
                            } else {
                                // console.log('cX - lastLineLenX', cX - lastLineLenX,);
                                _lines.push(line);
                            }
                        }
                    }
                })

            return {
                ...item,
                y: handleY(y),
                lines: _lines,
            }
        })


    }

    setData(data: SequenceItem[]) {
        this.data = this.transformData(data);
    }

    drawChart(ctx = this.ctx, data = this.data) {
        // console.log('drawChart', [...data]);

        if (data) {
            ctx.save();
            ctx.setLineDash([])
            data.forEach(({ y, style, lines }) => {
                const { color, width = 8, cap = 'round' } = style;
                const _width = width * this.dpi;
                const lineOffset = _width / 2;
                ctx.beginPath()
                ctx.lineWidth = _width;
                ctx.strokeStyle = color;
                ctx.lineCap = cap;
                lines.forEach(({ x, len }, index) => {
                    ctx.moveTo(x + lineOffset, y)
                    ctx.lineTo(x + len - lineOffset, y)
                    ctx.stroke();
                })
            })
            ctx.restore();
        }
        // draw chart box
        // ctx.save();
        // ctx.beginPath();
        // ctx.moveTo(this.originX, this.originY);
        // ctx.lineTo(this.originX + this.width, this.originY);
        // ctx.lineTo(this.originX + this.width, this.originY - this.height);
        // ctx.lineTo(this.originX, this.originY - this.height);
        // ctx.setLineDash([]);
        // ctx.lineWidth = 2;
        // ctx.strokeStyle = 'red';
        // ctx.stroke();
        // ctx.restore();
    }

    drawAxis(ctx = this.ctx, axisOptions = this.axisOptions) {
        if (axisOptions) {
            const { handleXNumber, handleX, handleYNumber } = this.getTransformDataHandle();
            const { x: { max: xMax, min: xMin }, y: { max: yMax, min: yMin } } = axisOptions;
            const { color = '#333333' } = this.axisStyle;
            // const { color = 'red' } = this.axisStyle;
            // const { value, unit } = this.axisText;
            // console.log('drawAxis', this.originX, this.originY);

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.moveTo(this.originX, this.originY);
            ctx.lineTo(this.originX + this.width, this.originY);
            ctx.stroke();

            ctx.beginPath();
            ctx.setLineDash([10, 5])
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.moveTo(this.originX, this.originY);
            ctx.lineTo(this.originX, this.originY - this.height);
            ctx.stroke();


            // const { } = this.handleXMax(xMax);
            let scaleNum = 5;
            const len = (xMax / 60);
            if (len < scaleNum) {
                scaleNum = Math.floor(len);
            }
            const baseScale = Math.floor(getSafeNumber(len / scaleNum));
            const scaleNumOffset = Math.floor(getSafeNumber(getSafeNumber(len % scaleNum) / baseScale)) + 1
            const scaleX = baseScale * 60;
            const scaleY = this.originY + 40;
            let xAxis: [coordinate, string][] = Array.from({ length: scaleNum + scaleNumOffset });
            xAxis = xAxis.map((_, index) => {
                return [[handleX(scaleX * index), scaleY], baseScale * index + '']
            })

            ctx.fillStyle = '#7c7c7c';
            ctx.textAlign = 'center';
            ctx.textAlign = 'left';
            ctx.font = 10 * this.dpi + 'px PingFangSC-Regular';
            ctx.fillText('分钟', this.originX + this.width + 15, scaleY);
            ctx.textAlign = 'center';
            xAxis.forEach(([[x, y], text], index) => {
                ctx.fillText(text, x, y);
                ctx.beginPath();
                ctx.lineWidth = 2;
                // ctx.lineDashOffset = 20;
                ctx.moveTo(x, this.originY)
                ctx.lineTo(x, this.originY - this.height);
                ctx.stroke();

            })

        }
    }

    handleXMax(xMax = this.axisOptions?.x?.max || 0) {
        // const { value } = this.axisText;
        // let _xMax = value(xMax);
        const num = xMax / 60;
        const remain = num / Math.floor(num);
        return {
            num,
            remain,
        }
    }

    drawLabel(ctx = this.ctx, data = this.data) {

        const itemNum = data.length;
        const radius = 5 * this.dpi;
        const baseX = this.originX;
        const space = 10 * this.dpi;
        const labelSpace = 15 * this.dpi;
        const baseLen = ctx.measureText("老师授课").width
        const lenNum =
            (radius * 2 + space) * itemNum
            + labelSpace * (itemNum - 1)
            // + ctx.measureText(data.reduce((pre, cur) => pre += cur.style.text, '')).width;
            + baseLen * itemNum
        // console.log('lenNum', lenNum, this.width);

        const baseOffset = (this.width - lenNum) / 2;
        let lastLen = 0;
        data.reverse().forEach(({ style: { text, color } }, index) => {

            const len = baseLen;
            const x = baseX + lastLen + baseOffset;
            const y = this.originY + 150;
            ctx.font = 12 * this.dpi + 'px PingFangSC-Regular';
            this.drawPoint(ctx, x, y, color, radius);
            ctx.fillStyle = '#7c7c7c';
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            // console.log('drawLabel', x, lastLen);
            ctx.fillText(text, x + space, y);
            lastLen += radius * 2 + space + len + labelSpace;
        })
    }


}