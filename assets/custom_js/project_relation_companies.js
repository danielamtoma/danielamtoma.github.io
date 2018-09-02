/****** Fonction qui retourne les contributions UE pour le projet au niveau des relations ******/
function projectRelationCompanies(){
  $("#myProjectGraph_2").html('');
  var id = $('#projectId').text();
  var jswidth = document.getElementById('projects').clientWidth;
  jswidth = jswidth-94;

  var width = jswidth,
      height = 800;

  var color = d3.scale.category20();

  var radius = d3.scale.sqrt()
      .range([0, 6]);

  var svg = d3.select("#myProjectGraph_2").append("svg")
      .attr("width", width)
      .attr("height", height);

  var force = d3.layout.force()
      .size([width, height])
      .charge(-400)
      .linkDistance(function(e) { return radius(e.source.contribution) + radius(e.target.contribution) + 100; });

  d3.json('data/projects/'+id+'.json', function(error, graph) {
    var myNodes = [{name: graph.acronym, contribution: 5, color: '#5dade2'}];
    var myLinks = [];
    var i = 0;
    for (var key in graph.projectParticipants) {
      ++i;
      var contrib = 0;
      if (graph.projectParticipants[key].ecContrib == 0){
        contrib = 1;
      } else {
        contrib = (graph.projectParticipants[key].ecContrib*100/graph.calculatedTotalContribution);
        if (contrib < 1){
          contrib = 1;
        }
      };
      myNodes.push({name: graph.projectParticipants[key].orgName, contribution: contrib, color: '#48c9b0', id: graph.projectParticipants[key].orgId});
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
        .attr("r", function(e) { return radius(e.contribution); })
        .style("fill", function(e) { return e.color; })
        .on("click", function(d){
          if (typeof d.id !== 'undefined'){
            $("#companyId").html(d.id);
            companyId(d.name);
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
        });

    node.append("text")
        .attr("dy", -15)
        .attr("text-anchor", "middle")
        .on("click", function(e){
          if (typeof e.id !== 'undefined'){
            $("#companyId").html(e.id);
            companyId(e.name);
          }
        })
        .on("mouseover", function(d){
          d3.select(this).style("fill", "#48c9b0").style("font-weight", "bold");
        })
        .on("mouseout", function(d){
          d3.select(this).style("fill", "#5dade2").style("font-weight", "normal");
        })
        .text(function(e) { return e.id; })
        .style("pointer-events","visible")
        .style("font-weight", "normal")
        .style("fill", "#5dade2");

    function tick() {
      link.selectAll("line")
          .attr("x1", function(e) { return e.source.x; })
          .attr("y1", function(e) { return e.source.y; })
          .attr("x2", function(e) { return e.target.x; })
          .attr("y2", function(e) { return e.target.y; });

      node.attr("transform", function(e) { return "translate(" + e.x + "," + e.y + ")"; });
    }
  });
}
