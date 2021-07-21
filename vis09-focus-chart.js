    const width = 500, height = 500
    const data = [
        { "key": "FGR", "name": "Publications focused on HInt in a general perspective (FGR)", "value": 6 }, 
        { "key": "FGAQ", "name": "Publications focused on HInt in a general perspective with emphasis on a quality attribute (FGAQ)", "value": 4 },
        { "key": "FS", "name": "Publication focused on HInt in a specific domain or context of use (FS)", "value": 10 },
    ]

    const svg = d3.select('.card__body__focus-of-publications__pie-graph')
    .append('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height])

    color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(["#66c2a5", "#fc8d62 ", "#8da0cb"])

    const radius = Math.min(width, height) / 2

    pie = d3.pie()
    .padAngle(0.005)
    .sort(null)
    .value(d => d.value)
    
    const arc = function () {
    const radius = Math.min(width, height) / 2
    return d3.arc().innerRadius(radius * 0.67).outerRadius(radius - 1)
    }

    const outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)

    const arcs = pie(data)
    
    svg
    .selectAll('path')
    .data(arcs)
    .join('path')
    .attr('fill', (d) => color(d.data.name))
    .attr('d', arc())
    .on('mouseover', function (d, i) {
        d3.select(this).transition()
        .duration('50')
        .attr('opacity', '.85')
    })
    .on('mouseout', function (d, i) {
        d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1') 
    })
    .append('title')
    .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`)

    svg
    .selectAll('allPolylines')
    .data(arcs)
    .enter()
    .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
        const posA = arc().centroid(d)
        const posB = outerArc.centroid(d)
        const posC = outerArc.centroid(d)
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1)
        return [posA, posB, posC]
    })
    
    svg
    .selectAll('allLabels')
    .data(arcs)
    .enter()
    .append('text')
    .text((d) => d.data.name)
    .attr('transform', (d) => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', (d) => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })
    .attr("class", "card__body__focus-of-publications__pie-graph__label")
    
    svg
    .selectAll('allLabels')
    .data(arcs)
    .enter()
    .append('text')
    .text((d) => d.data.name)
    .attr('transform', (d) => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', (d) => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })
    .attr("class", "card__body__focus-of-publications__pie-graph__label")
    .call((text) =>
        text
        .append('tspan')
        .attr('y', '-0.4em')
        .attr('font-weight', 'bold')
        .text((d) => d.data.value)
    )
