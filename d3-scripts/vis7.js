var tooltip = d3.select("body").append("div").attr("class", "tooltip-data-v4");

var svgVis7 = d3.select("#vis7"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svgVis7.attr("width") - margin.left - margin.right,
    height = +svgVis7.attr("height") - margin.top - margin.bottom,
    g = svgVis7.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x7 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var y7 = d3.scaleLinear()
    .rangeRound([height, 0]);

var z7 = d3.scaleOrdinal()
    .range(["#66c2a5", "#fc8d62 ", "#8da0cb"]);

d3.csv("/data/data_vis07.csv", function(d, i, columns) {
for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}, function(error, data_csv) {
if (error) throw error;

var keys = data_csv.columns.slice(1);
var total = keys.pop()

// console.log(keys);

// data.sort(function(a, b) { return b.total - a.total; });
var xDomain = data_csv.map(function(d) { return d.Ano; })
x7.domain(["2015"].concat(xDomain));
y7.domain([0, 8]).nice(); //d3.max(data, function(d) { return d.total; })]).nice();
z7.domain(keys);

g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data_csv))
    .enter().append("g")
    .attr("fill", function(d) {return z7(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("x", function(d) { return x7(d.data.Ano); })
    .attr("y", function(d) { return y7(d[1]); })
    .attr("height", function(d) { return y7(d[0]) - y7(d[1]); })
    .attr("width", x7.bandwidth())
    .attr("class", "text-axis default-font-family text-color")
    .on("mousemove", function(e){
            var articles = data.filter(d => d.year == e.data.Ano);
            var referenceArray = ['in a specific domain or context of use', 'from a general perspective with emphasis on a quality attribute', 'from a general perspective']
            articles = articles.sort((a, b) => referenceArray.indexOf(a.focus) - referenceArray.indexOf(b.focus))
            tooltip
                .style("left", (d3.event.pageX ) + "px")
                .style("top", (d3.event.pageY) + "px")
                .style("display", "inline-block")
                .attr("class", "tooltip-data-v4")
                .style("min-width","300px")
                .style("max-width","500px")
                .html(`
                    <strong> List of publications in ${articles[0].year}:</strong>
                    <br>
                    ${articles.map(key => (
                        `<div style="border-left: 4px solid; border-color:${key_focus.find(k => k.name == key.focus).color}; padding: 5px; margin: 5px;">
                            <strong>Publication title: </strong> ${key.title}
                            <br> <strong>Citation: </strong> ${key.citation}
                            <br> <strong>Focus: </strong> HInt ${key.focus} (${key_focus.find(k => k.name == key.focus).key})
                        </div>
                        `
                    )).join('')}
                `);
            })
    .on("mouseout", function(d){ tooltip.style("display", "none").attr("class", "tollTip");});

    // <span style="height: 10px;width: 10px;background-color: ;border-radius: 0%; display: inline-block;"></span>


var data2 = [
    { x: 2015, y: 0 },
    { x: 2016, y: 1 },
    { x: 2017, y: 2 },
    { x: 2018, y: 3 },
    { x: 2019, y: 7 },
    { x: 2020, y: 6 },
    { x: 2021, y: 1 },
];

g.append("path")
    .datum(data2)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
    .x(function(d) { return x7(d.x) + 43 })
    .y(function(d) { return y7(d.y)})
)

data2.forEach(function(p) {
    g.append('circle')
        .attr('class', 'dot')
        .attr('cx', x7(p.x) + 43 )
        .attr('cy', y7(p.y))
        .attr('r', 5)
})

g.append("g")
    .attr("class", "text-axis default-font-family text-color")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x7).tickSize(0))
    .selectAll("text")
    .attr('dy', '1.05em');

// text label for the x axis
g.append("text")             
    .attr("transform",
            "translate(" + (width/2) + " ," + 
                        (height + margin.top + 10) + ")")
    .style("text-anchor", "middle")
    .attr("class", "text-axis default-font-family text-color")
    .text("Year");

g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("class", "text-axis default-font-family text-color")
    .text("Number of Publications");  

g.append("g")
    .call(d3.axisLeft(y7).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", y7(y7.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("class", "text-axis default-font-family text-color")

// select the svg area
var svg = d3.select("#vis7legend")

//icon
xIcon = width - 110 
yIcon = 7

svg.append("svg")
    .attr("x", xIcon)
    .attr("y", yIcon)
    .append("path")
    .attr("d","M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z")
    .attr("fill", "var(--gray)")
  
svg.append("svg")
    .attr("x", xIcon)
    .attr("y", yIcon)
    .append("path")
    .attr("d", "M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z")
    .attr("fill", "var(--gray)")

svg.append("text")
    .text("Data collected from")
    .attr("class", "focus-contributions__vertical-bar-graph__info-label")
    .attr("text-anchor", "end")
    .style("opacity","0.6")
    .attr("x", width + margin.right)
    .attr("y", 20)
    .attr("cursor","default")
    .append("tspan")
    .text("January 2015 to")
    .attr("x",width + margin.right)
    .attr("dy","1.2em")
    .append("tspan")
    .append("tspan")
    .text("January 2021.")
    .attr("x",width + margin.right)
    .attr("dy","1.2em")

// Legend
var legend = svg.append("g")
    .append("svg")
    .attr("id", "svg_focus_legend")
    .attr("class", "text-axis default-font-family text-color")
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(keys.slice())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
    .attr("x", width - 600)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z7);

legend.append("text")
    .attr("x", width - 575)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .attr("font-size", "12px")
    .text(function(d) { return d.split('HInt')[1]; });

});