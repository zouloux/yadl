
// TODO DOC
type ContainerOrSelector = string|HTMLElement;

// TODO DOC
function selectorDefaults ( containerOrSelector:ContainerOrSelector, selector?: string ) : [HTMLElement, string] {
	// Target container as first argument
	let container: HTMLElement = containerOrSelector as HTMLElement;
	// Set container as document and get selector from arguments if there is no selector argument
	if ( selector == null ) {
		selector = containerOrSelector as string;
		container = document.documentElement;
	}
	return [ container, selector ];
}

// -----------------------------------------------------------------------------

/**
 * Select a single HTMLElement in current document or container.
 */
export function find ( containerOrSelector: ContainerOrSelector, selector?: string ):HTMLElement {
	const [c, s] = selectorDefaults( containerOrSelector, selector );
	return c.querySelector( s ) as HTMLElement;
}

/**
 * Select list of HTMLElements in current document or container.
 */
export function findAll ( containerOrSelector:ContainerOrSelector, selector?: string ):HTMLElement[] {
	const [c, s] = selectorDefaults( containerOrSelector, selector );
	return Array.from( c.querySelectorAll( s ) )
}

/**
 * Target a parent of a DOM element which have a certain class.
 */
export function getParentWithClass ( target:HTMLElement, className:string ) {
	while ( target != document.body ) {
		if ( !target || !target.parentElement ) break;
		if ( target.classList.contains(className) )
			return target;
		target = target.parentElement;
	}
	return null;
}