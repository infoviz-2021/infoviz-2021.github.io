var margin = {top: 20, right: 200, bottom: 20, left: 10},
              width = 1280 - margin.left - margin.right,
              height = 700 - margin.top - margin.bottom

const radius_detail = 5;
//const color = d3.scaleOrdinal(d3.schemeSet2);
// bgcolor = d3.rgb(d3.schemeSet2[5])
bgcolor = d3.rgb("#f6cb55") //tom de amarelo
//bgcolor = d3.rgb("#de88af")
//bgcolor = d3.rgb("#8e7bd7")
//fill = [bgcolor.brighter(2),bgcolor,bgcolor.darker(1),bgcolor.darker(2)];
fill = [bgcolor.darker(0.1), bgcolor.darker(0.5),bgcolor.darker(1.5),bgcolor.darker(2)];
//fill = [bgcolor, bgcolor,bgcolor,bgcolor];

// cor padrão: #8e7bd7
// cor de destaque: #6443ea

// Color scale: give me a focus, I return a color
const color = d3.scaleOrdinal()
    .domain([1,2,3,6])
    .range(fill);
    //.range(d3.schemeSet2);

//Focus
var keys = [
  { "key": "FGR", "name":"Focus on HInt from a general perspective (FGR)"},
  { "key": "FGQA", "name":"Focus on HInt from a general perspective with emphasis on a quality attribute (FGQA)" },
  { "key": "FS", "name":"Focus on HInt in a specific domain or context of use (FS)"}
]; 



// Color scale: give me a focus, I return a color
const colorPaper = d3.scaleOrdinal()
      .domain(keys.map(d => d.key))
      .range(d3.schemeSet2);

const colorPaperLight = d3.scaleOrdinal()
  .domain(keys.map(d=>d.key))
  .range(["#b3e1d2","#fec6b1","#c6d0e5"])

var surname = function(author_name){
  //separete names
  names = author_name.split(" ")  

  last = " " + names.pop() +", "
  first_letter = names[0][0] + "."

  return (last + first_letter)
}

function breakText(d, maxWidth){

  length = d.length;
  words = d.split(" ");
  phrase = ""
  phrases = []

  if(d.length <= maxWidth){
    phrases = d
  }else{
  
    for(i in words){
        if(phrase.length + words[i].length <= maxWidth){
          phrase += words[i] + " ";
        }else{
          phrases.push(phrase.trim())
          phrase = words[i] + " "       
        }
      }
      phrases.push(phrase.trim())
    }
  return phrases
} 

function updateDetail(author_name){  
  

  //get the name author selected
 // const author_name = selectObject.value

  /******************** UPDATE CHART *******************************************/
  d3.select("#my_dataviz").remove();
  d3.select("#my_dataviz_detail").remove();
  d3.selectAll(".node-paper-div").remove();

  // append the svg object to the body of the page
  var svg = d3.select("body")
      .append("div")
      .attr("id","my_dataviz_detail")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("display","block")
      .style("margin", "auto")
      .append("g")
      .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

  /***************************** READ DATA ********************************/

  d3.select(".text-title")
  .text("Scientific production and publishing partners of " + author_name)

  d3.json("data/data_vis06.json", function(error, data) {
        if (error) throw error;
        
        var nodes = data.nodes.map(d => Object.create(d))
        var links = data.links.map(d => Object.create(d))

        //get author information  
        author = nodes.filter(d => d.id === author_name)[0]

        //get author conections by paper
        const links_paper = links.filter(d => (d.source.length < 5 && author.paper.includes(d.source)))
        
        //const links_paper = links.filter(d => d.source.length < 5)
        //get author partners
        const author_partner = links_paper.map(d => d.target).filter(d => d != author.id)
                              .slice().sort((a, b) => d3.ascending(a.id, b.id))

        const links_partner = links_paper.filter(d => d.target != author.id)
        
        //get author's articles 
        const nodes_paper = nodes.filter(d => d.type =="paper" &&  author.paper.includes(d.id))
                            .slice().sort((a, b) => d3.ascending(a.year, b.year))

        //get author's partners
        const nodes_partner = nodes.filter(d => d.type =="author" && author_partner.includes(d.id))
                             .slice().sort((a, b) => d3.ascending(surname(a.id).toUpperCase() , surname(b.id).toUpperCase()))


        //map connections 
        const linkedByIndex = [];

        links_paper.forEach(function(d) {
          linkedByIndex[`${d.source},${d.target}`] = 1;
        });

        // List of nodes partners names
        var allPartnerName = nodes_partner.map(function(d){return d.id})
        
        // List of nodes partners names
        var allPapersName = nodes_paper.map(function(d){return d.id})

        //include qtPartner -> qt articles with this author
        nodes_partner.forEach(function(d){
            
            let paper = d.paper.filter(d => (allPapersName.includes(d)))
            d.qtPartner = paper.length
    
         })

        //define centers
        const spacing = {h:250, v:120}
        const paper_size = {w: 300, h:70}
        const shift_x = width/15
        const xCenter = {'author': width/2 -  spacing.h - shift_x, 'paper': width/2 - shift_x, 'partner': width/2 +  spacing.h + paper_size.w - shift_x } 
        const bandY = {'paper' : author.paper.length, 'partner': author_partner.length }

        ratioPartner = height/nodes_partner.length
        height_partner = height
        initial_partner = 0
        if(ratioPartner > 200){
          height_partner = nodes_partner.length * (paper_size.h*2) 
          initial_partner = (height - height_partner)/2
        }else
        if(ratioPartner > 40){
          height_partner = nodes_partner.length * (paper_size.h) 
          initial_partner = (height - height_partner)/2
        }

        
        // A linear scale to position the nodes on the y axis
        var yPartner = d3.scalePoint()
          .range([initial_partner, height_partner + initial_partner])
          .domain(allPartnerName)

        ratioPaper = height/nodes_paper.length
        height_paper = height
        initial_paper = 0
        //console.log(ratioPaper)
       // console.log(nodes_paper.length)

        if(nodes_paper.length > 1 && ratioPaper > 150){
          height_paper = nodes_paper.length * (paper_size.h*2.5)
          initial_paper = (height - height_paper)/2
        }
          // A linear scale to position the paper nodes on the y axis
        var yPaper = d3.scalePoint()
          .range([height_paper + initial_paper - paper_size.h, initial_paper + paper_size.h])
          .domain(allPapersName)
  
        console.log("ratioPaper:" + ratioPaper)
        console.log("ratioPartner: " + ratioPartner)
  
        let author_position = [xCenter.author, height/2]
        sortPartner(nodes_paper, nodes_partner)

      /********************************Link Author - Paper *****************************************/    
       var link_author = svg
           .selectAll('mylinks')
           .data(links_paper)
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
           .attr("stroke-width", 1)
           .style('opacity', 0.2)
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
              end = yPartner(d.target)    // Y position of end node
      
              const link = d3.linkHorizontal()({
                source: [xCenter.paper + paper_size.w/2 + 100, start],
                target: [xCenter.partner, end]
              });

              return link;
            })
            .attr('fill', 'none')
            .attr("stroke-width", 1.5)
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
            .attr("r", radius_detail * author.qt)
            .attr("cx", author_position[0])
            .attr("cy", author_position[1] )
            .attr("fill", color(author.qt))
            .attr("stroke",d3.rgb(color(author.qt)).darker(0.5))
            .style("cursor", "pointer")
            .on("click", function() {
            // http://bootboxjs.com/
              location.href = "collaboration-networks.html";
            })
           

        svg.append("text")
        .text(surname(author.id.trim()))
            .attr("x",  author_position[0])
            .attr("y", author_position[1]+ radius_detail*(author.qt+3)) 
            .style("text-anchor", "middle")
            .style("alignment-baseline", "end")
            .style("cursor", "pointer")
            .on("click", function() {
            // http://bootboxjs.com/
              location.href = "collaboration-networks.html";
            })
           

          /************************** Paper Node *************************/
              
              //create papers nodes
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
                  .attr("rx",5)
                  .attr("ry",5)
                  .attr("x", xCenter.paper)
                  .attr("y", d => (yPaper(d.id) - paper_size.h/2))
                  .style("fill",  d => colorPaperLight(d.focus))
                  .style("stroke",function(d){ return d3.rgb(colorPaper(d.focus)).darker(0.5)})
                  //.style("opacity",0.5)
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
                  .attr("font-size","0.85rem")
                  .on('mouseover', fade(0.1))
                  .on('mouseout', fade(1))

                nodes_paper.forEach( function (d,i){

                  textElement = d3.selectAll(".label-paper-" + d.id)

                  tspan = breakText(d.title, 45)

                  if(tspan.length > 4){
                    textElement.append("tspan")
                    .text(d.title)
                    .attr("dy","2.0em")
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


        /************************** Partners node ****************************/
        var node_partner = svg.append("g")
          .attr("class", "node circle partner")
          .selectAll("circle")
          .data(nodes_partner)
          .enter()
          .append("circle")
            .attr("r", function(d){ return radius_detail *  d.qtPartner})
            .attr("cx", xCenter.partner)
            .attr("cy", d => yPartner(d.id))
           // .attr("fill", function(d){ return d3.rgb(color(d.qtPartner)).darker(0.5)})
           // .attr("stroke",function(d){ return d3.rgb(color(d.qtPartner)).darker(2)})
            .attr("fill", function(d){ return d3.rgb(color(d.qtPartner)).darker(0)})
            .attr("stroke",function(d){ return d3.rgb(color(d.qtPartner)).darker(0.5)})
            .style("cursor", "pointer")
            .on('mouseover', fade(0.2))
            .on('mouseout', fade(1))
            .on('click', d => updateDetail(d.id))

        var label_partner = svg.selectAll("mylabels")
          .data(nodes_partner)
          .enter()
          .append("text")
            .attr("class","text-legend")
            .attr("x", function(d){ return xCenter.partner + (radius_detail*d.qtPartner) + 10} )
            .attr("y", function(d){ return(yPartner(d.id) + radius_detail/2)})
            .text(d => surname(d.id.trim()))
            .style("text-anchor", "start")
            .style("alignment-baseline", "end")
            .style("cursor", "pointer")
            .on('mouseover', fade(0.2))
            .on('mouseout', fade(1))
            .on('click', d => updateDetail(d.id))
           
    
        /************************** Links  ****************************/

        function sortPartner(papers, partner){

          let sorted_partner = []
          
          const sorted = partner.slice().sort((a, b) => d3.ascending(a.id, b.id))

          papers.forEach(function(d){
            //const paper_filter = nodes.filter(d => d.type =="paper" &&  author.paper.includes(d.id)) 
            const founded = sorted.filter(e => e.paper.includes(d.id))
            sorted_partner.push(founded)
          })

          return sorted_partner

        }
                
        function fade(opacity) {
        
          return d => {   
           
           node_paper.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });
           label_paper.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });
           
           link_author.style('stroke-opacity', o => (o.source === d.id || o.target === d.id ? 1 : opacity));
           link_author.attr('stroke-width', o => (o.source === d.id || o.target === d.id ? 3 : 1))

           node_partner.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });
           label_partner.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });


           link_partner.style('stroke-opacity', o => (o.source === d.id || o.target === d.id ? 1 : opacity));
           link_partner.attr('stroke-width', o => (o.source === d.id || o.target === d.id ? 3 : 1))
        
            if(opacity === 1){

              node_paper.style('opacity', 1)
              node_partner.style('opacity', 1)
              label_partner.style('opacity', 1)

              link_partner.style('stroke-opacity',1)
              link_partner.attr('stroke-width', 1)

              link_author.style('stroke-opacity',1)
              link_author.attr('stroke-width', 1)

            }
          };
      }


        function isConnected(a, b) {

          return linkedByIndex[`${a.id},${b.id}`] || linkedByIndex[`${b.id},${a.id}`] || a.id === b.id;
        }
        
  })//end d3.json

}//end update()


