import easing from "./easing";
export { easing };

const { sqrt, pow } = Math;
export const sumSquares = (num: number) => pow(num, 2);
export const getSafeNumber = (num: number, safeNumber = 0) => isFinite(num) ? num : safeNumber;

export const bezierCurve = {

    /**
     * 获取控制点
     */
    getControlPoints(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, t = 0.5) {
        // distance between the knots
        const d01 = sqrt(sumSquares(x1 - x0) + sumSquares(y1 - y0));
        const d12 = sqrt(sumSquares(x2 - x1) + sumSquares(y2 - y1));
        // scaling factor
        const dSum = d01 + d12;
        let f1 = getSafeNumber(t * d01 / dSum);
        let f2 = getSafeNumber(t * d12 / dSum);
        // compute control points
        const baseH = y2 - y0
        const baseW = x2 - x0
        const c1x = x1 - f1 * baseW;
        const c1y = y1 - f1 * baseH;
        const c2x = x1 + f2 * baseW;
        const c2y = y1 + f2 * baseH;
        return [c1x, c1y, c2x, c2y];
    },


}
/**
 * 限制数字在 0 ～ 1
 */
export const asPercentNumber = (num: number) => Math.max(0, Math.min(num, 1))