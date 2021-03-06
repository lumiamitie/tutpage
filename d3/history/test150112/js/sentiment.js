
var w = 960,
    h = 480,
    p = [20, 50, 30, 20],
    x = d3.scale.ordinal().rangeRoundBands([0, w - p[1] - p[3]]),
    y = d3.scale.linear().range([0, h - p[0] - p[2]]),
    z = d3.scale.ordinal().range(["#E85349", "#A4C0FF"]),
    parse = d3.time.format("%m/%Y").parse,
    format = d3.time.format("%b"),
	sentiment_list = ["negative", "positive"];

var svg = d3.select("div").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + p[3] + "," + (h - p[2]) + ")");
	

	

d3.json("data/sentiment.json", function(senti) {

  // Transpose the data into layers by channel.
  var sentiments = d3.layout.stack()(sentiment_list.map(function(sentiment) {
    return senti.map(function(d) {
      return {x: d.date, y: +d[sentiment]};
    });
  }));

  // Compute the x-domain (by date) and y-domain (by top).
  
  //x.domain(channels[0].map(function(d) { return d.x; }));
  x.domain(senti.map(function(d) {return d.date}));
  
 // y.domain([0, d3.max(channels[channels.length - 1], function(d) { return d.y0 + d.y; })]);
  y.domain([-d3.max(senti.map(function(d) {return d.negative})), 
					d3.max(senti.map(function(d) {return d.positive}))]);
  
  
  // Add a group for each channel.
  var sentiment = svg.selectAll("g.sentiment")
      .data(sentiments)
    .enter().append("svg:g")
      .attr("class", function(d,i){return "sentiment_"+sentiment_list[i];})
     .style("fill", function(d, i) { return z(i); })
      .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

  // Add a rect for each date.
  var rect_positive = sentiment.selectAll("rect")
      .data(Object)
    .enter().append("svg:rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { if(d.y0 != 0){return -y(d.y)}})
      .attr("height", function(d) { if(d.y0 != 0){return y(d.y)-y(0)}})
      .attr("width", x.rangeBand());
	  
  var rect_negative = sentiment.selectAll("rect.neg")
      .data(Object)
    .enter().append("svg:rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", -y(0))
      .attr("height", function(d) { if( d.y0 == 0 ){ return y(d.y)-y(0)}})
      .attr("width", x.rangeBand());
	  

  // Add a label per date.
  var label = svg.selectAll("text")
      .data(x.domain())
    .enter().append("svg:text")
      .attr("x", function(d) { ;return x(d) + x.rangeBand() / 2; })
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .attr("dy", ".71em")
      .text(function(d, i) {return d;})
	  .attr("writing-mode","tb-rl");

  // Add y-axis rules.
  var rule = svg.selectAll("g.rule")
      .data(y.ticks(5))
    .enter().append("svg:g")
      .attr("class", "rule")
      .attr("transform", function(d) { return "translate(0," + -y(d) + ")"; })
	  .style("opacity",0.8);

  rule.append("svg:line")
      .attr("x2", w - p[1] - p[3])
      .style("stroke", function(d) { return d ? "#bbb" : "#000"; })
      .style("stroke-opacity", function(d) { return d ? .7 : null; });

  rule.append("svg:text")
      .attr("x", w - p[1] - p[3] + 6)
      .attr("dy", ".35em")
      .text(d3.format(",d"));
	  
	  
	var legend = svg.append("g")
	  .attr("class", "legend")
	  .attr("x", w/2.5)
	  .attr("y", 20)
	  .attr("height", 100)
	  .attr("width", 100);    
	
	legend.selectAll('g').data(sentiment_list)
      .enter()
      .append('g')
      .each(function(d, i) {
		var g = d3.select(this);
			g.append("rect")
			  .attr("x", w/2.5 + i*80 -12)
			  .attr("y", 62)
			  .attr("width", 10)
			  .attr("height", 10)
			  .style("fill", function(i){return z(i)})
			  .on("click", function(d,i){
				if (d3.select(".sentiment_" + d).selectAll("rect").style("display") == "inline"){
				  d3.select(".sentiment_" + d).selectAll("rect").style('display','none');
				  g.select("rect").style("opacity",0.3);
				} else {
				   d3.select(".sentiment_" + d).selectAll("rect").style('display','inline');
				   g.select("rect").style("opacity",1);
				}
			  });
        
        g.append("text")
          .attr("x", w/2.5 + i*80)
          .attr("y", 70)
          .attr("height",30)
          .attr("width",100)
          .style("fill", "black")
		  .style("font-size", "12px")
          .text(function(){return d})
          ;
	});
});