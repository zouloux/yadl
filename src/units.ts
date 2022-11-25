
/**
 * Convert size and position values which contain unit in strings
 * like "12rem", "42px", "50%" into a tuple of the value as number and the unit.
 * Note : Accepts numbers and default unit is "px"
 * Ex : splitSizeAndUnit("12rem") -> [12, "rem"]
 * Ex : splitSizeAndUnit("42PX") -> [42, "px"]
 * Ex : splitSizeAndUnit("    50   % ") -> [50, "%"]
 * Ex : splitSizeAndUnit("50") -> [50, 'px']
 * Ex : splitSizeAndUnit(1) -> [1, 'px']
 * @param value A string based size or position containing a unit
 * @return A tuple with the value as number and the unit as string
 */
export function splitSizeAndUnit ( value:string|number ):[number, string] {
	// Value is already a number
	if ( typeof value === 'number' )
		return [ value as number, '' ];
	// Split digital from alpha chars
	const split = value.trim().match(/(\d*\.?\d*)(.*)/);
	// Patch position and unit
	const position = parseFloat( split[1] ?? '0' )
	const unit = (split[2] ?? '').trim().toLowerCase()
	return [
		// The position value as number, avoid NaN values
		isNaN( position ) ? 0 : position,
		// The unit as string, avoid empty strings, default to px
		( unit || 'px' )
	]
}

/**
 * Convert an REM value to a px size or position front root font-size.
 * If : html { font-size: 10px }
 * Ex : remToPixels(1) -> 10
 * Ex : remToPixels(2) -> 20
 * Ex : remToPixels("2rem") -> 20
 * Ex : remToPixels("2%") -> 20 // will silently fallback to 2rem
 * Ex : remToPixels( 50 ) -> 500
 * Ex : remToPixels("20px") -> 20 // will silently output the input straight
 * @param value
 */
export function remToPixels ( value:string|number ):number {
	// Get value as a number if something like "12rem" is passed.
	const sizeAndUnit:[number, string] = (
		( typeof value === 'string' )
		? splitSizeAndUnit( value )
		: [ value, 'rem' ]
	);
	// Input is a px based size, no need to convert
	if ( sizeAndUnit[1] === "px" )
		return sizeAndUnit[0]
	// Get html font-size ( REM is based on this value )
	const fontSize = parseFloat(
		getComputedStyle( document.documentElement ).fontSize
	)
	// REM value is translated from html font size
	return sizeAndUnit[0] * fontSize
}