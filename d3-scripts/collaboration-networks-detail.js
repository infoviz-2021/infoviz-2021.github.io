var margin = {top: 50, right: 130, bottom: 10, left: 10},
    width = 1296 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom

const radius_detail = 25;

bgcolor = d3.rgb("#e5c494")
fill = [bgcolor, bgcolor.darker(0.5),bgcolor.darker(1.5),bgcolor.darker(2)];

// Color scale: give me a focus, I return a color
const color = d3.scaleOrdinal()
    .domain([1,2,3,6])
    .range(fill);
    
bgcolor = d3.rgb("#e5c494") //tom de amarelo
fill = [bgcolor, bgcolor.darker(0.5),bgcolor.darker(1.5),bgcolor.darker(2)];

const colorPartner = d3.scaleOrdinal()
.domain([1,2,3,6])
.range(fill);

/*/Focus
var keys = [
  { "key": "FGR", "name":"from a general perspective (FGR)"},
  { "key": "FGQA", "name":"from a general perspective with emphasis on a quality attribute (FGQA)" },
  { "key": "FS", "name":"in a specific domain or context of use (FS)"}
]; */

// Color scale: give me a focus, I return a color
const colorPaper = d3.scaleOrdinal()
      .domain(key_focus.map(d => d.key))
      .range(d3.schemeSet2);

const colorPaperLight = d3.scaleOrdinal()
  .domain(key_focus.map(d=>d.key))
  .range(["#b3e2cd50","#fdcdac50","#cbd5e850"])


function updateDetail(author_name){  
  

  //get the name author selected
 // const author_name = selectObject.value

  /******************** UPDATE CHART *******************************************/
  d3.select("#my_dataviz").remove();
  d3.selectAll(".node-paper-div").remove();

  // append the svg object to the body of the page
  var svg = d3.select("#graph-area")
      .append("div")
      //.attr("id","my_dataviz_detail")
      .attr("id","my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("display","block")
      .style("margin", "auto")
      .append("g")
      .attr("transform",
              "translate(" + 0 + "," + 0 + ")");

  
  //set title
  d3.select(".text-title")
    .text("Scientific production and publishing partners of " + author_name.trim())

  document.getElementById("author-select").value = author_name
 
  //set select
  /*d3.select("#author-select")
    .
    .text(surname(author_name.trim()))
    .attr('value', surname(author_name.trim()))*/

  /*d3.select('#author-select')
  .append('option')
  .text("")
  .attr('value', "empty");*/

//---------------------------------------------------------------------------------------------------------------------
//  READING DATA
//---------------------------------------------------------------------------------------------------------------------

  d3.json("data/data_vis06.json", function(error, data) {
        if (error) throw error;
        
        //get nodes and links
        var nodes = data.nodes.map(d => Object.create(d))
        var links = data.links.map(d => Object.create(d))

        //get author information  
        author = nodes.filter(d => d.id === author_name)[0]

        //get author conections by paper
        //source can be paper or author - paper.length is < 5
        const links_paper = links.filter(d => (d.source.length < 5 && author.paper.includes(d.source)))
        
        //get links author
        const links_author_paper = links_paper.filter(e => e.target == author_name)

        //get author partners
        const author_partner = links_paper.map(d => d.target).filter(d => d != author.id)
                              .slice().sort((a, b) => d3.ascending(a.id, b.id))
        
        const links_partner = links_paper.filter(d => d.target != author.id)
        
        //get author's articles 
        const nodes_paper = nodes.filter(d => d.type =="paper" &&  author.paper.includes(d.id))
                            .slice().sort((a, b) => d3.ascending(a.year, b.year))

        //get author's partners
        const nodes_partner_raw = nodes.filter(d => d.type =="author" && author_partner.includes(d.id))
                                //  .slice().sort((a, b) => d3.ascending(surname(a.id).toUpperCase() , surname(b.id).toUpperCase()))
                             
        //map connections 
        const linkedByIndex = [];

        links_paper.forEach(function(d) {
          linkedByIndex[`${d.source},${d.target}`] = 1;
        });
        
        // List of nodes partners names
        var allPapersName = nodes_paper.map(function(d){return d.id})

        //define centers
        const spacing = {h:180, v:80}
        const paper_size = {w: 280, h:72}
        const shift_x = width/10
        const shift_y = 20
        const xCenter = {'author': width/2 -  spacing.h - shift_x, 'paper': width/2 - shift_x, 'partner': width/2 +  spacing.h + paper_size.w - shift_x } 
  
        //define yScale
        ratioPartner = height/nodes_partner_raw.length
        height_partner = height
        initial_partner = 0
      
        if(ratioPartner > 190){
          height_partner = nodes_partner_raw.length * (paper_size.h*2) 
          initial_partner = (height - height_partner)/2
        }else
        if(ratioPartner > 40){
          height_partner = nodes_partner_raw.length * (paper_size.h) 
          initial_partner = (height - height_partner)/2
        }
      

        ratioPaper = height/nodes_paper.length
        height_paper = height
        initial_paper = 0

        if(nodes_paper.length > 1 && ratioPaper > 150){
          height_paper = nodes_paper.length * (paper_size.h*2.5)
          initial_paper = (height - height_paper)/2
        }

        // A linear scale to position the paper nodes on the y axis
        var yPaper = d3.scalePoint()
          .range([height_paper + initial_paper - paper_size.h, initial_paper + paper_size.h])
          .domain(allPapersName)
  

        //include qtPartner -> qt articles with this author
        nodes_partner_raw.forEach(function(d){
                  
          let paper = d.paper.filter(d => (allPapersName.includes(d)))
          d.qtPartner = paper.length

          let sum = 0
          //find paper with
          paper.forEach(function(p){
            
            let foundPaper = nodes_paper.filter(e => e.id === p)[0]

            sum += (foundPaper.year - yPaper(foundPaper.id))
          })

            d.weight = sum/paper.length
        })

        //get author's partners
        const nodes_partner = nodes_partner_raw.slice()
                    .sort((a, b) => d3.descending(a.weight, b.weight) )



        // A linear scale to position the nodes on the y axis
        var yPartner = d3.scalePoint()
        .range([initial_partner + shift_y, height_partner + initial_partner])
        .domain(nodes_partner.map(d=>d.id))
      

        let author_position = [xCenter.author, height/2]
        //sortPartner(nodes_paper, nodes_partner)

      /********************************Link Author - Paper *****************************************/    
       
      var link_author = svg
           .selectAll('mylinks')
           .data(links_author_paper)
           .enter()
           .append('path')
           .attr('d', function (d) {
             start = author_position[1]   // Y position of start node on the X axis
             end = yPaper(d.source)      // Y position of end node

             const link = d3.linkHorizontal()({
               source: [xCenter.author, start],
               target: [xCenter.paper, end]
             });

             return link;
           })
           .attr('fill', 'none')
           .attr("stroke-width", 2)
           .style('opacity', 0.6)
           .style("stroke", d => { 
               //get souce node focus properties
               const getnode = nodes_paper.filter(e => e.id === d.source)[0]
               return colorPaper(getnode.focus);
           })

        /******************************** Link Paper - Partners *****************************************/    
        var link_partner = svg
            .selectAll('mylinks')
            .data(links_partner)
            .enter()
            .append('path')
            .attr('d', function (d) {
              start = yPaper(d.source)    // Y position of start node on the X axis
              end = yPartner(d.target) - 10    // Y position of end node
      
              const link = d3.linkHorizontal()({
                source: [xCenter.paper + paper_size.w/2 + 100, start],
                target: [xCenter.partner, end]
              });

              return link;
            })
            .attr('fill', 'none')
            .attr("stroke-width", function (d) {
              //get partner node
              const getnode = nodes_partner.filter(e => e.id == d.target)[0]
              //get paper with author
              d.value = getnode.qtPartner * 2
             
              return d.value
             
            })
            .style('opacity', 0.6) 
            .style("stroke", d => { 
            
                //get souce node focus properties
                const getnode = nodes_paper.filter(e => e.id === d.source)[0]
                return colorPaper(getnode.focus);

            })
          
        
        /************************** Author Node  *************************/

        //create author node
        svg.append("g")
          .attr("class", "node circle author")
          .append("circle")
            .attr("r", Math.sqrt(radius_detail * author.qt))
            .attr("cx", author_position[0])
            .attr("cy", author_position[1] )
            .attr("fill", color(author.qt))
            .attr("stroke",d3.rgb(color(author.qt)).darker(0.5))
            .style("cursor", "default")    

          svg.append("text")
          .text(surname(author.id.trim()))
              .attr("class","text-legend")
              .attr("x",  author_position[0])
              .attr("y", author_position[1]+ Math.sqrt(radius_detail*(author.qt)) + 20) 
              .style("text-anchor", "middle")
              .style("alignment-baseline", "bottom")
              .style("cursor", "default")

          svg
            .append("svg:a").attr("xlink:href", "collaboration-networks.html")
            .append("svg:text")
            .text("Return to Authors' colaboration network")
            .attr("class","text-legend")
            .style("text-decoration","underline")
            .attr("fill","#0000EE")
            .attr("y", height-35)
            .attr("x", 10)
            .attr("text-anchor", "begin");


          /************************** Paper Node *************************/
              
          //create papers nodes white
          var node_paper = svg.append("g")
            .selectAll("rect")
            .data(nodes_paper)
            .enter()
            .append("rect")
              .attr("width",  paper_size.w)
              .attr("height", paper_size.h)
              .attr("x", xCenter.paper)
              .attr("y", d => (yPaper(d.id) - paper_size.h/2))
              .style("fill",  "white")

          //create papers nodes
          var node_paper = svg.append("g")
            .attr("class", "node rect")
            .selectAll("rect")
            .data(nodes_paper)
            .enter()
            .append("rect")
              .attr("width",  paper_size.w)
              .attr("height", paper_size.h)
              .attr("rx",2)
              .attr("ry",2)
              .attr("x", xCenter.paper)
              .attr("y", d => (yPaper(d.id) - paper_size.h/2))
              .style("fill",  d => colorPaperLight(d.focus))
              .style("stroke",function(d){ return d3.rgb(colorPaper(d.focus)).darker(0.0)})
            .on('mouseover', fade(0.2))
            .on('mouseout', fade(1))


          var label_paper = svg.append('g')
            .selectAll('text')
            .data(nodes_paper)
            .enter()
            .append('text')
              .attr("class", function(d) { return "text-legend label-paper-" + d.id })
              .attr("x",  xCenter.paper +  paper_size.w/2)
              .attr("y",  d=> (yPaper(d.id) - paper_size.h/2))
              .attr("text-anchor","middle")
              .style("cursor", "default")  
              .attr("fill", "#343a40")
            //  .attr("font-size","0.85rem")
              .on('mouseover', fade(0.1))
              .on('mouseout', fade(1))

            nodes_paper.forEach( function (d,i){

              textElement = d3.selectAll(".label-paper-" + d.id)

             
              if(d.title.length < 50)
                tspan = breakText(d.title, 35)
              else
                tspan = breakText(d.title, 42)
         
              //two line text
              if(tspan.length == 2){
                y = parseFloat(textElement.attr("y"))
                textElement.attr("y",y+7)
              }
          
              if(tspan.length > 4){   //one line
                textElement.append("tspan")
                .text(d.title)
                .attr("dy","2.2em")
                .style("font-weight","bold")
              }else{
                
                for(j in tspan){
                  textElement.append("tspan")
                  .text(tspan[j])
                  .style("font-weight","bold")
                  .attr("dy","1.2em")
                  .attr("x",xCenter.paper + paper_size.w/2)
                }
              }

              textElement.append("tspan")
                  .text("Year: " + d.year)
                  .attr("dy","1.5em")
                  //.style("font-size","1.05rem")
                  .attr("x",xCenter.paper + paper_size.w/2)

            })


//---------------------------------------------------------------------------------------------------------------------
// PARTNER'S NODE
//---------------------------------------------------------------------------------------------------------------------

      //circel white bottom
      svg.append("g")
        .attr("class", "node circle partner")
        .selectAll("circle")
        .data(nodes_partner)
        .enter()
        .append("circle")
          .attr("r", function(d){ return Math.sqrt(radius_detail *  d.qt)})
          .attr("cx", xCenter.partner)
          .attr("cy", d => yPartner(d.id) - 10)
          .attr("fill", "white")
          .style("cursor", "pointer")
          .on('mouseover', fade(0.2))
          .on('mouseout', fade(1))
          .on('click', d => updateDetail(d.id))

      var node_partner = svg.append("g")
      .attr("class", "node circle partner")
      .selectAll("circle")
        .data(nodes_partner)
        .enter()
        .append("circle")
          //.attr("r", function(d){ return Math.sqrt(radius_detail *  d.qtPartner)})
          .attr("r", function(d){ return Math.sqrt(radius_detail *  d.qt) +1})
          .attr("cx", xCenter.partner)
          .attr("cy", d => yPartner(d.id) - 10)
          .attr("fill", function(d){ return d3.rgb(colorPartner(d.qt)).darker(0)})
          .attr("stroke",function(d){ return d3.rgb(colorPartner(d.qt)).darker(0.5)})
          .style("cursor", "pointer")
          .on('mouseover', fade(0.2))
          .on('mouseout', fade(1))
          .on('click', d => updateDetail(d.id))
          

        var label_partner = svg.selectAll("mylabels")
          .data(nodes_partner)
          .enter()
          .append("text")
            .attr("class","text-legend")
            .attr("x", function(d){ return xCenter.partner + Math.sqrt(radius_detail*d.qtPartner) + 10} )
           // .attr("x", function(d){ return xCenter.partner + (radius_detail*d.qtPartner) + 10} )
            .attr("y", function(d){ return(yPartner(d.id) - 5)})
            .text(d => surname(d.id.trim()))
            .style("text-anchor", "start")
            .style("alignment-baseline", "end")
            .style("cursor", "pointer")
            .on('mouseover', fade(0.2))
            .on('mouseout', fade(1))
            .on('click', d => updateDetail(d.id))
    
        /************************** Links  ****************************/


        function tooltip_qt(d, visibility){
          if(visibility === "hidden"){
            d3.select('.tooltip-data')
                  .style('visibility', 'hidden')
          }else{
              

          if(d.qtPartner === 1 ){ 
            content = `<strong>${d.qtPartner}</strong> publication in collaboration with ${surname(author.id)}` 
          }else{
            content = `<strong>${d.qtPartner}</strong> publications in collaboration with ${surname(author.id)}` 
          }

          if(d.qt === 1 ) 
            content += ` <br><strong>${d.qt}</strong> publication in total`
          else
            content += ` <br><strong>${d.qt}</strong> publications in total`
            
      
          d3.select('.tooltip-data')
            .style('visibility', 'visible')
            .style('top', d3.event.y + 10 + 'px')
            .style('left',d3.event.x + 10 + 'px')
            .html(content)
          }
        }

                
        function fade(opacity) {
        
          return d => {   

            if(d.type === 'author'){
              if(opacity === 1) {
                tooltip_qt(d, "hidden")
              
              }else{
                tooltip_qt(d, "visible")
              }
            }
           node_paper.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });
           label_paper.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });
           
          if(d.type == "author"){
              link_author.style('stroke-opacity', function(o) {
                return ( d.paper.includes(o.source) ? 1 : opacity)
              });
          }else{
            link_author.style('stroke-opacity', o => (o.source === d.id || o.target === d.id ? 1 : opacity));
          }

       //    node_partner_bottom.attr('stroke', function (o) { return isConnected(d, o) ? d3.rgb(colorPartner(d.qt)).darker(2): "#fff00" });
           node_partner.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });
           label_partner.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });

           link_partner.style('stroke-opacity', o => (o.source === d.id || o.target === d.id ? 1 : opacity));
        
            if(opacity === 1){

              node_paper.style('opacity', 1)
            //  node_partner_bottom.attr("stroke",function(d){ return d3.rgb(colorPartner(d.qt)).darker(2)})
              node_partner.style('opacity', 1)
              label_partner.style('opacity', 1)

              link_partner.style('stroke-opacity',1)
            //  link_partner.attr('stroke-width', 1)

              link_author.style('stroke-opacity',1)
            //  link_author.attr('stroke-width', 1)

            }
          };
      }

        function isConnected(a, b) {

          return linkedByIndex[`${a.id},${b.id}`] || linkedByIndex[`${b.id},${a.id}`] || a.id === b.id;
        }

          
//--------------------------------------------------------------------------------------------------------------------- 
// INFORMATION ICON
//---------------------------------------------------------------------------------------------------------------------
      var showInfo = true
      if(nodes_paper.length === 1){
        if(nodes_paper[0].qt === 1){
          showInfo = false;

          d3.select('#card-info-thickness')
            .style('visibility', 'hidden')
        }
      }
      
      if(showInfo){
        d3.select('#card-info-thickness')
        .style('visibility', 'visible')
       /* .text(`The link thickness represents the number of author's publications in collaboration with selected author.` )


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
      
      svg
        .append("text")
          .text("To see publications and partnership ")
          .attr("class", "text-legend")
          .attr("text-anchor", "end")
          .style("opacity","0.6")
          .attr("x", width + margin.right)
          .attr("y", yIcon + 13)
          .attr("cursor","default")
        .append("tspan")
          .text("details, click on the desired author's node")
          .attr("x",width + margin.right )
          .attr("dy","1.5em")
        .append("tspan")
        .text("or select here: ")
        .attr("x",width + margin.right - 150)
        .attr("dy","1.5em")*/

      
      }
          
  })//end d3.json




//-------------------------------------------------------------------------------------------------------------
// QT PUBLICATION LEGEND
//-------------------------------------------------------------------------------------------------------------


        // Add one dot in the legend for each name.
        var size = 12
        //var xAlign = width - margin.right
       
        var xAlign = width + 40

        if(screen.width === 1440)
          xAlign = 0.80 * screen.width
  
        else if(screen.width === 1280)
          xAlign = 0.85 * screen.width 
    

       // var xAlign = 10
        var yAlign = 10

        svg.append("text")
        .text("Author with:")
          .attr("class", "text-legend")
          .attr("x", xAlign-2)
          .attr("y", yAlign) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("text-anchor", "left")
          .attr("font-weight", "bold")
          .style("alignment-baseline", "top")
        
        yAlign += 20
        xAlign += 5
        svg.selectAll("myCircle")
        .data([1,2,3,6])
        .enter()
        .append("circle")
            .attr("class", function(d) { return "label-circle qt-" + d })
            .attr("cx", xAlign)
            .attr("cy", function(d,i){ return yAlign + i*(size + (Math.sqrt(radius/2 * d)))}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", d => Math.sqrt(radius * d))
            .style("fill", function(d){ return d3.rgb(color(d)).darker(0)})
            .attr("stroke",function(d){ return d3.rgb(color(d)).darker(0.5)})
   
        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
        .data([1,2,3,6])
        .enter()
        .append("text")
          .attr("class", function(d) { return "text-legend label-qt-" + d })
          .attr("x", xAlign + size*1.5)
          .attr("y", function(d,i){ return yAlign + 5 + i*(size + (Math.sqrt(radius/2 * d)))}) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", "#343a40")
          .text(function(d){ 
            if(d == 1)
              return ("0" + d + " publication")
            return ("0" + d + " publications")
          })
          .style("cursor", "default")
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .attr("font-size", "10px")
   

//---------------------------------------------------------------------------------------------------------------
// FOCUS LEGEND  
//---------------------------------------------------------------------------------------------------------------

      // Add one dot in the legend for each name.
        size = 20
        xAlign = 10
        yAlign = 10

        svg.append("text")
        .text("Publication focused on HInt:")
          .attr("class", "text-legend")
          .attr("x", xAlign)
          .attr("y", yAlign) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("text-anchor", "left")
          .attr("font-weight", "bold")
     
        yAlign += 15  
        svg.selectAll("myrect")
        .data(key_focus)
        .enter()
        .append("rect")
            .attr("class", function(d) { return "label-rect" + d.key })
            .attr("x", xAlign)
            .attr("y", function(d,i){ return yAlign + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .attr("rx", 1)
            .attr("ry", 1)
            .style("fill",  function(d){ return colorPaper(d.key)})
            .style("stroke",function(d){ return d3.rgb(colorPaper(d.key)).darker(0.5)})

        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
        .data(key_focus)
        .enter()
        .append("text")
            .attr("class", function(d) { return "text-legend label-"+ d.key })
            .attr("x", xAlign + size*1.4)
            .attr("y", function(d,i){ return yAlign +2 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
            .text(function(d){ return d.name + ` (${d.key})`})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("cursor", "default")



}//end update()


