/* eslint-disable no-sync */
/* eslint-disable no-loop-func */

const fetch = require("node-fetch")
const fs = require("fs")

let languages = [
    "English",
    "Spanish"
]

// https://docs.google.com/spreadsheets/d/1XqHwLVjcZa0vT-nhVVnFNqI6mc_eczX8gpUCe-VCTM4/edit?usp=sharing
for (let language of languages) {
    fetch(`https://docs.google.com/spreadsheets/d/1XqHwLVjcZa0vT-nhVVnFNqI6mc_eczX8gpUCe-VCTM4/gviz/tq?tqx=out:json&sheet=${language}`, {
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then((response) => response.text())
        .then((data) => {
            let jsonStr = data.replace("/*O_o*/", "").replace("google.visualization.Query.setResponse(", "").replace(");", "")
            let jsonObj = JSON.parse(jsonStr)
            let rowsStr = JSON.stringify(jsonObj.table.rows)

            fs.writeFileSync(`source/loc/${language}.json`, rowsStr, (error) => {
                console.log(error)
            })
        })
}
