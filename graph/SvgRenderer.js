/**
 * Module to generate a directed graph layout using a Sugiyama algorithm.
 * @module graph/svgRenderer
 */
define(['dojo/_base/lang', 'dojo/_base/declare', 'graph/svgCssUtil'], function(lang, declare, svgCssUtil) {
	"use strict";

	var d = document;

	/**
	 * Returns an object to create the SVG of the directed graph.
	 * @alias module:graph/svgRenderer
	 * @property {String} canvas id of HTMLDivElement to be used as canvas
	 * @property {SVGElement} svg svg element
	 * @property {SVGNamespace} svgNs svg namespace
	 * @property {Object} gridSize holds the properties meshWidht and meshHeight
	 * @property {Boolean} invert invert rendering direction of graph
	 * @param {Object} args parameters
	 * @property {String} canvas name of HTMLElement to append svg to
	 * @property {Number} meshWidth width of grid mesh
	 * @property {Number} meshHeight height of grid mesh
	 * @property {Function} [onNodeClick] event handler called when clicking node
	 * @property {Function} [onNodeOver] event handler called when mouse is over node
	 * @property {Function} [onNodeOut] event handler called when mousing out from node
	 * @property {Function} [onNodeDblClick] event handler when double clicking node
	 * @property {Boolean} [invert] renders the graph inverted
	 * @returns {graph/SvgRenderer}
	 */

	return declare(null, {

		canvas: null,
		svg: null,
		svgNs: 'http://www.w3.org/2000/svg',
		invert: false,
		gridLabel: 'layer',

		constructor: function(args) {
			lang.mixin(this, args);

			this.canvas = d.getElementById(args.canvas);
		},

		/**
		 * Creates the SVG canvas.
		 * @param {Integer} width width of svg canvas
		 * @param {Integer} height height of svg canvas
		 */
		initSVG: function(width, height) {
			this.svg = d.createElementNS(this.svgNs, 'svg');
			this.svg.setAttribute('version', '1.1');
			this.svg.setAttribute('width', width);
			this.svg.setAttribute('height', height);
			this.svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
			this.defs = d.createElementNS(this.svgNs, 'defs');	// holds markers, such as arrow heads
			this.svg.appendChild(this.defs);
			this.svgRoot = d.createElementNS(this.svgNs, 'g');	// holds all nodes and edges for simple transformation
			this.svg.appendChild(this.svgRoot);
			this.canvas.appendChild(this.svg);
		},

		/**
		 * Creates a graph node.
		 * @param {Object} node
		 * @param {Object} node.lx
		 * @param {Object} node.ly
		 * @param {Object} node.label
		 * @return {SVGGElement} svg group element
		 */
		createNode: function(node) {
			var text, dist, tspan, circle,
				group = d.createElementNS(this.svgNs, 'g');

			svgCssUtil.add(group, 'node');
			group.setAttribute('cx', node.lx);
			group.setAttribute('cy', node.ly);

			// create circle
			circle = d.createElementNS(this.svgNs, 'circle');
			circle.setAttribute('r', '5');
			group.appendChild(circle);

			// create node label
			text = d.createElementNS(this.svgNs, 'text');
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('x', '0px');
			dist = this.invert ? -1 : 1;
			tspan = d.createElementNS(this.svgNs, 'tspan');
			tspan.setAttribute('x', '0px');
			tspan.setAttribute('y', 1.5 * dist + 'em');
			tspan.appendChild(d.createTextNode(node.label));
			text.appendChild(tspan);
			group.appendChild(text);

			return group;
		},

		/**
		 * Draws the node on the canvas.
		 * @param {Object} node GraphNode
		 * @param {Array} nodes graph node list
		 * @return {Object} GraphNode
		 */
		drawNode: function(node, nodes) {
			var x, y, shift = 1;

			x = (shift + Number(node.getAttribute('cx'))) * this.gridSize.meshWidth;
			if (this.invert) {
				y = (Number(node.getAttribute('cy')) * -1 + nodes.length) * this.gridSize.meshHeight;
			}
			else {
				y = (shift + Number(node.getAttribute('cy'))) * this.gridSize.meshHeight;
			}
			node.setAttribute('transform', 'translate(' + x + ',' + y + ')');
			this.svgRoot.appendChild(node);
			return node;
		},

		/**
		 * Draws the grid on the canvas.
		 * Note: After using compact we can not simply calculated
		 * the width from the number of nodes per layer.
		 * The height is calculated from the number of layers.
		 */
		drawGrid: function(width, height) {
			var i, text, level,
				numVertical = width / this.gridSize.meshWidth + 1,
				numHorizontal = height / this.gridSize.meshHeight;

			for (i = 1; i < numHorizontal; i++) {
				this.drawLine(0, i, width, i);
				if (i > 0) {
					text = d.createElementNS(this.svgNs, 'text');
					level = this.invert ? (i + 1) * -1 + numHorizontal : i - 1;
					text.setAttribute('text-anchor', 'left');
					text.appendChild(d.createTextNode(this.gridLabel + ' ' + level));
					text.setAttribute('x', 0);
					text.setAttribute('y', i * this.gridSize.meshHeight + 3);
					this.svgRoot.appendChild(text);
				}
			}

			for (i = 1; i < numVertical + 1; i++) {
				this.drawLine(i, 0, i, height);
			}
		},

		/**
		 * Draws a line on the canvas.
		 * @param {Number} x1 x-coord of line start
		 * @param {Number} y1 y-coord of line start
		 * @param {Number} x2 x-coord of line end
		 * @param {Number} y2 y-coord of line end
		 * @return {Object} SVGLine
		 */
		drawLine: function(x1, y1, x2, y2) {
			var width = this.gridSize.meshWidth,
				height = this.gridSize.meshHeight,
				line = d.createElementNS(this.svgNs, 'line');

			line.setAttribute('x1', x1 * width);
			line.setAttribute('y1', y1 * height);
			line.setAttribute('x2', x2 * width);
			line.setAttribute('y2', y2 * height);
			this.svgRoot.appendChild(line);
			return line;
		},

		/**
		 * Creates a reusable arrow head.
		 * The arrow head is appended to the SVG defs element as a marker element
		 * and can be reused.
		 * @param {String} id id of marker
		 * @return {Object} SVGMarker
		 */
		createArrowHead: function(id) {
			var p, nodeRadius,
				marker = document.createElementNS(this.svgNs, 'marker');

			marker.setAttribute('id', id);
			marker.setAttribute('markerWidth', 11);
			marker.setAttribute('markerHeight', 11);
			marker.setAttribute('orient', 'auto');
			// start arrow head where circle ends
			// TODO: find better method to get x
			p = document.createElementNS(this.svgNs, 'polyline');
			p.setAttribute('points', '0,0 10,5 0,10 1,5');
			nodeRadius = 10; // TODO: find generic solution
			marker.setAttribute('refX', nodeRadius + Number(marker.getAttribute('markerWidth')));
			marker.setAttribute('refY', marker.getAttribute('markerHeight') / 2);
			marker.appendChild(p);
			this.defs.appendChild(marker);
			return marker;
		},

		/**
		 * Draws the edge on the canvas.
		 * The edge is drawn from node1 to node2 with arrow head.
		 * @param {Object} node1 GraphNode
		 * @param {Object} node2 GraphNode
		 * @param {Object} arrow SVGMarker
		 * @param {Array} nodes graph node list
		 * @return {Object} edge
		 */
		drawEdge: function(node1, node2, arrow, nodes) {
			var x1, x2, y1, y2,
				shift = 1,
				width = this.gridSize.meshWidth,
				height = this.gridSize.meshHeight,
				edge = document.createElementNS(this.svgNs, 'polyline');

			x1 = (shift + node1.lx) * width;
			x2 = (shift + node2.lx) * width;
			if (this.invert) {
				y1 = (node1.ly * -1 + nodes.length) * height;
				y2 = (node2.ly * -1 + nodes.length) * height;
			}
			else {
				y1 = (shift + node1.ly) * height;
				y2 = (shift + node2.ly) * height;
			}
			svgCssUtil.add(edge, 'edge');
			edge.setAttribute('points', x1 + ',' + y1 + ' ' + x2 + ',' + y2);
			if (!node2.virt) {
				edge.setAttribute('marker-end', 'url(#' + arrow.id + ')');
			}
			this.svgRoot.appendChild(edge);
			return edge;
		},

		/**
		 * Places the nodes on the canvas.
		 * @param {Array} nodes graph nodes list
		 */
		placeNodes: function(nodes) {
			var i, numRow = nodes.length,
				j, numCol, node, svgNode;

			for (i = 0; i < numRow; i++) {
				numCol = nodes[i].length;
				for (j = 0; j < numCol; j++) {
					node = nodes[i][j];
					if (!node.virt) {
						svgNode = this.createNode(nodes[i][j]);
						nodes[i][j].svgNode = this.drawNode(svgNode, nodes);	// save back for later reference
					}
				}
			}
		},

		/**
		 * Places the edges on the canvas.
		 * @param {Array} nodes graph node list
		 */
		placeEdges: function(nodes) {
			var i, j, l, z, x, y, adjNode, numCol, node,
				numRow = nodes.length,
				arrow = this.createArrowHead('arrow');

			for (i = 0; i < numRow; i++) {
				numCol = nodes[i].length;
				for (j = 0; j < numCol; j++) {
					node = nodes[i][j];
					if (node.trgNodes) {
						l = node.trgNodes.length;
						node.svgEdges = [];
						for (z = 0; z < l; z++) {
							x = node.trgNodes[z][0];
							y = node.trgNodes[z][1];
							adjNode = nodes[y][x];
							node.svgEdges[z] = this.drawEdge(node, adjNode, arrow, nodes);
						}
					}
				}
			}
		},

		/**
		 * Clear the canvas.
		 */
		clearCanvas: function() {
			if (this.canvas) {
				this.canvas.innerHTML = '';
			}
		},

		/**
		 * Render graph as SVG.
		 * @param {Object} graph
		 */
		render: function(graph) {
			var width = (graph.getGraphWidth() + 1) * this.gridSize.meshWidth,
				height = this.gridSize.meshHeight * (graph.numLayer + 1);

			this.initSVG(width, height);
			this.drawGrid(width, height);
			this.placeEdges(graph.nodes);
			this.placeNodes(graph.nodes);
		}
	});
});