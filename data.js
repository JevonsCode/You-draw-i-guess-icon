const IMG_SIZE = 224;

const loadImg = (src) => {
    return new Promise(r => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.width = IMG_SIZE;
        img.height = IMG_SIZE;
        img.onload = () => r(img);
    })
}

export const getImages = async () => {
    const images = [];
    const labels = [];
    let i = 0;
    while (i < 30) {
        ["android", "windows", "apple"].forEach((item) => {
            const src = `http://127.0.0.1:8080/train/${item}-${i}.jpg`;
            const imgPromise = loadImg(src);
            images.push(imgPromise);
            labels.push([
                +(item === "android"),
                +(item === "apple"),
                +(item === "windows")
            ]);
        });
        ++i;
    }

    const inputs = await Promise.all(images);
    return {
        inputs,
        labels
    }
}