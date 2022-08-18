import TheCanvas from ".";
import { getSafeNumber } from "../utils";

const defaultAxis: axisOptions = {
    x: {
        max: 0,
        min: 0,
    },
    y: {
        max: 0,
        min: 0,
    }
}

export interface PlaneAxisOptions extends TheCanvasOptions {
    axisOptions?: axisOptions,
    axisStyle?: {
        color: string,
    }
}
export default class PlaneAxis extends TheCanvas {
    axisOptions: axisOptions;
    axisStyle: {
        color?: string,
    }

    constructor(options: PlaneAxisOptions) {
        super(options)
        const { axisOptions, axisStyle = {} } = options;
        this.axisStyle = axisStyle;
        this.setAxisOptions(axisOptions);
    }

    /** x轴原点位置 */
    get originX() {
        const { paddingInline, paddingLeft } = this.canvasStyle;
        return (this.axisOptions?.x?.min || 0) + (paddingLeft || paddingInline)
    }
    /** y轴原点位置 */
    get originY() {
        const { paddingBlock, paddingBottom, paddingTop } = this.canvasStyle;
        return this.height - (this.axisOptions?.y?.min || 0) + (paddingTop || paddingBlock)
    }



    setAxisOptions(options: axisOptions = defaultAxis) {
        const { x = {}, y = {} } = options;
        const { x: _x, y: _y } = defaultAxis;
        this.axisOptions = { x: { ..._x, ...x }, y: { ..._y, ...y } };
    };

    autoAxisMax<T extends { x: number, y: number }[]>(data: T) {
        let { x: { max: xMax, min: xMin }, y: { max: yMax, min: yMin } } = this.axisOptions;
        data.forEach(({ x, y }) => {
            if (xMax < x) xMax = x;
            else if (xMin > x) xMin = x;
            if (yMax < y) yMax = y;
            else if (yMin > y) yMin = y;
        })
        this.axisOptions = {
            x: { max: xMax, min: xMin },
            y: { max: yMax, min: yMin },
        }
    }

    getTransformDataHandle() {
        const { x: { max: xMax, min: xMin }, y: { max: yMax, min: yMin } } = this.axisOptions
        const { width, height } = this;
        const fx = getSafeNumber(width / (xMax - xMin));
        const fy = getSafeNumber(height / (yMax - yMin));
        const { max, min } = Math;
        const { paddingInline, paddingBlock, paddingLeft, paddingTop } = this.canvasStyle;
        return {
            handleX: (x: number) => x * fx + (paddingLeft || paddingInline),
            handleY: (y: number) => height - y * fy + (paddingTop || paddingBlock),
            handleXNumber: (x: number) => x * fx,
            handleYNumber: (y: number) => height - y * fy,
            limitX: (x: number) => max(xMin, min(xMax, x)),
            limitY: (y: number) => max(yMin, min(yMax, y)),
        }
    }
}