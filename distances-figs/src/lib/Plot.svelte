<script>
import * as d3 from 'd3';
import { onMount } from 'svelte';

import { parseData } from '../util.js';

import AxisBottom from './AxisBottom.svelte';
import AxisLeft from './AxisLeft.svelte';
import Cloud from './Cloud.svelte';


export let filepaths;
export let leftAxis;

let distances = massageData();
async function massageData() {
	let distances = {
		start: {},
		end: {},
	};

	let startData = await parseData(filepaths.start);
	let endData = await parseData(filepaths.end);
	let data = {start: startData, end: endData};

	for (let direction of ['start', 'end']) {
		for (let sampleType of compScale.domain()) {
			let compData = data[direction].filter(
				d => d.comparison == sampleType
			).map(
				d => d.distance
			)

			distances[direction][sampleType] = compData;
		}
	}

	return distances;
}

const dim = {
	width: 600,
	height: 600,
};

let left = 10;
if (leftAxis) {
	left = 100;
}
const margin = {
	top: 50,
	right: 50,
	bottom: 100,
	left: left,
};

let distScale = d3.scaleLinear()
	.domain([0.5, 1])
	.range([margin.left, dim.width - margin.right])

let compScale = d3.scaleBand()
	.domain(['food compost', 'soil', 'fecal', 'bulking material'])
	.range([dim.height - margin.bottom, margin.top])

onMount(() => {
	d3.select(`.bucket-${bucket}`).append('clipPath')
		.attr('id', `clip-${bucket}`)
		.append('rect')
		.attr('x', 100)
		.attr('y', 50)
		.attr('width', 450)
		.attr('height', 450);
});

let bucket = filepaths.bucket;
</script>

<div class={`bucket-${bucket}-plot`}>
	<svg class={`bucket-${bucket}`} xmlns="http://www.w3.org/2000/svg">
		<text transform="translate({dim.width / 2}, 20)">Bucket {bucket}</text>

		<AxisBottom {dim} {margin} scale={distScale} />
		{#if leftAxis}
			<AxisLeft {dim} {margin} scale={compScale} />
		{/if}

		{#await distances}
			<p>Loading...</p>
		{:then distances}
			{#each ['start', 'end'] as time}
				{#each compScale.domain() as comp}
					<Cloud
						data={distances[time][comp]}
						{comp}
						{time}
						{compScale}
						{distScale}
						{bucket}
					/>
				{/each}
			{/each}
		{:catch error}
			<p>Error: {error}</p>
		{/await}
	</svg>
</div>

<style>

	svg {
		width: 600px;
		height: 600px;
	}
	div {
		display: inline;
	}

</style>
