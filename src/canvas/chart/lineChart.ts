import TheCanvas from "../theCanvas";
import PointLinked, { LinePoint } from "../theCanvas/pointLinked";
import { getSafeNumber } from "../utils";

/** 线行图表 */
export default class LineChart extends TheCanvas {
    style: colorStyle
    axisOptions: axisOptions
    points: PointLinked
    currentAnimation?: number = null;
    fuseSpace: number = 10

    constructor(options: LineChartOptions) {
        const { data, style = {}, axisOptions, fuseSpace } = options;
        super(options)
        this.style = style;
        this.axisOptions = axisOptions;
        this.fuseSpace = fuseSpace ?? this.fuseSpace;
        if (data && axisOptions) {
            this.initPoints(data)
            this.drawChart(this.ctx, this.points);
        } else {
            this.points = this.getLinePoints();
        }
    }

    get xMax() {
        return this.points.xMax.x;
    }

    get yMax() {
        return this.points.yMax.y;
    }

    get canDraw() {
        return !!(this.points && this.axisOptions)
    }

    /** 
     * 根据数据自动计算最大坐标
     * */
    autoAxisMax(data: pointsData) {
        let xMax = this.axisOptions?.x?.max ?? 0;
        let yMax = this.axisOptions?.y?.max ?? 0;
        let needAutoXMax = false, needAutoYMax = false;
        if (xMax === 0) needAutoXMax = true;
        if (yMax === 0) needAutoYMax = true;
        if (!needAutoXMax && !needAutoYMax) return;
        data.forEach((item) => {
            const { x, y } = this.points.normalizePointData(item);
            if (needAutoXMax && xMax < x) xMax = x;
            if (needAutoYMax && yMax < y) yMax = y;
        })
        const sourceData: Partial<axisOptions> = {};
        if (needAutoXMax) {
            sourceData.x = { max: xMax }
        }
        if (needAutoYMax) {
            // 顶部预留一定的空间
            sourceData.y = { max: yMax + yMax * 0.3 }
        }
        this.axisOptions = Object.assign(this.axisOptions || { x: null, y: null }, sourceData)
    }

    setPointsData(data: pointsData) {
        this.clear()
        this.autoAxisMax(data)
        this.initPoints(data)
        // this.drawChart(this.ctx, this.points);
    }

    setAxisOptions(options: axisOptions) {
        this.axisOptions = options;
    }


    /**
     * 初始化点数据
     * @param data 
     */
    initPoints(data: pointsData) {
        const _data = this.transformData(data);
        if (this.points) {
            this.points.setPoints(_data, 'curve')
        } else {
            this.points = this.getLinePoints(_data, 'curve');
        }
    }

    /**
     * 
     * @param data 
     * @returns 
     */
    transformData(data: pointsData) {
        const { paddingInline = 0 } = this.canvasStyle;
        const _data = data.slice();
        const w = this.width;
        const h = this.height;
        const { x: { max: xMax }, y: { max: yMax } } = this.axisOptions;
        const fx = getSafeNumber(w / xMax);
        const fy = getSafeNumber(h / yMax);

        // * 使得图形首尾连贯
        // _data.unshift([0, 0])
        // _data.push([xMax, 0])

        return _data.map(item => {
            const _item = this.points.normalizePointData(item);
            const { x, y } = _item;
            return {
                ..._item,
                x: x * fx + paddingInline,
                y: h - y * fy,
            }
        })

    }

    autoMergeSpaceLinePoint(ctx: CanvasRenderingContext2D, curPoint: LinePoint, nextPoint: LinePoint) {
        const { x, y } = curPoint;

        // this.drawLinePoint(ctx, curPoint)

        // 当还有下下个节点时，如果两点之间有一位置间距最小合并间距，则将他们合并
        while (nextPoint.next && (Math.abs(x - nextPoint.x) <= this.fuseSpace || Math.abs(y - nextPoint.y) <= this.fuseSpace)) {
            nextPoint = nextPoint.next
        }
        if (nextPoint) {
            this.drawLineToPoint(ctx, curPoint, nextPoint);
        }
        if (nextPoint.next) {
            return this.autoMergeSpaceLinePoint(ctx, nextPoint, nextPoint.next);
        }
    }


    drawMainPointsLine(ctx: CanvasRenderingContext2D, points: PointLinked) {
        const { head } = points;
        if (head) {
            ctx.moveTo(head.x, head.y);
            head.next && this.autoMergeSpaceLinePoint(ctx, head, head.next)
            // this.drawLineToPoint(ctx, head.next);
            // ctx.lineTo(head.x, head.y);
        }
    }

    drawMainLine(ctx = this.ctx, points = this.points, style = this.style) {
        if (points) {
            const { line = '#00000000', } = style
            ctx.beginPath()
            this.drawMainPointsLine(ctx, points);
            ctx.strokeStyle = line;
            ctx.stroke()
        }
    }

    /**
     * 画出当前图表
     * @param  ctx 
     * @param  points 
     */
    drawChart(ctx = this.ctx, points = this.points, style = this.style) {
        if (points) {
            const { line = '#00000000', fill = 'rgb(255,255,255,0.5)' } = style
            const { end, head } = this.points;
            ctx.beginPath()
            this.drawMainPointsLine(ctx, points);
            ctx.lineTo(end.x, this.height);
            ctx.lineTo(0, this.height);
            ctx.lineTo(head.x, head.y);
            ctx.strokeStyle = line;
            ctx.fillStyle = fill;
            ctx.stroke()
            ctx.fill()
        }
    }

    handleWidthChange(newWidth: number, oldWidth: number): void {
        const fx = newWidth / oldWidth;
        this.points.scalePoints(fx, 1);
    }

    animationChange(data: pointsData, duration: number, easeType: easeType) {
        if (isFinite(this.currentAnimation)) window.cancelAnimationFrame(this.currentAnimation);
        this.setAxisOptions({ x: null, y: null })
        this.autoAxisMax(data);
        const _data = this.transformData(data);
        const effectFn = this.points.animationChange(_data, duration, easeType);
        const run = (beforeChange?: () => void) => {
            this.currentAnimation = window.requestAnimationFrame(() => {
                const finish = effectFn();
                // console.log('finish',finish);
                beforeChange && beforeChange()
                if (finish) {
                    this.currentAnimation = null;
                } else {
                    run(beforeChange);
                }
            })
        }
        return run;
    }

    animation(data: pointsData, todo: (chart: LineChart) => void, options: normalAnimationOptions = { duration: 3000, easeType: "easeInQuart" }) {
        const { duration, easeType } = options;
        const run = this.animationChange(data, duration, easeType)
        run(() => {
            todo(this);
            // this.clear();
            // this.drawChart();
            // this.drawMainLine();
            // this.drawAllPoints(this.ctx, this.points.head);
        })
    }


}

