/** 点的类型，直线或曲线上的点 */
type pointType = 'straight' | 'curve'

/** 坐标 */
type coordinate = [number, number];

/** 点描述，配置描述或坐标 */
type pointData = pointOptions | coordinate

/** 点的原数据 */
type pointsData = pointData[];

/**
 * - Bounce 触底弹跳 
 * - Back 超出一段再返回
 * 
 * 建议使用 Quad
 */
type easeType =
    "Linear"
    | "easeInQuad"
    | "easeOutQuad"
    | "easeInOutQuad"
    | "easeInCubic"
    | "easeOutCubic"
    | "easeInOutCubic"
    | "easeInQuart"
    | "easeOutQuart"
    | "easeInOutQuart"
    | "easeInQuint"
    | "easeOutQuint"
    | "easeInOutQuint"
    | "easeInSine"
    | "easeOutSine"
    | "easeInOutSine"
    | "easeInExpo"
    | "easeOutExpo"
    | "easeInOutExpo"
    | "easeInCirc"
    | "easeOutCirc"
    | "easeInOutCirc"
    | "easeInElastic"
    | "easeOutElastic"
    | "easeInOutElastic"
    | "easeInBack"
    | "easeOutBack"
    | "easeInOutBack"
    | "easeInBounce"
    | "easeOutBounce"
    | "easeInOutBounce"


/** 点基本配置选项 */
interface pointOptions {
    x: number,
    y: number,
    type?: pointType,
}

/**  */
interface TheCanvasOptions {

    canvas?: HTMLCanvasElement,
    canvasContainer?: HTMLElement,
    canvasStyle: {
        width?: number,
        height?: number,
        padding?: number,
        paddingInline?: number,
    }
}

/** 样式 */
interface colorStyle {
    line?: string,
    // background?: string,
    fill?: string,
}

/** 坐标轴配置 */
interface axisOptions {
    x: {
        max: number,
    },
    y: {
        max: number,
    }
}

/** 折线图配置 */
interface LineChartOptions extends TheCanvasOptions {
    data?: pointsData,
    style?: colorStyle,
    axisOptions?: axisOptions,
    fuseSpace?: number,
}

/** 进度折现图 */
interface ProgressLineChartOptions extends LineChartOptions {
    style: colorStyle & { process: string }
}

interface pointAnimationOptions {
    change: {
        x: number,
        y: number,
    },
    type?: easeType,
}

interface LinePointMethods {
    animationChange(args: pointAnimationOptions): (progress: number) => void;
}

interface normalAnimationOptions {
    duration: number,
    easeType: easeType,
}