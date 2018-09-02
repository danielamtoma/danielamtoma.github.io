/****** Fonction qui retourne les relations entre organisations ******/
function companyRelationProjects(){
  $("#myCompanyGraph_4").html('');
  $("#myCompanyGraph_4_description").html('');
  $("#myCompanyGraph_4_information").html('');
  $("#myCompanyGraph_4_information").html('Représentation des projets dans lesquels l’organisation est impliquée. La taille du cercle varie en fonction de la contribution reçue. Cliquez sur un projet pour afficher ses informations à droite.<hr/>');
  var id = $('#companyId').text();
  var jswidth = document.getElementById('companies').clientWidth;
  jswidth = jswidth-94;

  // Affichage des informations
  $.getJSON('data/companies/'+id+'.json', function(description){
    $("#myCompanyGraph_4_description").html(
      '<br/><b>ID:</b> ' + description.orgId +
      '<br/><b>Secteur:</b> ' + description.orgSector +
      '<br/><b>Organisation:</b> ' + description.orgName +
      '<br/><b>Contribution EU:</b> ' + description.orgEcContr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      ''
    );
  });

  var width = jswidth,
      height = jswidth/1.3;

  var color = d3.scale.category20();

  var radius = d3.scale.sqrt()
      .range([0, 6]);

  var svg = d3.select("#myCompanyGraph_4").append("svg")
      .attr("width", width)
      .attr("height", height);

  var force = d3.layout.force()
      .size([width, height])
      .charge(-400)
      .linkDistance(function(d) { return radius(d.source.contribution) + radius(d.target.contribution) + 100; });

  d3.json('data/companies/'+id+'.json', function(error, graph) {
    var org = graph.orgName;
    var myNodes = [{name: id, contribution: 5, color: '#5dade2'}];
    var myLinks = [];
    var i = 0;
    for (var key in graph.orgProjects) {
      ++i;
      var contrib = 0;
      if (graph.orgProjects[key].ecContrib == 0){
        contrib = 5;
      } else {
        contrib = (graph.orgProjects[key].ecContrib*100/graph.orgEcContr)/10;
      };
      myNodes.push({name: graph.orgProjects[key].Acronym, contribution: contrib, color: '#48c9b0', id: graph.orgProjects[key].rcn});
      myLinks.push({source: 0, target: i});
    }
    if (error) throw error;
    force
        .nodes(myNodes)
        .links(myLinks)
        .on("tick", tick)
        .start();

    var link = svg.selectAll(".link")
        .data(myLinks)
      .enter().append("g")
        .attr("class", "link");

    link.append("line")

    var node = svg.selectAll(".node")
        .data(myNodes)
      .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    node.append("circle")
        .attr("r", function(d) { return radius(d.contribution); })
        .style("fill", function(d) { return d.color; })
        .on("click", function(d){
          if (typeof d.id !== 'undefined'){
            $("#projectId").html(d.id);
            projectId(d.name);
          }
        })
        .on("mouseover", function(d){
          if (d.id !== '#5dade2'){
            d3.select(this).style("fill", "#5dade2").style("font-weight", "bold");
          }
        })
        .on("mouseout", function(d){
          if (d.color !== '#5dade2'){
            d3.select(this).style("fill", "#48c9b0").style("font-weight", "normal");
          }
        })

    node.append("text")
        .attr("dy", -15)
        .attr("text-anchor", "middle")
        .on("click", function(d){
          if (typeof d.id !== 'undefined'){
            $("#projectId").html(d.id);
            projectId(d.name);
          }
        })
        .on("mouseover", function(d){
          d3.select(this).style("fill", "#48c9b0").style("font-weight", "bold");
        })
        .on("mouseout", function(d){
          d3.select(this).style("fill", "#5dade2").style("font-weight", "normal");
        })
        .text(function(d) { return d.name; })
        .style("pointer-events","visible")
        .style("font-weight", "normal")
        .style("fill", "#5dade2");

    function tick() {
      link.selectAll("line")
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    }
  });
}
