var width = 1000, height = 700;
var svg = d3.select('.diagram')
	.append('svg')
	.attr('width', width)
	.attr('height', height)
	.append('g')

var projection = d3.geo.mercator().translate([width / 2, height / 2]).scale(2800);
var path = d3.geo.path();
var scaleText = d3.scale.linear().domain([0,45]).range([10,30]);
var force = d3.layout.force().size([width, height]);


d3.json('./libs/ukraine.geojson', function (error, data) {

var nodes = data.nodes,	links = data.links,	filteredLinks = links;

projection.center(d3.geo.centroid(data))
path.projection(projection)

var group = svg.append('g')
	.attr('class', 'regions')
	.selectAll('.region')
	.data(data.features)
	.enter()
	.append('g')
	.attr('class', 'region');

var area = group.append('path')
	.attr('d', path)
	.attr('fill', 'none')
	.attr('stroke', '#cacaca')
	.attr('stroke-width', 1.5)

force
	.nodes(nodes)
	.links(links)
	.start();


setTimeout(function() { 

	draw();

	var gradient = svg.append("defs")
		.selectAll('linearGradient')
		.data(links)
		.enter()
		.append("linearGradient")
		.attr("id", function(d) { return "linearGradient-" + d.source.id + '' + d.target.id})
		.attr("x1", function(d) { return d.source.dx })
		.attr("y1", function(d) { return d.source.dy })
		.attr("x2", function(d) { return d.target.dx })
		.attr("y2", function(d) { return d.target.dy })
		.attr('gradientUnits', "userSpaceOnUse");

	gradient.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", "#332532")
		.attr("stop-opacity", 1);

	gradient.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", "#f2efdf")
		.attr("stop-opacity", 1);

	gradient.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", "#f77a52")
		.attr("stop-opacity", 1);

}, 50);

	


function draw() {

	d3.select(".links").remove();

	var link = svg.append('g')
		.attr('class', 'links')
		.selectAll('.link')
		.data(filteredLinks)
		.enter()
		.append('path')  
		.attr('class', 'link')
		.attr('stroke', function(d, i) {return "url(#linearGradient-" + d.source.index + '' + d.target.index + ")"})
		.attr('fill', 'none')
		.attr("stroke-dashoffset", function(d) {return d.length})
		.attr('stroke-opacity', 0)
		.transition()
    .duration(1500)
    .ease("linear")
    .attr('stroke-opacity', 0.7)
		.attr("stroke-dashoffset", 0)
		.attr('d', function(d) {
			
		        var dx = d.target.dx - d.source.dx,
		            dy = d.target.dy - d.source.dy,
		            dr = Math.sqrt(dx * dx + dy * dy);
		        return "M" + 
		            d.source.dx + "," + 
		            d.source.dy + "A" + 
		            dr + "," + dr + " 0 0,1 " + 
		            d.target.dx + "," + 
		            d.target.dy;
		    })
		.attr('stroke-width', function(d) { return d.weight})
		.attr('stroke-linecap',  'round');

	var station = svg.append('g')
		.attr('class', 'stations')
		.selectAll('.station')
		.data(data.features)
		.enter()
		.append("g")
		.attr('class', function (d) {  return '' + d.properties.name });

	var rect = station.append('rect')
		.attr("stroke", "none");

	var text = station.append('text')
		.attr('class', 'city')
		.attr('x', function(d) { return path.centroid(d)[0] })
		.attr('y', function(d) { return path.centroid(d)[1] })
		.attr('text-anchor', 'middle')
		.text(function (d, i) {  return d.properties.name })
		.attr('style', function (d, i) {  
			var textSize = 0;
			links.forEach(function (value) {
				if (value.source.id === i || value.target.id === i)
					textSize +=1;
			})
			return 'font: ' + scaleText(textSize) + 'px sans-serif'
		})
		.on('click', click)
		.style('cursor', 'pointer');

	rect.attr("x", function() {  return d3.select(this.parentNode).select('text').node().getBBox().x })
		.attr("y", function() {  return d3.select(this.parentNode).select('text').node().getBBox().y })
		.attr("width", function() {  return d3.select(this.parentNode).select('text').node().getBBox().width })
		.style("fill", "rgba(255, 255, 255, 0.5)")
		.attr("height", function() {  return d3.select(this.parentNode).select('text').node().getBBox().height });
}


function click () {

	var city = this.innerHTML;
	var index; 

	data.features.forEach(function(value, i) {
		if (city === value.properties.name) {
			index = i;
		}
	});

	sourceLinks = links.filter(function(value) {
		return (value.source.id) == index ? true : false;
	});
	targetLinks = links.filter(function(value) {
		return (value.target.id) == index ? true : false;
	});

	filteredLinks = sourceLinks.concat(targetLinks);
	draw();

}
});
