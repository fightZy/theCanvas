import PointLinked, { LinePoint } from "./pointLinked";

// todo implements 规定扩展需要一些必要的借口 

export default class TheCanvas {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    canvasStyle: TheCanvasOptions['canvasStyle']
    dpi: number = 2

    constructor(options: TheCanvasOptions) {
        this.canvas = this.initCanvas(options);
        this.ctx = this.canvas.getContext('2d');
    }

    initCanvas(options: TheCanvasOptions) {
        const { canvas, canvasContainer, canvasStyle = {}, autoInitSize, dpi } = options;
        const defaultCanvasStyle: TheCanvasOptions['canvasStyle'] = { paddingBlock: 0, paddingBottom: 0, paddingInline: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 }
        const _canvasStyle = { ...defaultCanvasStyle, ...canvasStyle };
        this.dpi = dpi || this.dpi;
        Object.keys(_canvasStyle).forEach(key => {
            _canvasStyle[key] = _canvasStyle[key] * this.dpi;
        })
        let _canvas = canvas;
        if (!canvas && canvasContainer) {
            const { paddingInline, width, height, paddingBlock, paddingBottom, paddingLeft, paddingRight, paddingTop } = _canvasStyle;
            _canvas = document.createElement("canvas");
            // ? 1.2
            _canvas.width = (width || canvasContainer.clientWidth) + (paddingLeft || paddingInline) + (paddingRight || paddingInline);
            _canvas.height = (height || canvasContainer.clientHeight) + (paddingBottom || paddingBlock) + (paddingTop || paddingBlock);
            canvasContainer.appendChild(_canvas);
        }
        console.log('init canvas', _canvas.width, _canvas.height);

        if (autoInitSize && canvas.parentElement) {
            const { clientWidth, clientHeight } = canvas.parentElement;
            _canvas.width = clientWidth * this.dpi;
            _canvas.height = clientHeight * this.dpi;
            _canvas.style.width = clientWidth + 'px';
            _canvas.style.height = clientHeight + 'px';
        }
        this.canvasStyle = _canvasStyle;
        return _canvas;
    }

    get width() {
        const { paddingInline, paddingLeft, paddingRight } = this.canvasStyle;
        return this.canvas.width - (paddingLeft || paddingInline) - (paddingRight || paddingInline);
    }
    set width(value) {
        const oldWidth = this.canvas.width;
        this.canvas.width = value;
        this.handleWidthChange(this.canvas.width, oldWidth);
    }
    get height() {
        const { paddingBlock, paddingBottom, paddingTop } = this.canvasStyle;

        return this.canvas.height - (paddingBottom || paddingBlock) - (paddingTop || paddingBlock);
    }
    set height(val: number) {
        this.canvas.height = val;
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
    drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, style = "#2f89ae", radius = 2, options = { fill: true, stroke: false }) {
        const { fill, stroke } = options
        ctx.save()
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        if (fill) {
            ctx.fillStyle = style;
            ctx.fill();
        }
        if (stroke) {
            ctx.strokeStyle = style;
            ctx.stroke()
        }
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

    updateCanvasWidth(canvas = this.canvas) {
        const { height, clientWidth, clientHeight } = canvas;

        if (clientWidth && height) {
            const fa = Math.round(clientWidth / clientHeight)
            const newWidth = fa * height;
            this.width = newWidth;
            // this.height = 
        }
    }

    // todo
    drawLine(ctx,) {

    }



}

