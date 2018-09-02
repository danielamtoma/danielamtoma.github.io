/****** Fonction qui retourne les coûts du projet ******/
function projectContributionProportion(){
    $("#myProjectGraph_3_2").html('');
    $("#myProjectGraph_3_2_description").html('');
    var id = $('#projectId').text();

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
        total_Cost = total_Cost*1;
        ec_Max_Contribution = ec_Max_Contribution*1;

        $("#myProjectGraph_3_2_description").html(
          '<br/><b>Contribution pour toutes les organisations:</b> ' + total_Cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
          '<br/><b>5 plus grandes subventions reçues:</b> ' + ec_Max_Contribution.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' +
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
        var mydiv = d3.select("#myProjectGraph_3_2").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        var arc = d3.svg.arc()
                .innerRadius(radius * .8)
                .outerRadius(radius);

        var svg = d3.select("#myProjectGraph_3_2").append("svg")
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
