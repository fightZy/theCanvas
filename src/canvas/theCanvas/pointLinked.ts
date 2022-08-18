import { asPercentNumber, bezierCurve, easing } from "../utils";
const { getControlPoints } = bezierCurve;
/**
 * 连线节点
 */
export class LinePoint implements LinePointMethods {
    x: number
    y: number
    previous: LinePoint
    next: LinePoint
    type: pointType
    // raw: pointOptions
    controlPoints: {
        previous: coordinate | [],
        next: coordinate | [],
    }

    id: number

    constructor(options: pointOptions & { previous?: LinePoint, next?: LinePoint }) {
        const { x, y, previous, next, type = "straight" } = options
        this.x = x;
        this.y = y;
        this.previous = previous;
        this.next = next;
        this.type = type;
        this.controlPoints = {
            previous: [],
            next: [],
        }
    }

    /**
     * 更新控制点
     */
    updateControlPoints() {
        if (this.previous && this.next) {
            const { x: px, y: py } = this.previous;
            const { x: nx, y: ny } = this.next;
            // debugger
            const [c1x, c1y, c2x, c2y] = getControlPoints(px, py, this.x, this.y, nx, ny);
            this.controlPoints = {
                // 限制超出 导致反向
                previous: c1x < px ? [] : [c1x, c1y],
                next: c2x > nx ? [] : [c2x, c2y],
            }
        } else {
            this.controlPoints = {
                previous: [],
                next: [],
            }
        }
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y
    }

    animationChange(args: pointAnimationOptions) {
        const { change: { x: _x, y: _y }, type = "easeInQuart" } = args;
        const { x, y } = this;
        return (progress: number) => {
            const easeProgress = easing[type](progress);
            this.x = x + easeProgress * _x;
            this.y = y + easeProgress * _y;
        }
    }
}

/**
 * 点链表
 */
export default class PointLinked {
    head: LinePoint
    end: LinePoint
    xMax: LinePoint
    yMax: LinePoint

    /**
     * 
     * @param points 
     */
    constructor(points?: pointsData, type?: pointType) {
        if (points) this.setPoints(points, type);
    }

    /**
     * 初始化点数据
     * @param points 
     */
    // initLinked(points: pointsData) {
    //     points.forEach(item => this.addPoint(item))
    // }

    /**
     * 格式化获取到的点的数据
     * @param point 
     */
    normalizePointData: (point: pointData) => pointOptions = (point) => {
        let x: number, y: number, type: pointType;
        // array or object
        if (Array.isArray(point)) {
            [x, y] = point;
        } else {
            const { x: _x, y: _y, type: _type } = point;
            x = _x;
            y = _y;
            type = _type;
        }
        return { x, y, type }
    }

    /**
     * 添加点数据
     * @param point 
     */
    id = 0;
    addPoint(point: pointData, _type?: pointType) {
        const { x, y, type } = this.normalizePointData(point);
        const previous = this.end;
        const linePoint = new LinePoint({ x, y, type: type || _type, previous })
        // linePoint.raw = { x, y, type };
        linePoint.id = this.id++;
        if (this.end) {
            this.end.next = linePoint;
            // 曲线
            this.end.type === 'curve' && this.end.updateControlPoints()
        }
        this.end = linePoint;
        if (!this.head) this.head = linePoint;
        this.calcMax(linePoint);
    }

    /**
     * 计算边界
     * @param point 
     */
    private calcMax(point: LinePoint) {
        const { xMax, yMax } = this;
        const { x, y } = point;

        if (!xMax || xMax.x <= x) {
            this.xMax = point;
        }

        if (!yMax || yMax.y >= y) {
            this.yMax = point;
        }

        // ? todo min data
    }

    setPoints(points: pointsData, type?: pointType) {
        this.head = null;
        this.end = null;
        this.xMax = null;
        this.yMax = null;
        // this.initLinked(points, type);
        points.forEach(item => this.addPoint(item, type))
    }

    scalePoints(fx: number, fy: number, point = this.head) {
        if (!point) return;
        const { x, y, previous, next } = point;
        point.updatePosition(x * fx, y * fy);
        if (previous && previous.type === 'curve') previous.updateControlPoints();
        return this.scalePoints(fx, fy, next);
    }

    animationAddPoint(point: pointData) {

    }

    animationChange(points: pointsData, duration: number, easeType: easeType = "easeInQuart") {
        let node = this.head;
        const changes = points.reduce<Map<LinePoint, ReturnType<LinePointMethods['animationChange']>>>((pre, cur) => {
            const { x: target_x, y: target_y, type } = this.normalizePointData(cur);
            if (node) {
                node.type = type ?? node.type;
            } else {
                // debugger
                // * 保存旧xMax
                const { xMax } = this;
                // * 更新xMax yMax
                this.addPoint(cur, type || xMax.type);
                node = this.end;

                // console.log(xMax.id, node.id);

                // * 修改为动画起始点
                node.x = xMax.x;
                node.y = 0;
            }
            const { x, y } = node;
            pre.set(node, node.animationChange({ change: { x: target_x - x, y: target_y - y }, type: easeType }))
            
            node = node.next;

            return pre;
        }, new Map)
        if (node) {
            const end = node.previous;
            end.next = null;
            end.updateControlPoints();
            this.end = end;
        }
        // console.log('changes', points, this, changes);

        const startTime = Date.now();
        const endTime = startTime + duration;
        return () => {
            const nowTime = Date.now();
            const progress = asPercentNumber((nowTime - startTime) / duration);
            this.runPoints((node) => {
                const pointChange = changes.get(node);
                pointChange(progress)
                const previousNode = node.previous;
                if (previousNode && previousNode.type === 'curve') {
                    previousNode.updateControlPoints();
                }
                if(progress === 1){
                    this.calcMax(node);
                }
            })
            return nowTime >= endTime ? true : false;
        }
    }


    runPoints(fn: (node: LinePoint) => void, node: LinePoint = this.head) {
        if (node) {
            fn(node);
            if (node.next) {
                return this.runPoints(fn, node.next);
            }
        }
    }


}
