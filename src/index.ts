import { ProgressLineChart } from "./canvas";
import "./index.less"

const div = document.getElementById('canvasRoot');

const getRandomPoint = (index: number): coordinate => [index, index + Math.random() * index * 0.5];
const getRandomData = (length: number = 20): coordinate[] => Array.from({ length }, (_, index) => getRandomPoint(index));
const getGrowRandomData = (length: number = 5) => () => getRandomData(length++);

const addButton = (text: string, parent: HTMLElement) => {
    const button = document.createElement('button');
    button.style.width = 'auto';
    button.style.height = '20px';
    button.textContent = text
    parent.appendChild(button);
    return button;
}

const addNormalListener = (btn: HTMLButtonElement, fn: (...args: any[]) => void) => {
    btn.addEventListener('click', fn);
    return () => {
        btn.removeEventListener('click', fn);
    }
}

const addIntervalListener = (btn: HTMLButtonElement, fn: (...args: any[]) => void, time: number = 600) => {
    let open = false;
    let timeout = null;
    const originText = btn.textContent;
    const _fn = () => {
        open = !open;
        btn.textContent = originText + ': ' + open;
        if (open) {
            timeout = setInterval(fn, time)
        } else {
            clearInterval(timeout)
            timeout = null;
        }
    }
    btn.addEventListener('click', _fn);
    return () => {
        btn.removeEventListener('click', _fn);
    }

}

const renderChart = (easeType: easeType) => {
    const box = document.createElement('div')
    box.className = 'box'
    const chart = new ProgressLineChart({
        canvasContainer: box,
        style: { process: 'black', line: "#0000006e", fill: "gray" },
        canvasStyle: {
            width: 1000,
            height: 300,
            paddingInline: 50,
        },
        fuseSpace: -Infinity,
    });
    box.appendChild(document.createTextNode(easeType))
    const btn1 = addButton('randomData', box);
    const btn2 = addButton('auto randomData', box)
    const btn3 = addButton('growRandomData', box)
    const btn4 = addButton('auto growRandomData', box)
    const btn5 = addButton('custom appearanceTransition', box)
    const btn6 = addButton('auto addRandomData', box)




    div.appendChild(box);

    const data: coordinate[] = [
        [
            1,
            0.3
        ],
        [
            2,
            0.3
        ],
        [
            3,
            0.3
        ],
        [
            4,
            0.6
        ],
        [
            5,
            0.5
        ],
        [
            6,
            0.7
        ],
        [
            7,
            0.3
        ],
        [
            8,
            0.3
        ],
        [
            9,
            0.6
        ],
        [
            10,
            1
        ],
        [
            10.1,
            10.799999999999965
        ]
    ]
    chart.setPointsData(data)
    // chart.drawMainLine();
    console.log(chart);

    const animationOptions: normalAnimationOptions = {
        duration: 500,
        easeType,
    }
    const animationTodo = () => {
        chart.clear();
        chart.drawMainLine();
        chart.drawChart();
        chart.drawAllPoints(chart.ctx, chart.points.head);
    }
    animationTodo()



    addNormalListener(btn1, () => {
        chart.animation(getRandomData(), animationTodo, animationOptions);
        // AppearanceTransition(getRandomData());
    })
    addIntervalListener(btn2, () => {
        chart.animation(getRandomData(), animationTodo, animationOptions);
    })
    const growRandomData1 = getGrowRandomData();
    addNormalListener(btn3, () => {
        chart.animation(growRandomData1(), animationTodo, animationOptions);
    })
    const growRandomData2 = getGrowRandomData();
    addIntervalListener(btn4, () => {
        chart.animation(growRandomData2(), animationTodo, animationOptions);
    })

    const AppearanceTransition = (data: coordinate[]) => {
        const _data: coordinate[] = data.map(([x]) => [x, 0])
        chart.setPointsData(_data)
        chart.animation(data, animationTodo, animationOptions);
    }
    addNormalListener(btn5, () => {
        AppearanceTransition(getRandomData())
    })

    const data6 = getRandomData();
    addIntervalListener(btn6, () => {
        data6.push(getRandomPoint(data6.length));
        chart.animation(data6, animationTodo, animationOptions);
    })
}

renderChart("easeInQuad")
// renderChart("easeOutQuad")
// renderChart("easeInOutQuad")
// renderChart("easeInOutBounce")
// renderChart("easeInQuad")
// renderChart("easeInQuart")
// renderChart("easeInQuint")
// renderChart("easeInSine")
// renderChart("Linear")

