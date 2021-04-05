/// <reference path="d3.js"/>

let stats = Object.keys(playerData[0]["statsByYear"]["2020-21"])
let statProperNames = {
    "G" : "Games Played",
    "GS" : "Games Started",
    "MP": "Minutes",
    "FG": "Field Goal Makes",
    "FGA": "Field Goal Attempts",
    "FG%": "Field Goal Percentage",
    "3P": "Three Point Makes",
    "3PA": "Three Point Attempts",
    "3P%": "Three Point Percentage",
    "2P": "Two Point Makes",
    "2PA": "Two Point Attempts",
    "2P%": "Two Point Percentage",
    "eFG%": "Effective Field Goal Percentage",
    "FT": "Free Throw Makes",
    "FTA": "Free Throw Attempts",
    "FT%": "Free Throw Percentage",
    "ORB": "Offensive Rebounds",
    "DRB": "Defensive Rebounds",
    "TRB": "Total Rebounds",
    "AST": "Assists",
    "STL": "Steals",
    "BLK": "Blocks",
    "TOV": "Turnovers",
    "PF": "Personal Fouls",
    "PTS": "Points"
}

function create2Dplot(width, height) {
    // setting up the SVG padding
    padding = {
        left : 10,
        right : 10,
        top : 10,
        bottom : 10
    }
    width = width - padding.left - padding.right
    height = height - padding.left - padding.right

    let plotsSpot = d3.select("#two-stat-plots")

    let thisPlot = plotsSpot.append("div").attr("class", "two-stat-plot-wrapper")
    let svg = thisPlot.append("div").attr("class", "svg-wrapper").append("svg")
    let dropdowns = thisPlot.append("div").attr("class", "dropdown-wrapper")

    svg.attr("width", width).attr("height", height)

    // data bind
    let players = svg.selectAll("circle")
        .data(playerData)
        .enter()

    // Making the dropdowns and their labels
    let xDropdown = dropdowns.append("div")
        .append("label")
        .text("X Value:")
        .attr("class", "stat-coord-label")
        .append("select")
        .attr("class", "stat-coord-select")
    xDropdown.append("option").attr("value", "").text("Select an attribute")
    let yDropdown = dropdowns.append("div")
        .append("label")
        .text("Y Value:")
        .attr("class", "stat-coord-label")
        .append("select")
        .attr("class", "stat-coord-select")
    yDropdown.append("option").attr("value", "").text("Select an attribute")

    // making the prompt for more data
    dropdowns.append("div")
        .append("text")
        .text("I need more data!  Try selecting some attributes for X and Y values")
        .attr("class", "hungry-prompt")

    // populating the stat options
    function statName() {
        if (statProperNames[stat] == undefined) {
            return stat
        } return statProperNames[stat]
    }
    for (stat of stats) {
        xDropdown.append("option").attr("value", stat).text(statName())
        yDropdown.append("option").attr("value", stat).text(statName())
    }

    // actually drawing the data
    function drawPlot() {
        console.log("calling drawPlot")
        let xSelection = xDropdown.node().value
        let ySelection = yDropdown.node().value

        // if either selection does not have data, don't draw the plot
        if (xSelection == "" || ySelection == "") {
            dropdowns.select(".hungry-prompt")
                .text("I need more data!  Try selecting some attributes for X and Y values")
            return
        } else {
            console.log("all data is filled")
            dropdowns.select(".hungry-prompt")
                .text("We have enough data!")
        }

        let xData = playerData.map(function(player) { return player["statsByYear"]["2020-21"][xSelection] })
        let yData = playerData.map(function(player) { return player["statsByYear"]["2020-21"][ySelection] })

        
        
    }

    xDropdown.on("change", drawPlot)
    yDropdown.on("change", drawPlot)
}

create2Dplot(400, 400)