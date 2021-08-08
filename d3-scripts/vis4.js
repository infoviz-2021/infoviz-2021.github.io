var svg4 = d3.select("#vis4"),
    margin = {top: 20, right: 20, bottom: 30, left: 530},
    width = +svg4.attr("width") - margin.left - margin.right,
    height = +svg4.attr("height") - margin.top - margin.bottom;
    
var tooltip4 = d3.select("body").append("div").attr("class", "toolTip");
    
var x4 = d3.scaleLinear().range([0, width]);
var y4 = d3.scaleBand().range([height, 0]);

var v = svg4.append("g")
        .attr("transform", "translate(" + (margin.left - 40) +  "," + margin.top + ")");
    
d3.json("/data/data_vis08.json", function(error, data) {
    if (error) throw error;

    var grouped = _.groupBy(data.papers, a => a.event);

    var eventKeys = Object.keys(grouped)

    var sortedGroup = Object.entries(grouped).sort((a,b) => b[1].length - a[1].length)

    x4.domain([0, sortedGroup[0][1].length]);
    y4.domain(sortedGroup.reverse().map(function(d) { return d[0]; })).padding(0.1);

    // X axis
    v.append("g")
        .attr("class", "x4 axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "text-caption text-color default-font-family")
            .call(d3.axisBottom(x4).ticks(3));
        //   .tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));

    // Y axis
    v.append("g")
        .attr("class", "y axis")
        .attr("class", "text-caption default-font-family text-color")
        .call(d3.axisLeft(y4).tickSize(0));

    v.append("text")             
        .attr("transform",
            "translate(" + (width/2 - 150) + " ," + 
                        (height + margin.top + 10) + ")")
        .attr("class", "text-axis default-font-family text-color")
        .style("text-anchor", "middle")
        .text("Number of Publications");

    v.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 450)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "text-axis default-font-family text-color")
        .style("text-anchor", "middle")
        .text("Events and Forums");  

    v.selectAll(".bar")
        .data(sortedGroup.reverse())
        .enter().append("rect")
        .attr("class", "bar text-caption default-font-family")
        .attr("x", 3)
        .attr("height", y4.bandwidth())
        .attr("y", function(d) { return y4(d[0]); })
        .attr("width", function(d) { return x4(d[1].length); })
        .on("mouseover", function(d){
            tooltip4
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .attr("class", "toolTip")
                .html(`
                    <strong> List of publications in this event/forum: </strong>
                    <br>
                    ${d[1].sort((a,b) => b.year - a.year).map(key => (
                    `
                    <br> <strong>Publication title: </strong> ${key.title}
                    <br> <strong>Focus: </strong> HInt ${keys.find(element => element.key == key.focus).name} (${keys.find(element => element.key == key.focus).abbreviation})
                    <br> <strong>Citation: </strong> ${key.citation}
                    <br>`
                    )).join('')}
                `);
        })
        .on("mouseout", function(d){ 
            tooltip4.style("display", "none").attr("class", "tollTip");});

});