import PointLinked, { LinePoint } from "./pointLinked";

export default class TheCanvas {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    canvasStyle: TheCanvasOptions['canvasStyle']

    constructor(options: TheCanvasOptions) {
        const { canvas, canvasContainer, canvasStyle, canvasStyle: { width, height } } = options;
        let _canvas = canvas;
        if (!canvas && canvasContainer) {
            const { paddingInline = 0 } = canvasStyle;
            _canvas = document.createElement("canvas");
            _canvas.width = (width || canvasContainer.clientWidth) * 1.2 + paddingInline * 2;
            _canvas.height = (height || canvasContainer.clientHeight) * 1.2;
            // _canvas.style.width = (width || canvasContainer.clientWidth) + 'px';
            // _canvas.style.height = (height || canvasContainer.clientHeight) + "px";
            canvasContainer.appendChild(_canvas);
        }
        this.canvas = _canvas;
        this.canvasStyle = canvasStyle;
        this.ctx = _canvas.getContext('2d');
    }

    get width() {
        const { paddingInline = 0 } = this.canvasStyle;
        return this.canvas.width - paddingInline * 2;
    }
    set width(value) {
        // this.widthChange = true;
        const oldWidth = this.canvas.width;
        this.canvas.width = value;
        this.handleWidthChange(this.canvas.width, oldWidth);
    }
    get height() {
        return this.canvas.height;
    }

    /**
     * 获取点链表结构
     * @param points 
     */
    getLinePoints(points: pointsData = [], type?: pointType) {
        return new PointLinked(points, type);
    }

    /**
     * 根据控制点绘制连线
     * @param ctx 
     * @param endPoints 
     * @param controlPoints 
     */
    scriptDrawLine(ctx: CanvasRenderingContext2D, endPoints: number[], controlPoints: number[] = []) {
        let lineMethod = 'lineTo';
        const CPLen = controlPoints.length;
        if (CPLen) {
            if (CPLen === 4) {
                lineMethod = 'bezierCurveTo';
            } else if (CPLen === 2) {
                lineMethod = 'quadraticCurveTo';
            } else {
                controlPoints.length = 0;
            }
        }
        ctx[lineMethod](...controlPoints, ...endPoints)
    }

    /**
     * 画点
     * @param ctx 
     * @param x 
     * @param y 
     * @param style 
     * @param radius 
     */
    drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, style = "#2f89ae", radius = 2) {
        ctx.save()
        ctx.beginPath();
        ctx.strokeStyle = style;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke()
        ctx.closePath();
        ctx.restore()
    }

    drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, style = "#2f89ae") {
        ctx.save()
        ctx.fillStyle = style;
        ctx.fillText(text, x, y);
        ctx.restore()
    }

    /**
     * 画线
     * @param ctx 
     * @param linePoint 
     */
    drawLineToPoint(ctx: CanvasRenderingContext2D, linePointBefore: LinePoint, linePointAfter: LinePoint) {
        const {
            controlPoints: { next },
        } = linePointBefore;
        const {
            x, y,
            controlPoints: { previous },
        } = linePointAfter;
        this.scriptDrawLine(ctx, [x, y], [...next, ...previous]);
        // if (next) return this.drawLine(ctx, next);
    }

    drawLinePoint(ctx: CanvasRenderingContext2D, point: LinePoint) {
        const { x, y, next: _next, controlPoints: { previous, next }, id } = point;
        this.drawPoint(ctx, x, y);
        previous.length && this.drawPoint(ctx, ...previous, '#5adc31');
        next.length && this.drawPoint(ctx, ...next, '#5adc31');
        this.drawText(this.ctx, id + '', x, y - 5);
    }

    /**
     * 画出所有点
     * @param ctx 
     * @param points
     */
    drawAllPoints(ctx: CanvasRenderingContext2D = this.ctx, point: LinePoint) {
        // const { x, y, next: _next, controlPoints: { previous, next }, id } = points;
        // this.drawPoint(ctx, x, y);
        // previous.length && this.drawPoint(ctx, ...previous, '#5adc31');
        // next.length && this.drawPoint(ctx, ...next, '#5adc31');
        // this.drawText(this.ctx, id + '', x, y - 5);
        this.drawLinePoint(ctx, point)
        if (point.next) this.drawAllPoints(ctx, point.next)
    }

    clear(ctx = this.ctx) {
        const { width, height } = this.ctx.canvas;
        ctx.clearRect(0, 0, width, height);
    }

    handleWidthChange(newWidth: number, oldWidth: number) {

    }

}

