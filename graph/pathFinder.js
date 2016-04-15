/**
 * Module contains utility to search graph nodes.
 *
 * You can use and change this freely as long as you keep this note.
 * @copyright: Simon Speich, 2013
 *
 * Note: Can't use dojo/dom-class since SVGElements are not supported
 * @see https://bugs.dojotoolkit.org/ticket/16309
 * @module dgraph/pathFinder
 */
define(['dgraph/svgCssUtil'], function(svgCssUtil) {
	"use strict";

	return /** @lends module:dgraph/pathFinder */ {

		/**
		 * Find connected target nodes using a breadth first search (BFS) search.
		 * @param {graphNode} node graph node
		 * @param {Array} nodelist list of graph nodes
		 * @param {Function} fnc callback
		 */
		searchByTargets: function(node, nodelist, fnc) {
			var openNodes = [],
				newNode, neighbors, i, len, nextNode;

			openNodes.push(node);
			while (openNodes.length > 0) {
				newNode = openNodes.shift();
				neighbors = newNode.trgNodes;
				len = neighbors.length;
				// Add each neighbor to the beginning of openNodes
				for (i = 0; i < len; i++) {
					nextNode = nodelist[neighbors[i][1]][neighbors[i][0]];
					fnc.apply(this, [nextNode]);
					openNodes.unshift(nextNode);
				}
			}
		},

		/**
		 * Find connected source nodes using a breadth first search (BFS) search.
		 * @param {graphNode} node graph node
		 * @param {Array} nodelist list of graph nodes
		 * @param {Function} fnc callback
		 */
		searchBySources: function(node, nodelist, fnc) {
			var openNodes = [],
				newNode, neighbors, i, len, nextNode;

			openNodes.push(node);
			while (openNodes.length > 0) {
				newNode = openNodes.shift();
				neighbors = newNode.srcNodes;
				len = neighbors.length;
				// Add each neighbor to the beginning of openNodes
				for (i = 0; i < len; i++) {
					nextNode = nodelist[neighbors[i][1]][neighbors[i][0]];
					fnc.apply(this, [newNode, nextNode]);
					openNodes.unshift(nextNode);
				}
			}
		},

		/**
		 * Highlight all connected edges.
		 * @param {graphNode} node graph node
		 * @param {Array} nodelist list of graph nodes
		 */
		highlightPath: function(node, nodelist) {
			var highlightSources, highlightTargets, el;

			highlightSources = function(node, srcNode) {
				var target, edge, el, z, lenZ, cl;

				lenZ = srcNode.svgEdges.length;
				for (z = 0; z < lenZ; z++) {
					target = srcNode.trgNodes[z];
					if (target[0] === node.x && target[1] === node.y) {	// order of trgNode and svgEdges is same
						edge = srcNode.svgEdges[z];
						svgCssUtil.toggle(edge, 'srcEdgeHighlighted');
						if (srcNode.svgNode) {
							el = srcNode.svgNode;
							svgCssUtil.toggle(el, 'srcNodeHighlighted');
						}
					}
				}
			};
			highlightTargets = function(node) {
				var edge, el, z, lenZ;

				lenZ = node.trgNodes.length;
				for (z = 0; z < lenZ; z++) {
					edge = node.svgEdges[z];
					svgCssUtil.toggle(edge, 'targetEdgeHighlighted');
					el = nodelist[node.trgNodes[z][1]][node.trgNodes[z][0]];
					if (el.virt === false) {
						el = el.svgNode;
						svgCssUtil.toggle(el, 'trgNodeHighlighted');
					}
				}
			};

			el = node.svgNode;  //.getElementsByTagName('circle')[0];
			svgCssUtil.toggle(el, 'nodeHighlighted');
			el = el.getElementsByTagName('circle')[0];
			el.setAttribute('r', el.getAttribute('r') === '5' ? 8 : 5);
			highlightTargets(node);
			this.searchByTargets(node, nodelist, highlightTargets);
			this.searchBySources(node, nodelist, highlightSources);
		}
	};
});

