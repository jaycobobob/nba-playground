/// <reference path="d3.js"/>

let statProperNames = {
    "G" : "Games Played",
    "GS" : "Games Started",
    "MP": "Minutes Per Game",
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
        left : 75,
        right : 20,
        top : 20,
        bottom : 75
    }

    let plotsSpot = d3.select("#two-stat-plots")

    let thisPlot = plotsSpot.append("div").attr("class", "two-stat-plot-wrapper")
    let svg = thisPlot.append("div").attr("class", "svg-wrapper").append("svg")
    let dropdowns = thisPlot.append("div").attr("class", "dropdown-div")

    svg.attr("class", "two-stat-svg").attr("width", width).attr("height", height)

    // data bind
    let players = svg.selectAll("circle")
        .data(playerData)
        .enter()

    // Making the dropdowns and their labels
    let xDropdown = dropdowns.append("div")
        .append("label")
        .text("X Value: ")
        .attr("class", "stat-coord-label")
        .append("select")
        .attr("class", "stat-coord-select")
    xDropdown.append("option").attr("value", "").text("Select an attribute")
    let yDropdown = dropdowns.append("div")
        .append("label")
        .text("Y Value: ")
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
    for (stat of keyHeads) {
        xDropdown.append("option").attr("value", stat).text(statName())
        yDropdown.append("option").attr("value", stat).text(statName())
    }

    // drawing initial axes and labels    
    let xScale = d3.scaleLinear().domain([0,1]).range([padding.left, width - padding.right])
    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(0)
    let yScale = d3.scaleLinear().domain([0,1]).range([padding.top, height - padding.bottom])
    let yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(0)
    // axes
    svg.append("g")
        .attr("transform", `translate(${0}, ${height - padding.bottom})`)
        .call(xAxis)
        .attr("class", "xAxis")
    svg.append("g")
        .attr("transform", `translate(${padding.left}, ${0})`)
        .call(yAxis)
        .attr("class", "yAxis")
    // labels
    svg.append("text")
        .attr("class", "xLabel")
        .attr("x", xScale(.5)) // get in the middle of the axis
        .attr("y", height - padding.bottom / 2)
        .attr("text-anchor", "middle")
    svg.append("text")
        .attr("class", "yLabel")
        .attr("x", padding.left / 2) // get in the middle of the axis
        .attr("y", yScale(.5))
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(${90},${padding.left / 2},${yScale(.5)})`)

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
                .text("")
        }
        let year = "2020-21"
        console.log(xSelection)
        console.log(ySelection)

        // calculating the max and min of x and y
        let xData = playerData.map(function(player) { 
            if (player["statsByYear"][year] != undefined)
                return player["statsByYear"][year][xSelection]
            return 0
        })
        let yData = playerData.map(function(player) { 
            if (player["statsByYear"][year] != undefined)
                return player["statsByYear"][year][ySelection]
            return 0
        })
        let playerNames = playerData.map(function(player) {
            return player["name"]
        })

        let xMin = d3.min(xData)
        let xMax = d3.max(xData)
        let yMin = d3.min(yData)
        let yMax = d3.max(yData)

        // creating the dataset we will use to map our data
        let thisData = d3.zip(xData, yData, playerNames)

        // creating the scales for the graph
        let xScale = d3.scaleLinear().domain([xMin, xMax]).range([padding.left, width - padding.right]).nice()  
        let yScale = d3.scaleLinear().domain([yMax, yMin]).range([padding.top, height - padding.bottom]).nice()

        let circles = svg.selectAll(".player-circle")
            .data(thisData)
        circles.exit().remove()

        circles.enter().append("circle").attr("class", "player-circle")
                .attr("r", 3)
            .merge(circles).transition().duration(1000)
                .attr("cx", function(d,i) { return xScale(thisData[i][0]) })
                .attr("cy", function(d,i) { return yScale(thisData[i][1]) })
                .text(function(d,i) { return playerNames[i] })

        // updating the axes
        let xAxis = d3.axisBottom().scale(xScale)
        svg.select(".xAxis").transition().duration(1000).call(xAxis)
        let yAxis = d3.axisLeft().scale(yScale)
        svg.select(".yAxis").transition().duration(1000).call(yAxis)

        // updating the labels
        svg.select(".xLabel").transition().delay(1000).text(statProperNames[xSelection])
        svg.select(".yLabel").transition().delay(1000).text(statProperNames[ySelection])
        
    }

    xDropdown.on("change", drawPlot)
    yDropdown.on("change", drawPlot)
}

create2Dplot(580, 580)