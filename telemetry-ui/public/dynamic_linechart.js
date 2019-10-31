class DynamicLineChart {
    constructor(d3target, size, range, age){
        this.d3target = d3target;
        this.size = size;
        this.range = range;
        this.age = age;

        this.data_array = [];

        // Size of the svg element
        this.svg_width = this.size * this.d3target.node().offsetWidth;
        this.svg_height = this.size * this.d3target.node().offsetHeight;

        // Margin between the svg edge and graph area
        this.graph_margin = {top: 20, right: 20, bottom: 20, left: 40};

        // Size of the graph area
        this.axis_width = this.svg_width - this.graph_margin.left - this.graph_margin.right;
        this.axis_height = this.svg_height - this.graph_margin.top - this.graph_margin.bottom;
        
        // Create svg
        this.svg = this.d3target
            .append('svg')
            .attr('width', this.svg_width)
            .attr('height', this.svg_height)

        // Create graph area
        this.graph_area = this.svg
            .append("g")
            .attr("transform", `translate(${this.graph_margin.left},${this.graph_margin.top})`);

        // Define an axis for relative time
        this.time_axis = d3.scaleLinear()
            .domain([-this.age * (10 ** -3) , 0])
            .range([0, this.axis_width]);
            
        let now = (new Date()).getTime();

        // Define a scale to evaulate the location of a data point based on when it was created, using a timestamp
        this.utc = d3.scaleLinear()
            .domain([now - this.age, now])
            .range([0, this.axis_width]);
            
        // Define the y axis
        this.y = d3.scaleLinear()
            .domain([this.range.min, this.range.max])
            .range([this.axis_height, 0]);
            
        // Define the line equation
        this.line = d3.line()
            .x(function(d){ return this.utc(d.utc); }.bind(this))
            .y(function(d){ return this.y(d.data); }.bind(this));

        // Create a cut-out area, where all elements outside will be hidden
        this.graph_area
            .append("defs") //defs is a store of shapes to be used later on
            .append("clipPath") //clipPath is a pathline that cuts out any paint if outside the area
                .attr("id", "clip")
            .append("rect")
                .attr("width", this.svg_width)
                .attr("height", this.svg_height);
        
        // Create the x-axis
        this.graph_area
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.y(0)})`)
            .call(d3.axisBottom(this.time_axis));
            
        // Create the y-axis
        this.graph_area
            .append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(this.y));
            
        // Create the line
        this.graph_area.append("g")
                .attr("clip-path", "url(#clip)")
            .append("path")
                .datum(this.data_array)
                .attr("class", "line");
    };
    update(data, utc){
        // Add new data to the array
        this.data_array.push({
            data: data,
            utc: utc
        });

        // Re-calculate the position of all data points with respect to new time --> Find better method
        let now = (new Date()).getTime();
        this.utc.domain([now - this.age, now]);

        // Redraw the line
        d3.select('.line').attr("d", this.line);

        // If a data goes beyond the maximum 'age', remove it
        if(utc - this.data_array[0].utc >= this.age) this.data_array.shift();
    }

}