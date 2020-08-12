import {DirectedGraphLayout} from "./graph/DirectedGraphLayout.js";
import {SvgRenderer} from "./graph/SvgRenderer.js";

let graph, svg,
	graphData = {
		numLayer: 4,
		maxPerLayer: 2,
		nodeList: [
			{label: 'Rubecula', layer: 0},
			{label: 'Turdus', layer: 3},
			{label: 'Corvus', layer: 1},
			{label: 'Falco', layer: 1},
			{label: 'Cathartes', layer: 2},
			{label: 'Parus', layer: 0}
		],
		adjList: [
			[2, 3, 4],
			[],
			[1],
			[],
			[],
			[2]
		]
	};

graph = new DirectedGraphLayout({
	numLayer: graphData.numLayer,
	compacted: false
});
svg = new SvgRenderer({
	canvas: 'graphCanvas',
	gridSize: {
		meshWidth: 100,
		meshHeight: 100
	}
});

graph.render(graphData);
svg.render(graph);