import dim from './dimensions.js'
import {makeGrid} from './grid.js'

/*
// main
const numBuckets = 16

for (let bucketId of d3.range(1, numBuckets + 1)) {
    if (bucketId == 8) {
         // no data
        continue
    }


    let fig = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height)

    // crop distributions below x-axis minimum
    let clip = fig.append('clipPath')
        .attr('id', `clip-${bucketId}`)
        .append('rect')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', innerWidth)
        .attr('height', innerHeight)

    drawFig(data, fig, bucketId)
}
*/


// make grid
d3.select('body').append('svg')
    .attr('width', dim.width)
    .attr('height', dim.height)

const bucketNums = [...d3.range(1, 8), ...d3.range(9, 17)]
let {compScales, distScales} = makeGrid(bucketNums)


// draw plots
const beginDir = 'data/n3-frombeginning'
const endDir = 'data/n3-fromend'
for (let index = 0; index < bucketNums.length; index++) {
    // get and parse data
    const bucketNum = bucketNums[index]
    let beginFile = `${beginDir}/distances-bucket-${bucketNum}.json`
    let endFile = `${endDir}/distances-bucket-${bucketNum}.json`

    let beginData = await parseData(beginFile)
    let endData = await parseData(endFile)

    // get proper scales in grid
    const {row, column} = getPosition(index)
    const compScale = compScales[row]
    const distScale = distScales[column]

    // draw cloud
    drawCloud(beginData, compScale, distScale, 'begin')
    drawCloud(endData, compScale, distScale, 'end')
}

// plots
function drawCloud(bucketData, compScale, distScale, timepoints) {
    const bandwidth = 0.02

    for (let comp of ['fecal', 'soil', 'food compost', 'bulking material']) {
        let compData = bucketData.filter(
            d => d.comparison == comp
        ).map(
            d => d.distance
        )
        let thresholds = getThresholds(compData, 20)
        let density = kde(epanechnikov(bandwidth), thresholds, compData)

        let cloudScaleBegin = d3.scaleLinear()
            .domain(d3.extent(density.map(d => d[1])))
            .range([
                compScale(comp) + compScale.bandwidth() / 2,
                compScale(comp) + 25
            ])
        let cloudScaleEnd = d3.scaleLinear()
            .domain(d3.extent(density.map(d => d[1])))
            .range([
                compScale(comp) + compScale.bandwidth() / 2,
                compScale(comp) + compScale.bandwidth() - 25
            ])

        let area
        if (timepoints == 'begin') {
            area = d3.area()
                .x(d => distScale(d[0]))
                .y0(compScale(comp) + compScale.bandwidth() / 2)
                .y1(d => cloudScaleBegin(d[1]))
                .curve(d3.curveBasis)

        } else if (timepoints == 'end') {
            area = d3.area()
                .x(d => distScale(d[0]))
                .y0(compScale(comp) + compScale.bandwidth() / 2)
                .y1(d => cloudScaleBegin(d[1]))
                .curve(d3.curveBasis)
        }

        d3.select('svg').append('path')
            .datum(density)
            .attr('fill', getColor(comp, timepoints))
            .attr('stroke', 'gray')
            .attr('stroke-width', 1.5)
            .attr('d', area)
            // .attr('clip-path', clipUrl)
    }
}

// figure
function drawFig(data, svg, bucketId) {
    /*
    // scales
    let distanceScale = d3.scaleLinear()
        .domain([0.5, 1])
        .range([margin.left, margin.left + innerWidth])

    let compScale = d3.scaleBand()
        .domain(data.map(d => d.comparison))
        .range([margin.top, margin.top + innerHeight])


    // axes
    const xAxis = d3.axisBottom(distanceScale);
    svg.append('g')
        .attr('transform', `translate(0,${margin.top + innerHeight})`)
        .attr('class', 'x-axis')
        .call(xAxis)

    const yAxis = d3.axisLeft(compScale);
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .attr('class', 'y-axis')
        .call(yAxis)
    */

    /*
    // axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', margin.left + innerWidth / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .text(`Bucket ${bucketId}`)

    svg.append('text')
        .attr('class', 'subtitle')
        .attr('x', margin.left + innerWidth / 2)
        .attr('y', margin.top / 2 + 25)
        .attr('text-anchor', 'middle')
        .text(`n=3 chronologically first timepoints`)

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', margin.left + innerWidth / 2)
        .attr('y', height - margin.bottom / 2)
        .attr('text-anchor', 'middle')
        .text('Distance')

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', margin.left / 2)
        .attr('y', margin.top + innerHeight / 2 - 10)
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90, ${margin.left/2 }, ${height/2})`)
        .text('Comparison')
    */

    /*
    // plot scatter
    let jitter = d3.randomNormal(0, 8)

    let clipUrl = `url(#clip-${bucketId})`
    console.log('bucket num', bucketId)
    console.log('clip url', clipUrl)
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('cx', d => distanceScale(d.distance))
        .attr('cy', d => {
            return (compScale(d.comparison) + compScale.bandwidth() * 0.75) + jitter()
        })
        .attr('fill', d => getColor(d.comparison))
        .attr('fill-opacity', 0.4)
        .attr('clip-path', clipUrl)
    */

    // plot cloud
}


// helpers
async function parseData(file) {
    const distances = await d3.json(file)

    let distancesLong = []
    let comparisons = ['food compost', 'soil', 'fecal', 'bulking material']
    comparisons.forEach(comp => {
        distances[comp].forEach(dist => {
            distancesLong.push({comparison: comp, distance: dist})
        })
    })
    const data = distancesLong

    return data
}

function getPosition(bucketIndex) {
    // assumes bucketIndex begins at 0
	return {
		row: Math.floor(bucketIndex / 3),
		column: bucketIndex % 3
	}
}

function kde(kernel, thresholds, data) {
    return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))])
}

function epanechnikov(bandwidth) {
    return x => {
        if (Math.abs(x /= bandwidth) <= 1) {
            return 0.75 * (1 - x * x) / bandwidth
        } else {
            return 0
        }
    }
}

function getThresholds(data, numThresholds) {
    // call separately for each comparison distribution
    const extent = d3.extent(data)
    const niceExtent = d3.nice(...extent, 10)
    const thresholds = d3.ticks(...niceExtent, numThresholds)
    return thresholds
}

function getColor(comp, timepoints) {
    let opacity
    if (timepoints == 'begin') {
        opacity = '77'
    } else if (timepoints == 'end') {
        opacity = 'dd'
    }

    let color
    if (comp == 'fecal') {
        color = '8c564b'
    } else if (comp == 'soil') {
        color = '000000'
    } else if (comp == 'food compost') {
        color = 'ff0000'
    } else if (comp == 'bulking material') {
        color = '008000'
    }

    return `#${color}${opacity}`
}


/*
// download button
function downloadAllFigs(event, d) {
    const allSvgElems = document.querySelectorAll('svg');
    for (let i = 0; i < allSvgElems.length; i++) {
        (function(index) {
            setTimeout(function() {
                let svgElem = allSvgElems[index]
                let serializer = new XMLSerializer()
                let source = serializer.serializeToString(svgElem)
                let url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)
                let link = document.createElement("a")
                link.href = url
                link.download = `bucket-${index + 1}.svg`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }, index * 200)
        })(i);
    }
}

d3.select('body').insert('button', ':first-child')
    .text('download figures')
    .attr('class', 'download-button')
    .on('click', downloadAllFigs)
*/
