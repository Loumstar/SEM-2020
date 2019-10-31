d3.select('.line').attr("transform", 'translate(25,0)');

if(arr_length < 3) scatter.push({
    temp: data.data,
    time: data.utc
});

arr_length = scatter.length;

d3.select('.line')
        .attr("d", line)
    .transition()
        .duration(function(){
            if(arr_length > 2){
                return scatter[arr_length - 1].time - scatter[arr_length - 2].time
            }
        })
        .ease(d3.easeLinear)
        .attr("transform", function(){
            if(arr_length > 2){
                return `translate(${(scatter[0].time - scatter[arr_length - 1].time) / n},0)`
            }
        })

// Removes oldest data point when the line covers the whole graph area
if(arr_length >= n) scatter.shift();
