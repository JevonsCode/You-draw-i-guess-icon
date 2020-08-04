from pyquery import PyQuery as pq
import json
import requests

URL = "https://ant.design/components/icon-cn/"


def wr(content, fileName):  # 现在con是字典形式
    with open("./crawler/static/" + fileName + ".svg", "w", encoding="utf-8") as f:
        f.write(content)


def main():
    html = requests.get(URL).text
    document = pq(html)
    ele_lis = document(".anticons-list .Outlined")

    for ele_li in ele_lis:
        e = pq(ele_li)
        svg = e("svg")
        name = e(".ant-badge").text()
        wr(str(svg).replace("width=\"1em\" height=\"1em\"",
                            "width=\"28px\" height=\"28px\""), str(name))


if __name__ == "__main__":
    main()
