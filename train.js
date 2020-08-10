/**
 * 
 * hs data --cors 启动 mobilenet 模型
 * 
 * parcel ./index.html 启动本项目
 */

import * as tf from "@tensorflow/tfjs";
import { getImages } from "./data";
import { img2x, file2img } from "./utils";
import * as tfvis from "@tensorflow/tfjs-vis";

const MOBILENET_MODEL_PATH = "http://127.0.0.1:8080/model.json";

const NUM_CLASSES = 3;
const BRAND_CLASSES = ['android', 'apple', 'windows'];

window.onload = async () => {
    const { inputs, labels } = await getImages();

    const surface = tfvis.visor().surface(
        { name: "IMGS", styles: { height: 200 } }
    )

    inputs.forEach((img) => {
        surface.drawArea.appendChild(img);
    });

    // loadLayersModel: Load a model composed of Layer objects, including its topology and optionally weights.
    const mobilenet = await tf.loadLayersModel(MOBILENET_MODEL_PATH);

    // 查看一下模型结构，为了更好的思考在哪阶段  // Print a text summary of the model's layers.
    mobilenet.summary();


    // 从 conv_pw_13_relu  这一层截断，conv 是卷积的简写

    // Retrieves a layer based on either its name (unique) or index.
    const layer = mobilenet.getLayer("conv_pw_13_relu");

    // 把原 mobilenet 的输入当这个新建模型的输入，截断的层当作 outputs 完成截断
    const truncatedMobilenet = tf.model({
        inputs: mobilenet.inputs,
        outputs: layer.output
    });

    const model = tf.sequential();

    // 卷积神经网络把高维提取到的特征做分类需要 flatten
    model.add(tf.layers.flatten({
        // 输出层的输出形状
        inputShape: layer.outputShape.slice(1)
    }));


    // activation ('elu'|'hardSigmoid'|'linear'|'relu'|'relu6'| 'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh') 
    // Activation function to use.

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

    window.predict = async (f) => {
        const img = await file2img(f);
        document.body.appendChild(img);
        const pred = tf.tidy(() => {
            const input = truncatedMobilenet.predict(img2x(img))
            return model.predict(input);
        });
        console.log("-> ", pred, pred.argMax(1).dataSync())
        // 第二维取 1
        const index = pred.argMax(1).dataSync()[0];
        console.log("结果", index, BRAND_CLASSES[index]);
    }


    window.download = async () => {
        await model.save("downloads://model");
    }
};