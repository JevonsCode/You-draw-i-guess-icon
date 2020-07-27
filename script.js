const drawBoard = document.querySelector("#drawBoard");
const pen = drawBoard.getContext("2d");
const penWeight = 14;
const penColor = "#000";

window.onload = () => {
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
        }
        drawBoard.onmouseleave = () => {
            pen.closePath();
            drawBoard.onmousemove = null;
            drawBoard.onmouseup = null;
        }
    }
}