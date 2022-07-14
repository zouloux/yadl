
/**
 * Convert colors to be SVG compatible.
 */
export function svgColor ( color:number|string ) {
	if ( typeof color === 'string' )
		return color;
	let str = color.toString(16);
	// Prepend zeros
	while ( str.length < 6 )
		str = '0' + str
	return '#'+str
}

/**
 * Convert a 2D position to an SVG translate instruction.
 */
export function svgPosition (x:number|string, y:number|string) {
	return `translate(${x} ${y}) `
}