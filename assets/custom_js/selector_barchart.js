/****** Fonction qui affiche le le barchart de sélection ******/
function selectorBarchart(sectorStat){
  // set the dimensions of the canvas
  $("#barChartSelector").html('');
  var data = [];
  for (var sect in sectorStat){
    data.push({sector:sect, contribution:sectorStat[sect]});
  };

  var margin = {top: 20, right: 20, bottom: 70, left: 40},
      width = 350 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

  var y = d3.scale.linear().range([height, 0]);

  // define the axis
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5);

  // add the SVG element
  var svg = d3.select("#barChartSelector").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var clickedSectors = [];

    // The following code was contained in the callback function.
    x.domain(data.map(function(d) { return d.sector; }));
    y.domain([0, d3.max(data, function(d) { return d.contribution; })]);

    // add axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Nombre de compagnies");


    // Add bar chart
    var bar = svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("id", function(d) { return d.sector;})
        .attr("x", function(d) { return x(d.sector); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.contribution); })
        .attr("height", function(d) { return height - y(d.contribution); })
}
