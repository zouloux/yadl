// TODO DOC
type StyleScalarValue = string|number|null
type StyleFunctionalValue = ( element:HTMLElement, style:StyleObject ) => StyleScalarValue
type StyleObject = Partial<Record <keyof CSSStyleDeclaration, StyleScalarValue | StyleFunctionalValue>>|{[key:string]:number|string|null};

type TValueParts = 'unit'|'value';

// TODO : Trouver mieux que ça depuis stdlib
// TODO : DOC
type AttributeList = {[key:string]:any};

/**
 * Set attribute on a DOM Element.
 */
export function setAttributes ( element:HTMLElement, attributes:AttributeList ) {
	// TODO -> Data json
	Object.keys( attributes ).map( key => {
		let value = attributes[ key ];
		// Convert booleans to empty strings
		if ( value === true || value === '' )
			value = '';
		else if ( value === false || value === null ) {
			element.removeAttribute( key )
			return;
		}
		// TODO : D'autres conversions ?
		element.setAttribute( key, value );
	});
}

/**
 * Set style on DOM Element.
 */
export function setStyle ( element:HTMLElement|HTMLElement[], style:StyleObject ) {
	const elements:HTMLElement[] = (Array.isArray(element) ? element : [element]);
	elements.map(el => {
		// if ( !('style' in element) ) return; // fixme ?
		Object.keys( style ).map( property => {
			let value = null;
			switch ( typeof style[ property ] ) {
				case "string" :
					value = style[ property ]; break;
				case "number" :
					value = style[ property ]; break;
				case "function":
					value = style[ property ]( element, style ); break;
			}
			el.style[ property ] = value;
		})
	});
}

/**
 * Parse value, when importing sizes or positions from css modules.
 * @param value string to parse.
 * @param part 'value' or 'unit', default is 'value'.
 */
export function parseValue ( value, part:TValueParts = 'value' ):number|string {
	// Value is already a number
	if ( typeof value === 'number' && part == 'value' )
		return value;
	// Split digital from alpha chars
	const split = value.match(/(\d*\.?\d*)(.*)/);
	if ( part == 'value' )
		return parseFloat( split[ 1 ] );
	else if ( part == 'unit' )
		return split[ 2 ].toLowerCase();
}

/**
 * Get computed style value from a DOM Element.
 */
export function getStyle ( element:HTMLElement, propertyName:(keyof CSSStyleDeclaration), part:(TValueParts|'all') = 'value' ) {
	const computed  = getComputedStyle( element );
	const value = computed[ propertyName ] ?? '';
	return ( part == 'all' ? value : parseValue(value, part) );
}

/**
 * Create a new DOM Element.
 * @param htmlOrTagName HTML Connect or tag name of the new element.
 * @param attributes List of default attributes.
 * @param styleProperties List of default style properties.
 */
export function element ( htmlOrTagName:string, attributes?:AttributeList, styleProperties?:StyleObject ) {
	// Create from tag name if there are no XML tags
	let element:HTMLElement;
	if ( htmlOrTagName.indexOf('<') === -1 )
		element = document.createElement(htmlOrTagName);
	// Create container and inject html if there are XML tags
	else {
		const el = document.createElement('div');
		el.innerHTML = htmlOrTagName;
		element = el.firstElementChild as HTMLElement;
	}
	attributes && setAttributes( element, attributes );
	styleProperties && setStyle( element, styleProperties );
	return element;
}