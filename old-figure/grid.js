import dim from './dimensions.js'

// generates and returns the grid scales and draws the axes
export function makeGrid(bucketNums) {
    const numColumns = 3
    const numRows = Math.ceil(bucketNums.length / numColumns)
	let comparisonRangeScale = d3.scaleBand()
	    .domain(d3.range(0, numRows))
	    .range([dim.margin.top, dim.height - dim.margin.bottom])
	    .paddingInner(0.1)
		.paddingOuter(0.1)
	let distanceRangeScale = d3.scaleBand()
	    .domain(d3.range(0, numColumns))
	    .range([dim.margin.left, dim.width - dim.margin.right])
	    .paddingInner(0.1)
		.paddingOuter(0.1)

	let compScales = []
	let distScales = []

	let s = comparisonRangeScale
	for (let row=0; row < numRows; row++) {
		const compRange = [s(row), s(row) + s.bandwidth()]
	    compScales.push(makeAComparisonScale(compRange))

	}

	s = distanceRangeScale
	for (let col=0; col < numColumns; col++) {
		const distRange = [s(col), s(col) + s.bandwidth()]
	    distScales.push(makeADistanceScale(distRange))
	}

	return {compScales, distScales}
}


function makeAComparisonScale(range) {
    const comparisonScale = d3.scaleBand()
        .domain(['food compost', 'soil', 'fecal', 'bulking material'])
        .range(range)

    const comparisonAxis = d3.axisLeft(comparisonScale)
	d3.select('svg').append('g')
        .attr('transform', `translate(${dim.margin.left}, 0)`)
        .attr('class', 'comparison-axis')
        .call(comparisonAxis)

    return comparisonScale
}

function makeADistanceScale(range) {
    const distanceScale = d3.scaleLinear()
        .domain([0.5, 1])
        .range(range)

    const distanceAxis = d3.axisBottom(distanceScale)
    d3.select('svg').append('g')
        .attr('transform', `translate(0, ${dim.height - dim.margin.bottom})`)
        .attr('class', 'distance-axis')
        .call(distanceAxis)

    return distanceScale
}

