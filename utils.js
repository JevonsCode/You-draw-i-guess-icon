import * as tf from "@tensorflow/tfjs";

/**
 * 把 img 变成 mobilenet 的格式
 * @param {*} imgEl 
 */
export function img2x (imgEl) {
    // Using this method helps avoid memory leaks. In general, wrap calls to operations in tf.tidy() for automatic memory cleanup.
    return tf.tidy(() => {
        const input = tf.browser.fromPixels(imgEl)
            .toFloat().sub(255 / 2).div(255 / 2)
            .reshape([1, 224, 224, 3]);
        return input;
    });
}


export function file2img (f) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.width = 224;
            img.height = 224;
            img.onload = () => resolve(img);
        };
    });
}