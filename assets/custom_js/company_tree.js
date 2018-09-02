/****** Fonction qui affiche le dendrograme des relations ******/
function companyRelations(){
  // Get JSON data
  $("#myCompanyGraph_2").html('');
  $("#myCompanyGraph_2_description").html('');
  $("#myCompanyGraph_2_information").html('');
  $("#myCompanyGraph_2_information").html('Représentation des collaborations existant entre l’organisation sélectionnée et d’autres entités. En cliquant sur une entité ses informations seront affichées.<hr/>');
  var id = $('#companyId').text();

  // Affichage des informations
  $.getJSON('data/companies/'+id+'.json', function(description){
    $("#myCompanyGraph_2_description").html(
      '<br/><b>ID:</b> ' + description.orgId +
      '<br/><b>Secteur:</b> ' + description.orgSector +
      '<br/><b>Organisation:</b> ' + description.orgName +
      '<br/><b>Contribution EU:</b> ' + description.orgEcContr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      ''
    );
  });

  $.getJSON('data/relationships/'+id+'.json', function(calculateSize){

    i = 1;
    for (var key in calculateSize.children) {
      ++i;
    }
    var jswidth = document.getElementById('companies').clientWidth;
    jswidth = jswidth-94;

    var calculatedHeight = i*25;

    if (i*25 < 800){
      calculatedHeight = 800;
    }

    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = jswidth - margin.right - margin.left,
        height = calculatedHeight - margin.top - margin.bottom;

    var i = 0,
        duration = 750,
        root;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    // Define the zoom function for the zoomable tree
    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListender which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    var baseSvg = d3.select("#myCompanyGraph_2").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .style("overflow", "scroll")
        .attr("class", "overlay")
        .call(zoomListener);


    d3.json('data/relationships/'+id+'.json', function(error, data) {
      if (error) throw error;

      root = data;
      root.x0 = height/2;
      root.y0 = 0;

      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

      root.children.forEach(collapse);
      update(root);
    });

    function update(source) {
      var levelWidth = [1];

      var childCount = function(level, n) {
          if (n.children && n.children.length > 0) {
              if (levelWidth.length <= level + 1) levelWidth.push(0);
              levelWidth[level + 1] += n.children.length;
              n.children.forEach(function(d) {
                  childCount(level + 1, d);
              });
          }
      };
      childCount(0, root);
      var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
      tree = tree.size([newHeight, width]);

      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse(),
          links = tree.links(nodes);

      // Normalize for fixed-depth.
      nodes.forEach(function(d) { d.y = d.depth * 240; d.y += 120});

      // Update the nodes…
      var node = svgGroup.selectAll("g.node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
          .style("pointer-events", "none");

      nodeEnter.append("circle")
          .attr("r", 1e-6)
          .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeEnter.append("text")
          .attr("x", function(d) { return d.root|| d.children ? -10 : 10; })
          .attr("dy", ".35em")
          .attr("text-anchor", function(d) { return d.root || d.children ? "end" : "start"; })
          .on("click", function(d){
            if (d.id != id){
              $("#companyId").html(d.id);
              companyId(d.name);
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
          .style("fill-opacity", 1e-6)
          .style("font-weight", "normal")
          .style("fill", "#5dade2");

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      nodeUpdate.select("circle")
          .attr("r", 4.5)
          .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeUpdate.select("text")
          .style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
          .remove();

      nodeExit.select("circle")
          .attr("r", 1e-6);

      nodeExit.select("text")
          .style("fill-opacity", 1e-6);

      // Update the links…
      var link = svgGroup.selectAll("path.link")
          .data(links, function(d) { return d.target.id; });

      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
          .attr("class", "link")
          .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
          });

      // Transition links to their new position.
      link.transition()
          .duration(duration)
          .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
          .duration(duration)
          .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
          })
          .remove();
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");
  });
}
