/**
 * Module containing CSS helper functions to work with svg.
 *
 * Note: dojo/dom-class does not work with svg elements, because in SVG,
 * className is defined as type SVGAnimatedString -> use getAttribute instead of className
 * @see https://bugs.dojotoolkit.org/ticket/16309
 * @module dgraph/svgCssUtil
 */
export let svgCssUtil = {

	/**
	 * Add a class name to the class attribute.
	 * @param {HTMLElement|SVGElement} element
	 * @param {String} className
	 * @param {Boolean} [overwrite] adds by default
	 */
	add: function(element, className, overwrite) {
		let cls = element.getAttribute('class');

		if (!overwrite) {
			className = (cls ? cls + ' ': '') + className;
		}
		element.setAttribute('class', className);
	},

	/**
	 * Returns the class attribute
	 * @param {HTMLElement|SVGElement} element
	 * @return {string}
	 */
	getClass: function(element) {

		return element.getAttribute('class');
	},

	/**
	 * Remove a class name from class attribute
	 * @param {HTMLElement|SVGElement} element
	 * @param className
	 */
	remove: function(element, className) {
		let arrClasses = element.hasAttribute('class') ? this.getClass(element).split(' '): [],
			newClasses = [],
			i, len;

		len = arrClasses.length;
		for (i = 0; i < len; i++) {
			if (className !== arrClasses[i]) {
				newClasses.push(arrClasses[i]);
			}
		}
		this.add(element, newClasses.join(' '), true);
	},

	/**
	 * Checks element for given class.
	 * ClassName can be an array to check for multiple classes.
	 * @param {HTMLElement|SVGElement} element
	 * @param {Array|String} className
	 */
	has: function(element, className) {
		let elClasses = element.hasAttribute('class') ? this.getClass(element).split(' '): [],
			arrClasses = className,
			chkInd = 0,
			i, len, z, lenZ;

		if (typeof className === 'string') {
			arrClasses = className.split(' ');
		}

		len = arrClasses.length;
		for (i = 0; i < len; i++) {
			lenZ = elClasses.length;
			for (z = 0; z < lenZ; z++) {
				if (arrClasses[i] === elClasses[z]) {
					chkInd++;
					break;
				}
			}
		}

		return chkInd === arrClasses.length;
	},

	/**
	 * Adds a class to node if not present, or removes if present.
	 * @param {HTMLElement|SVGElement} element
	 * @param className
	 */
	toggle: function(element, className) {
		let fnc = this.has(element, className) ? 'remove': 'add';

		this[fnc](element, className);
	}
};