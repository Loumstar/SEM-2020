class DynamicBarChart {
    constructor(d3target, size, range, colour){
        this.d3target = d3target;
        this.size = size;
        this.range = range;
        this.colour = colour;

        // Size of svg element
        this.width = this.size * this.d3target.node().offsetWidth;
        this.height = this.size * this.d3target.node().offsetHeight - 10;

        // Create svg
        this.svg = this.d3target
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

    };
    update(new_data){
        this.svg.selectAll("rect")
            // Update dataset
            .data(new_data)
            // Re calculate width for each data point
            .attr('width', function(d){
                if (d > this.range.max) return this.width;
                else return this.width * (d - this.range.min) / (this.range.max - this.range.min);
            }.bind(this))
            .enter()
            // Add a bar for each data point
            .append("rect")
                .attr('x', function(){ return (1 - this.size) * this.width; }.bind(this))
                .attr('y', function(d, i){
                    let padding = (1 - this.size) * this.height;
                    return padding + (i * this.height / new_data.length); }.bind(this))
                .attr('height', function(){ return this.size * this.height / new_data.length; }.bind(this))
                .attr('fill', this.colour)
    }
};
