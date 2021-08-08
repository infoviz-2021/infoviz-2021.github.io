var tooltip = d3.select("body").append("div").attr("class", "tooltip-data-v4");

const totalArticles = 20;
const data2 = [
  { abbreviation: 'FGR', name: 'Publications focused on HInt in a general perspective (FGR)', value: 6 },
  { abbreviation: 'FGAQ', name: 'Publications focused on HInt in a general perspective with emphasis on a quality attribute (FGAQ)', value: 4 },
  { abbreviation: 'FS', name: 'Publication focused on HInt in a specific domain or context of use (FS)', value: 10 },
];

const svgPieChart = d3
  .select('.card__body__focus-of-publications__pie-graph')
  .append('svg')
  .attr('viewBox', [-widthPie / 2 - 30, -heightPie / 2, widthPie + 100, heightPie + 100]);

color = d3
  .scaleOrdinal()
  .domain(data2.map((d) => d.name))
  .range(['#66c2a5', '#fc8d62 ', '#8da0cb']);

const radiusPieChart = Math.min(widthPie, heightPie) / 2;

pie = d3
  .pie()
  .padAngle(0.005)
  .sort(null)
  .value((d) => d.value);

const arc = function () {
  const radius = Math.min(widthPie, heightPie) / 2;
  return d3
    .arc()
    .innerRadius(radius * 0.67)
    .outerRadius(radius - 1);
};

const outerArc = d3
  .arc()
  .innerRadius(radiusPieChart * 0.9)
  .outerRadius(radiusPieChart * 0.9);

const arcs = pie(data2);

svgPieChart
  .selectAll('path')
  .data(arcs)
  // .join('path')
  .enter()
  .append('path')
  .attr('fill', (d) => color(d.data.name))
  .attr('d', arc())
  .on('mouseover', function (d,i) {
    d3.select(this).transition().duration('50').attr('opacity', '.85');
    tooltip
    .style("left", (d3.event.pageX ) + 5 +"px")
    .style("top", (d3.event.pageY) + 5 + "px")
    .style("display", "inline-block")
    .attr("class", "tooltip-data-v4")
    .style('max-width', '300px')
    .html(`
      
        <div style="border-left: 4px solid; border-color:${color(d.data.name)}; padding: 5px;">
          <strong>${d.data.name}</strong>
          <div style="margin-top: 3px;">
            <i>${d.data.value.toLocaleString()}  of ${totalArticles} analyzed publications</i>
          </div>
        </div>`
      )
  })
  .on('mouseout', function (d, i) {
    d3.select(this).transition().duration('50').attr('opacity', '1');
  
    tooltip.style("display", "none").attr("class", "tollTip");
  })
 // .append('title')
  //.text((d) => `${d.data.name}: ${d.data.value.toLocaleString()} of ${totalArticles} analyzed publications`);

svgPieChart
  .selectAll('allPolylines')
  .data(arcs)
  .enter()
  .append('polyline')
  .attr('stroke', 'black')
  .style('fill', 'none')
  .attr('stroke-width', 1)
  .attr('points', function (d) {
    const posA = arc().centroid(d);
    const posB = outerArc.centroid(d);
    const posC = outerArc.centroid(d);
    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    posC[0] = radiusPieChart * 0.95 * (midangle < Math.PI ? 1 : -1);
    return [posA, posB, posC];
  });

svgPieChart
  .selectAll('allLabels')
  .data(arcs)
  .enter()
  .append('text')
  .attr('transform', (d) => {
    const pos = outerArc.centroid(d);
    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    pos[0] = radiusPieChart * 0.99 * (midangle < Math.PI ? 1 : -1);
    return 'translate(' + pos + ')';
  })
  .style('text-anchor', (d) => {
    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    return midangle < Math.PI ? 'start' : 'end';
  })
  .call((text) => text.append('tspan').text((d) => d.data.abbreviation))
  .call((text) =>
    text
      .append('tspan')
      .attr('font-weight', 'bold')
      .attr('y', '1em')
      .attr('x', '0em')
      .text((d) => {
        const value = d.data.value;
        return `${Math.abs(value / totalArticles) * 100}%`;
      })
  )
  .attr('class', 'card__body__focus-of-publications__pie-graph__label');
