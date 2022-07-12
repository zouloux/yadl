import { $, $$ } from "./find";
import { EventHandler, on } from "./events";

interface IClassComponent <G, P>
{
	new ( base:HTMLElement, props?:P ):G
}

// Type of props for multi-ref.
type TMultiProp <P> = P | P[] | ( (i:number, element:HTMLElement) => P );

// List of events to map. Events as key, handler as value.
type TEventsMap = { [event:string] : EventHandler };

/**
 * Will use Function.name and Class.constructor.name to retrieve component name.
 * If it works only in dev, and not in production, make sure your compiler does not
 * remove function names to save some bytes.
 * On most compilers, add this .uglifyrc :
 * {
 *   "keep_fnames": true,
 *   "keep_classnames": true
 * }
 * @param component Component to retrieve name from
 * @param before Added before component name
 * @param after Added after component name
 */
function getComponentClass ( component:any, before = '', after = '' )
{
	// Get component name from Function.name
	if ( typeof component.name === 'string' && component.name !== 'Function' )
		return before + component.name + after

	// Get component name from Class.constructor.name
	else if (
		component.constructor
		&& typeof component.constructor.name === 'string'
		&& component.constructor.name !== 'function'
	)
		return before + component.constructor.name + after

	// Unknown component
	else return before + 'Component' + after
}

// Default values for selector and props
// Component is for selectors starting with "_"
function defaultRef <P> ( component:_DomComponent, selector, props? ):[string, P]
{
	// Invert if we have props in place of selector and nothing on props
	if ( typeof selector != 'string' && !props ) {
		props = selector;
		selector = null;
	}

	// Selector is starting with an underscore
	// Add hosting component class name for targeting
	if ( selector && selector.indexOf('_') === 0 )
		selector = getComponentClass(component, '.', selector);

	// Return correct selector and props
	return [ selector, props ];
}


export class _DomComponent<P = any, B extends HTMLElement = HTMLElement>
{
	/**
	 * Component properties, given from parent Component
	 */
	public props			:P;

	/**
	 * Associated HTMLElement root
	 */
	public base				:B;

	constructor ( base:B = null, props?:P )
	{
		this.base = base ?? $( getComponentClass(this, '.') ) as B;
		this.props = props;

		// Wait end of frame to init, so selector properties are ready
		window.setTimeout(() => this.init(), 0);
	}

	/**
	 * Called when component and selectors are ready.
	 * To override in Component.
	 */
	protected init () { }

	// ------------------------------------------------------------------------- FIND COMPONENT CHILDREN DOM

	/**
	 * Find a child HTMLElement of this component.
	 * Selector can start with "_" to prepend current Component name.
	 * Ex : "_element" will target "ComponentName_element"
	 * @param selector Selector to find child HTMLElement. Can start with "_" to prepend current Component name.
	 * @param events TODO DOC
	 */
	find <H extends HTMLElement> ( selector:string, events ?: TEventsMap ):H {
		const $element = $( this.base, defaultRef<any>( this, selector )[ 0 ] ) as H;
		events && this.addEventsToElement( $element, events );
		return $element;
	}

	/**
	 * Find children HTMLElement of this component.
	 * Selector can start with "_" to prepend current Component name.
	 * Ex : "_elements" will target "ComponentName_elements"
	 * @param selector Selector to find children HTMLElement. Can start with "_" to prepend current Component name.
	 * @param events TODO DOC
	 */
	multiFind <H extends HTMLElement> ( selector:string, events ?: TEventsMap ):H[] {
		const $elements = $$( this.base, defaultRef<any>( this, selector )[ 0 ] ) as H[];
		events && $elements.map( $element => this.addEventsToElement( $element, events ) );
		return $elements;
	}

	// ------------------------------------------------------------------------- REF CHILDREN COMPONENTS

	/**
	 * Instantiate and target a child Component.
	 * Selector can start with "_" to prepend current Component name.
	 * Ex : "_element" will target "ComponentName_element"
	 * Selector can be ignored, child Component class name will be used to find it.
	 * Will throw an error if component is not found.
	 * @throws Error if component is not found.
	 * @param ComponentClass Class of child component.
	 * @param selectorOrProps Selector to target component. Can be squashed with props.
	 * @param props Props to give to this component.
	 */
	ref <G extends _DomComponent, P> ( ComponentClass:IClassComponent<G, P>, selectorOrProps?:string|P, props?:P ):G
	{
		const [s, p] = defaultRef<P>( this, selectorOrProps, props );
		const selector = s || getComponentClass(ComponentClass, '.');
		const $element = $( this.base, selector);
		if (!$element) throw new Error(`DomComponent.ref // Component with selector '${selector}' not found in ${getComponentClass(this)}.`);
		return new ComponentClass( $element, p );
	}

	/**
	 * Instantiate and target a child Component.
	 * Selector can start with "_" to prepend current Component name.
	 * Ex : "_element" will target "ComponentName_element"
	 * Selector can be ignored, child Component class name will be used to find it.
	 * Returns null if instance not found, will never throw.
	 * @param ComponentClass Class of child component.
	 * @param selectorOrProps Selector to target component. Can be squashed with props.
	 * @param props Props to give to this component.
	 */
	lazyRef <G extends _DomComponent, P> ( ComponentClass:IClassComponent<G, P>, selectorOrProps?:string|P, props?:P ):G
	{
		const [s, p] = defaultRef<P>( this, selectorOrProps, props );
		const selector = s || getComponentClass(ComponentClass, '.');
		const $element = $( this.base, selector);
		if (!$element) return null;
		return new ComponentClass( $element, p );
	}

	/**
	 * Instantiate and target children Components.
	 * Selector can start with "_" to prepend current Component name.
	 * Ex : "_elements" will target "ComponentName_elements"
	 * Selector can be ignored, children Components class name will be used to find them.
	 * @param ComponentClass Class of children component.
	 * @param selectorOrProps Selector to target components. Can be squashed with props.
	 * @param props Props to give to those components. Can be a function, executed for each created component.
	 */
	multiRef <G extends _DomComponent, P> ( ComponentClass:IClassComponent<G, P>, selectorOrProps?:string|TMultiProp<P>, props?:TMultiProp<P> ):G[]
	{
		const [s, p] = defaultRef<TMultiProp<P>>( this, selectorOrProps, props );
		const refs = [];
		$$( this.base, s || getComponentClass(ComponentClass, '.') ).map( (el, i) =>
			refs.push( new ComponentClass( el, {
				// Always inject index in child component props
				index: i,
				...(
					// Props as an array, dispatch each props for each component
					( Array.isArray(p) && i in p ) ? p[i]
					// Props as an object, same props for all components
					: ( typeof p === 'object' ? p
					// Props as a function, execute for each and apply returned props
					: ( typeof p === 'function' ? (p as Function)(i, el) : null) )
				)}
			))
		);
		return refs;
	}

	// ------------------------------------------------------------------------- EVENTS

	/**
	 * List of all bind events destroy handlers.
	 * All of those events destroy handlers will be executed at component dispose.
	 */
	protected _events:Function[] = [];

	/**
	 * Attach an event listener to an element of this component.
	 * Attached event will be detached at component dispose.
	 * @param $element Element to attach event on
	 * @param events TODO DOC
	 * @protected
	 */
	protected addEventsToElement ( $element:HTMLElement, events:TEventsMap )
	{
		Object.keys( events ) .map( eventKey =>
			this._events.push( on( $element, eventKey.split(' ') as any, events[eventKey].bind( this ) ) )
		)
	}

	// ------------------------------------------------------------------------- DISPOSE

	/**
	 * Destroy component
	 */
	dispose ()
	{
		// Clear all bind events
		this._events.map( event => event() );
		delete this._events;
	}
}

