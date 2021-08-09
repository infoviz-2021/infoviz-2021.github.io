
Math.seedrandom('hello.');

var tooltip = d3.select("body").append("div").attr("class", "tooltip-data-v4");
var colors = ['#0A2463', '#D8315B', '#607196', '#026C7C', '#E88EED', '#FFC759', '#034748', '#E77728', '#8BB8A8', '#CC998D', '#550C18', '#786452', '#119DA4'];

var myWords =[{word:"Transport", size:19, color:"#b5de2b", context:"Autonomous car; Smart eBikes", totalPublications:"19", examples:""},
                {word:"Industry", size:15, color:"#b5de2b", context:"Smart Robots", totalPublications:"15", examples:""},
                {word:"Health and Well-being", size:15, color:"#b5de2b", context:"Apps to monitor health and well-being", totalPublications:"15", examples:""},
                {word:"Self Organization", size:13, color:"#b5de2b", context:"Smart alarm clock", totalPublications:"13", examples:""},
                {word:"Communication", size:13, color:"#b5de2b", context:"Smart email manager", totalPublications:"13", examples:""},
                {word:"Informacional", size:11, color:"#b5de2b", context:"News recommender systems; Systems to weather forecast or traffic alert; Smart Chatbot", totalPublications:"13", examples:""},
                {word:"Exertion", size:9, color:"#b5de2b", context:"Smart Bike", totalPublications:"11", examples:"9"},
                {word:"Entertainment", size:6, color:"#b5de2b", context:"Video, movie or musics recommendation systems; Augmented Reality Games; Virtual Reality Games", totalPublications:"6", examples:""},
                {word:"Social", size:5, color:"#b5de2b", context:"Contact recommendation systems on social media", totalPublications:"5", examples:""},
                {word:"Event Management", size:4, color:"#b5de2b", context:"Smart event rescheduling", totalPublications:"4", examples:""},
                {word:"Educational", size:4, color:"#b5de2b", context:"Augmented Reality Educational Games", totalPublications:"4", examples:""},
                {word:"Smart Environment", size:3, color:"#b5de2b", context:"Smart House", totalPublications:"", examples:"3"},
                {word:"e-Commerce", size:2, color:"#b5de2b", context:"Product or service recommendation systems", totalPublications:"2", examples:""},]

    var word_entries = Object.entries(myWords);
    
    var xScale = d3.scaleLinear()
    .domain([0, d3.max(word_entries, function(d) {
        return d.size;
    })
    ])
    .range([10,100]);

// set the dimensions and margins of the graph
var margin = {top: 1, right: 1, bottom: 1, left: 1},
    width = 800 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .attr("margin-left", "-100px");

function fillColor(d,i){
    return d.color;
}

// Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
// Wordcloud features that are different from one word to the other must be here
var layout = d3.layout.cloud()
    .size([width, height])
    .words(myWords.map(function(d) { console.log(d); return {text: d.word, size:d.size, color:d.color, context:d.context,}; }))
    .padding(0.5)        //space between words
    .rotate(function() { return 0; })
    .font('Impact') 
    .fontSize(function(d) { return d.size * 5; })      // font size of words
    .on("end", draw);
layout.start();

// This function takes the output of 'layout' above and draw the words
// Wordcloud features that are THE SAME from one word to the other can be here
function draw(words) {
svg
    .append("g")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
    .selectAll("text")
    .data(words)
    .enter().append("text")
    .style("font-size", function(d) { return d.size + "px"; })
    .style("fill", (d, i) => colors[i])
    .attr("text-anchor", "middle")
    .attr("size", function(d) { return d.size; })
    .attr("context", function(d) { return d.context; })
    .style("cursor", "default")
    .style("font-family", "Impact")
    .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) { console.log(d.text); return d.text; })
    .on("mousemove", function(e){
            tooltip
                .style("left", e.pageX + 5 + "px")
                .style("top", e.pageY + 5 + "px")
                .style("display", "inline-block")
                .attr("class", "tooltip-data-v4")
                .html(//'<strong>Citations: </strong>'+ e.srcElement.getAttribute('size') + 
                        // '</br><strong>HInt technology example: </strong>' + e.srcElement.getAttribute('context') +
                        '<strong>Total of analyzed publications that cited this area or domain: </strong>' + parseInt(e.srcElement.getAttribute('size')) / 5 +
                        '</br><strong>Examples of HInt technologies used in this area or domain: </strong>' + e.srcElement.getAttribute('context')
                );
            })
    .on("mouseout", function(d){ tooltip.style("display", "none").attr("class", "tollTip");});
}