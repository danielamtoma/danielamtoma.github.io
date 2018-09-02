/****** Fonction qui retourne les proportions des contributions UE ******/
function companyContributionProportion(){
  $("#myCompanyGraph_3_2").html('');
  $("#myCompanyGraph_3_2_description").html('');
  var id = $('#companyId').text();
  var jswidth = document.getElementById('companies').clientWidth;
  jswidth = jswidth-94;

  $.getJSON('data/companies/'+id+'.json', function(jsondata){

    var totalEuContrib = 0;
    var biggestProjectContrib = 0;
    var dataset = [];
    for (var element in jsondata.orgProjects) {
      var projectcontribution = jsondata.orgProjects[element].ecContrib;
      totalEuContrib += projectcontribution;
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

    for (var k=0; k<data.length; k++){
      biggestProjectContrib += data[k].itemValue;
    }

    /* recalculer les contributions pour les 5 plus grands projets */
    var total_Cost = totalEuContrib*1;
    var ec_Max_Contribution = biggestProjectContrib*1;
    $("#myCompanyGraph_3_2_description").html(
      '<br/><b>Contribution pour tous les projets:</b> ' + total_Cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      '<br/><b>Contribution pour les 5 plus gros projets:</b> ' + ec_Max_Contribution.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      ''
    );

    var duration = 1050,
        transition = 200,
        percent = 100 * ec_Max_Contribution/total_Cost,
        width = jswidth,
        height = 200;

    var dataset = {
                lower: calcPercent(0),
                upper: calcPercent(percent)
            },
            radius = Math.min(width, height) / 2,
            pie = d3.layout.pie().sort(null),
            format = d3.format(".0%");

    // Define the div for the tooltip
    var mydiv = d3.select("#myCompanyGraph_3_2").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    var arc = d3.svg.arc()
            .innerRadius(radius * .8)
            .outerRadius(radius);

    var svg = d3.select("#myCompanyGraph_3_2").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = svg.selectAll("path")
                    .data(pie(dataset.lower))
                    .enter().append("path")
                    .attr("class", function (d, i) {
                        return "color" + i
                    })
                    .attr("d", arc)
                    .each(function (d) {
                        this._current = d;
                    })
                    .on("mouseover", function(d) {
                        mydiv.transition()
                            .duration(200)
                            .style("opacity", .9);
                        mydiv.html(function(d) {return "Contribution UE : "+ ec_Max_Contribution + "</br>" + "Coût total : " + total_Cost})
                            .style("left", (d3.event.pageX)/4 + "px")
                            .style("top", (d3.event.pageY - 28)/4 + "px");
                        })
                    .on("mouseout", function(d) {
                        mydiv.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

    var text = svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .style("font-size", 48)
            .style("font-weight", "400")
            .style("line-height", "16em")
            .style("fill", "#48c9b0");

    var progress = 0;

    var timeout = setTimeout(function () {
        clearTimeout(timeout);
        path = path.data(pie(dataset.upper));
        path.transition().duration(duration).attrTween("d", function (a) {
            var i = d3.interpolate(this._current, a);
            var i2 = d3.interpolate(progress, percent)
            this._current = i(0);
            return function (t) {
                text.text(format(i2(t) / 100));
                return arc(i(t));
            };
        });
    }, 200);

    function calcPercent(percent) {
        return [percent, 100 - percent];
    };
  });
}
