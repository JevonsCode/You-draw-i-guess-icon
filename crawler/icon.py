from pyquery import PyQuery as pq
import json
import requests
import cairosvg


URL = "https://ant.design/components/icon-cn/"


def wr(content, fileName):
    with open("./mobilenet/static/svg/" + fileName + ".svg", "w", encoding="utf-8") as f:
        f.write(content)


def svg2png(imgName):
    svg_path = './mobilenet/static/svg/' + imgName + '.svg'
    png_path = './mobilenet/static/png/' + imgName + '.png'
    cairosvg.svg2png(url=svg_path, write_to=png_path)


def main():
    html = requests.get(URL).text
    document = pq(html)
    ele_lis = document(".anticons-list .Outlined")

    for ele_li in ele_lis:
        e = pq(ele_li)
        svg = e("svg")
        name = e(".ant-badge").text()
        wr(str(svg).replace("width=\"1em\" height=\"1em\" fill=\"currentColor\"",
                            "width=\"254\" height=\"254\" fill=\"#000000\"").replace("viewbox=", "viewBox="), str(name))
        svg2png(str(name))


if __name__ == "__main__":
    main()
