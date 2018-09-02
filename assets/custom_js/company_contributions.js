/****** Fonction qui retourne les contributions UE pour la compagnie ******/
function companyContribution(){
  $("#myCompanyGraph_3_1").html('');
  $("#myCompanyGraph_3_description").html('');
  var id = $('#companyId').text();
  var jswidth = document.getElementById('companies').clientWidth;
  jswidth = jswidth-94;


  // Affichage des informations
  $.getJSON('data/companies/'+id+'.json', function(description){
    $("#myCompanyGraph_3_description").html(
      '<br/><b>ID:</b> ' + description.orgId +
      '<br/><b>Secteur:</b> ' + description.orgSector +
      '<br/><b>Organisation:</b> ' + description.orgName +
      '<br/><b>Contribution EU:</b> ' + description.orgEcContr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      ''
    );
  });

  $.getJSON('data/companies/'+id+'.json', function(jsondata){
    var dataset = [];
    for (var element in jsondata.orgProjects) {
      var projectcontribution = jsondata.orgProjects[element].ecContrib;
      var projectname = jsondata.orgProjects[element].Acronym;
      var projectrcn = jsondata.orgProjects[element].rcn;
      dataset.push({itemLabel: projectname, itemValue: projectcontribution*1, itemId: projectrcn*1});
    }

    // Create items array
    var items = Object.keys(dataset).map(function(key) {
      return [dataset[key]['itemValue'], dataset[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
      return second[0] - first[0];
    });

    var data = [];
    for (var i=0; i<items.length; i++){
      data.push(items[i][1]);
    }

    otherProjects = 0;
    // Pour placer les éléments > 10 dans une section "autre"
    for (var j = 0; j < data.length; j++) {
      if (j > 5){
        otherProjects += data[j].itemValue;
      }
    }
    if (data.length > 5) data = data.slice(0, 5);

    var dataStructure = [
       {
         data
       },
    ];

    var w = jswidth;
    var h = 300;
    var r = 100;
    var ir = 75;
    var textOffset = 24;
    var tweenDuration = 1050;

    //OBJECTS TO BE POPULATED WITH DATA LATER
    //var lines, valueLabels, nameLabels;
    var lines, valueLabels;
    var pieData = [];
    var oldPieData = [];
    var filteredPieData = [];

    //D3 helper function to populate pie slice parameters from array data
    var donut = d3.layout.pie().value(function(d){
      return d.itemValue;
    });

    //D3 helper function to create colors from an ordinal scale
    var color = d3.scale.category20c();

    //D3 helper function to draw arcs, populates parameter "d" in path object
    var arc = d3.svg.arc()
      .startAngle(function(d){ return d.startAngle; })
      .endAngle(function(d){ return d.endAngle; })
      .innerRadius(ir)
      .outerRadius(r);

    ///////////////////////////////////////////////////////////
    // CREATE VIS & GROUPS ////////////////////////////////////
    ///////////////////////////////////////////////////////////

    var vis = d3.select("#myCompanyGraph_3_1").append("svg:svg")
      .attr("width", w)
      .attr("height", h);

    //GROUP FOR ARCS/PATHS
    var arc_group = vis.append("svg:g")
      .attr("class", "arc")
      .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    //GROUP FOR LABELS
    var label_group = vis.append("svg:g")
      .attr("class", "label_group")
      .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    //GROUP FOR CENTER TEXT
    var center_group = vis.append("svg:g")
      .attr("class", "center_group")
      .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    ///////////////////////////////////////////////////////////
    // CENTER TEXT ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    //WHITE CIRCLE BEHIND LABELS
    var whiteCircle = center_group.append("svg:circle")
      .attr("fill", "white")
      .attr("r", ir);
    var centerText='';


    ///////////////////////////////////////////////////////////
    // STREAKER CONNECTION ////////////////////////////////////
    ///////////////////////////////////////////////////////////

    // to run each time data is generated
    function update(number) {

      data = dataStructure[number].data;

      oldPieData = filteredPieData;
      pieData = donut(data);

      var sliceProportion = 0; //size of this slice
      filteredPieData = pieData.filter(filterData);
      function filterData(element, index, array) {
        element.name = data[index].itemLabel;
        element.value = data[index].itemValue;
        element.id = data[index].itemId;
        sliceProportion += element.value;
        return (element.value > 0);
      }

        //DRAW ARC PATHS
        paths = arc_group.selectAll("path").data(filteredPieData);
        paths.enter().append("svg:path")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .attr("fill", function(d, i) { return color(i); })
          .transition()
            .duration(tweenDuration)
            .attrTween("d", pieTween);
        paths
          .transition()
            .duration(tweenDuration)
            .attrTween("d", pieTween);
        paths.exit()
          .transition()
            .duration(tweenDuration)
            .attrTween("d", removePieTween)
          .remove();

        //DRAW TICK MARK LINES FOR LABELS
        lines = label_group.selectAll("line").data(filteredPieData);
        lines.enter().append("svg:line")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", -r-3)
          .attr("y2", -r-18)
          .attr("stroke", "gray")
          .attr("transform", function(d) {
            return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
          });
        lines.transition()
          .duration(tweenDuration)
          .attr("transform", function(d) {
            return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
          });
        lines.exit().remove();
        //DRAW LABELS WITH PERCENTAGE VALUES
        valueLabels = label_group.selectAll("text.value").data(filteredPieData)
          .attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
              return 5;
            } else {
              return -7;
            }
          })
          .attr("text-anchor", function(d){
            if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
              return "beginning";
            } else {
              return "end";
            }
          })
          .text(function(d){
            var percentage = (d.value/sliceProportion)*100;
            return percentage.toFixed(1) + "%";
          });

        valueLabels.enter().append("svg:text")
          .attr("class", "value")
          .attr("transform", function(d) {
            return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
          })
          .attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5) {
              return 5;
            } else {
              return -7;
            }
          })
          .attr("text-anchor", function(d){
            if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
              return "beginning";
            } else {
              return "end";
            }
          }).text(function(d){
            var percentage = (d.value/sliceProportion)*100;
            return d.name+": "+percentage.toFixed(1)+"%";
          })
          .on("click", function(d){
            $("#projectId").html(d.id);
            projectId(d.name);
          })
          .on("mouseover", function(d){
            d3.select(this).style("fill", "#48c9b0").style("font-weight", "bold").style("cursor", "pointer");
          })
          .on("mouseout", function(d){
            d3.select(this).style("fill", "#5dade2").style("font-weight", "normal").style("cursor", "default");
          })
          .style("pointer-events","visible")
          .style("font-weight", "normal")
          .style("fill", "#5dade2")
        valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

        valueLabels.exit().remove();

        //DRAW LABELS WITH ENTITY NAMES
        nameLabels = label_group.selectAll("text.units").data(filteredPieData)
          .attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
              return 17;
            } else {
              return 5;
            }
          })
          .attr("text-anchor", function(d){
            if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
              return "beginning";
            } else {
              return "end";
            }
          }).text(function(d){
            return d.name;
          });

        nameLabels.enter().append("svg:text")
          .attr("class", "units")
          .attr("transform", function(d) {
            return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
          })
          .attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
              return 18;
            } else {
              return 5;
            }
          })
          .attr("text-anchor", function(d){
            if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
              return "beginning";
            } else {
              return "end";
            }
          }).text(function(d){
            return d.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €'
          });

        nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

        nameLabels.exit().remove();
		var total = 0;
		pieData.forEach(function(d){ total+=(d.value*1); });
    var total = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €'
		center_group.selectAll('text').data([total]).enter().append('text').text(function(d){
								return d;
              }).attr('class','value').attr('dy', 8).attr('text-anchor', 'end').attr('transform', 'translate(40, 0)');
    }

    ///////////////////////////////////////////////////////////
    // FUNCTIONS //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    // Interpolate the arcs in data space.
    function pieTween(d, i) {
      var s0;
      var e0;
      if(oldPieData[i]){
        s0 = oldPieData[i].startAngle;
        e0 = oldPieData[i].endAngle;
      } else if (!(oldPieData[i]) && oldPieData[i-1]) {
        s0 = oldPieData[i-1].endAngle;
        e0 = oldPieData[i-1].endAngle;
      } else if(!(oldPieData[i-1]) && oldPieData.length > 0){
        s0 = oldPieData[oldPieData.length-1].endAngle;
        e0 = oldPieData[oldPieData.length-1].endAngle;
      } else {
        s0 = 0;
        e0 = 0;
      }
      var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
      return function(t) {
        var b = i(t);
        return arc(b);
      };
    }

    function removePieTween(d, i) {
      s0 = 2 * Math.PI;
      e0 = 2 * Math.PI;
      var i = d3.interpolate({startAngle: d.startAngle, endAngle: d.endAngle}, {startAngle: s0, endAngle: e0});
      return function(t) {
        var b = i(t);
        return arc(b);
      };
    }

    function textTween(d, i) {
      var a;
      if(oldPieData[i]){
        a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI)/2;
      } else if (!(oldPieData[i]) && oldPieData[i-1]) {
        a = (oldPieData[i-1].startAngle + oldPieData[i-1].endAngle - Math.PI)/2;
      } else if(!(oldPieData[i-1]) && oldPieData.length > 0) {
        a = (oldPieData[oldPieData.length-1].startAngle + oldPieData[oldPieData.length-1].endAngle - Math.PI)/2;
      } else {
        a = 0;
      }
      var b = (d.startAngle + d.endAngle - Math.PI)/2;

      var fn = d3.interpolateNumber(a, b);
      return function(t) {
        var val = fn(t);
        return "translate(" + Math.cos(val) * (r+textOffset) + "," + Math.sin(val) * (r+textOffset) + ")";
      };
    }
    update(0);
  });
}
