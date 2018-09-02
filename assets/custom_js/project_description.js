/****** Fonction qui retourne les informations de la compagnie ******/
function projectInformation(){
  $("#myProjectGraph_1_description").html('');
  $("#myProjectGraph_1_1").html('');
  $("#myProjectGraph_1_2").html('');
  var id = $('#projectId').text();

  // Affichage des informations
  $.getJSON('data/projects/'+id+'.json', function(description){

    if (description.totalCost.includes(",")){
      description.totalCost = description.totalCost.replace(",", ".");
    }
    var totalCout = Math.round(description.totalCost*1);
    if (description.ecMaxContribution.includes(",")){
      description.ecMaxContribution = description.ecMaxContribution.replace(",", ".");
    }

    var contributionUE = Math.round(description.ecMaxContribution*1);
    var proportion = Math.round(contributionUE*100/totalCout);

    $("#myProjectGraph_1_description").html(
      '<br/><b>RCN:</b> ' + description.rcn +
      '<br/><b>Acronyme:</b> ' + description.acronym +
      '<br/><b>Titre:</b> ' + description.title +
      '<br/><b>Coût total du projet:</b> ' + totalCout.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
      '<br/><b>Contribution EU:</b> ' + contributionUE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' € (' + proportion + '%)' +
      ''
    );
  });

  //GRAPHIQUE MILIEU

  var jswidth = document.getElementById('projects').clientWidth;
  jswidth = jswidth-94;

  $.getJSON('data/projects/'+id+'.json', function(data){
      var total_Cost = data.totalCost;
      var ec_Max_Contribution = data.ecMaxContribution;
      if (total_Cost.includes(",")){
          total_Cost = total_Cost.replace(",", ".");
      }
      if (ec_Max_Contribution.includes(",")){
          ec_Max_Contribution = ec_Max_Contribution.replace(",", ".");
      }
      total_Cost = Math.round(total_Cost*1);
      ec_Max_Contribution = Math.round(ec_Max_Contribution*1);

      var duration = 1050,
          transition = 200,
          percent = 100 * ec_Max_Contribution/total_Cost,
          width = jswidth,
          height = 150;

      var dataset = {
                  lower: calcPercent(0),
                  upper: calcPercent(percent)
              },
              radius = Math.min(width, height) / 2,
              pie = d3.layout.pie().sort(null),
              format = d3.format(".0%");

      // Define the div for the tooltip
      var mydiv = d3.select("#myProjectGraph_1_1").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

      var arc = d3.svg.arc()
              .innerRadius(radius * .8)
              .outerRadius(radius);

      var svg = d3.select("#myProjectGraph_1_1").append("svg")
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

  //DONNEES BAS
  $.getJSON('data/projects/'+id+'.json', function(data){
    $("#myProjectGraph_1_2").html(
      '<br/><b>Début:</b> ' + data.startDate +
      '<br/><b>Fin:</b> ' + data.endDate +
      '<br/><b>Coordinateur:</b> ' + data.coordinator +
      '<br/><b>Pays coordinateur:</b> ' + data.coordinatorCountry +
      '<br/><b>Objectif:</b> <div class="text-description">' + data.objective + '</div>' +
      ''
    );
  });
}
