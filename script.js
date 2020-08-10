import * as tf from "@tensorflow/tfjs";
import { getImages } from "./data";
import { img2x, file2img } from "./utils";
import * as tfvis from "@tensorflow/tfjs-vis";

const MOBILENET_MODEL_PATH = "http://127.0.0.1:8080/model.json";

const NUM_CLASSES = 3;
const BRAND_CLASSES = ['android', 'apple', 'windows'];

const IMG_WIDTH = 224;

const drawBoard = document.querySelector("#drawBoard");
const pen = drawBoard.getContext("2d");
const penWeight = 6;
const penColor = "#000";
const drawHistory = [];

const igd = pen.getImageData(0, 0, IMG_WIDTH, IMG_WIDTH)
const data = igd.data;
for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 255) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
    }
}
pen.putImageData(igd, 0, 0);

function convertCanvasToImage (canvas, p) {
    p && drawHistory.push(pen.getImageData(0, 0, IMG_WIDTH, IMG_WIDTH));

    const image = new Image();
    image.src = canvas.toDataURL("image/jpeg");
    image.width = IMG_WIDTH;
    image.height = IMG_WIDTH;

    document.querySelector("#png").innerHTML = "";
    document.querySelector("#png").appendChild(image)

    window.predict(image);
    return image;
}

window.onload = async () => {
    document.querySelector("#drawBoardBox").hidden = true;

    const { inputs, labels } = await getImages();

    // loadLayersModel: Load a model composed of Layer objects, including its topology and optionally weights.
    const mobilenet = await tf.loadLayersModel(MOBILENET_MODEL_PATH);

    // 查看一下模型结构，为了更好的思考在哪阶段  // Print a text summary of the model's layers.
    mobilenet.summary();

    const layer = mobilenet.getLayer("conv_pw_13_relu");

    const truncatedMobilenet = tf.model({
        inputs: mobilenet.inputs,
        outputs: layer.output
    });

    const model = tf.sequential();

    model.add(tf.layers.flatten({
        // 输出层的输出形状
        inputShape: layer.outputShape.slice(1)
    }));

    model.add(tf.layers.dense({
        // 神经元个数
        units: 10,
        // 激活函数：非线性变化
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        // 最后分类的个数
        units: NUM_CLASSES,
        activation: "softmax"
    }));

    // 设置损失函数和优化器
    model.compile({
        loss: "categoricalCrossentropy",
        optimizer: tf.train.adam()
    });

    // 把图片变成截断模型需要的格式
    const { xs, ys } = tf.tidy(() => {
        // concat：把两个 tensor 连起来
        const xs = tf.concat(inputs.map(imgEl => truncatedMobilenet.predict(img2x(imgEl))));
        const ys = tf.tensor(labels);

        return { xs, ys };
    });

    await model.fit(xs, ys, {
        epochs: 20,
        callbacks: tfvis.show.fitCallbacks(
            { name: "训练效果" },
            ["loss"],
            // 只显示 onEpochEnd
            { callbacks: ["onEpochEnd"] }
        )
    });

    window.predict = async (f, t) => {
        let img;
        if (t) {
            img = await file2img(f);
        } else {
            img = f;
        }

        const pred = tf.tidy(() => {
            const input = truncatedMobilenet.predict(img2x(img))
            return model.predict(input);
        });
        // 第二维取 1
        const index = pred.argMax(1).dataSync()[0];
        console.log("结果", index, BRAND_CLASSES[index]);
    }

    document.querySelector("#drawBoardBox").hidden = false;

    drawBoard.onmousedown = (e) => {
        const start_x = e.clientX - drawBoard.offsetLeft + document.body.scrollLeft;
        const start_y = e.clientY - drawBoard.offsetTop + document.body.scrollTop;
        pen.beginPath();
        pen.moveTo(start_x, start_y);
        pen.lineCap = 'round';
        pen.lineJoin = "round";
        pen.strokeStyle = penColor;
        pen.lineWidth = penWeight;



        drawBoard.onmousemove = (e) => {
            const move_x = e.clientX - drawBoard.offsetLeft + document.body.scrollLeft;
            const move_y = e.clientY - drawBoard.offsetTop + document.body.scrollTop;
            pen.lineTo(move_x, move_y);
            pen.stroke();
        }
        drawBoard.onmouseup = (e) => {
            pen.closePath();
            drawBoard.onmousemove = null;
            drawBoard.onmouseup = null;
            convertCanvasToImage(drawBoard, true);
        }
    }

    window.clearBoard = () => {
        // pen.clearRect(0, 0, IMG_WIDTH, IMG_WIDTH);
        pen.putImageData(igd, 0, 0);
        convertCanvasToImage(drawBoard);
    }

    window.withdraw = () => {
        if (drawHistory.length === 0) {

            return;
        }
        if (drawHistory.length === 1) {
            pen.putImageData(igd, 0, 0);
        } else {
            pen.putImageData(drawHistory[drawHistory.length - 2], 0, 0);
        }
        drawHistory.pop();
        convertCanvasToImage(drawBoard);
    }
}

