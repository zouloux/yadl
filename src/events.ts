import { $$ } from "./find";

// TODO : Ecoute d'event à la JQuery, avec un selecteur
//  	document.body, 'a' -> Ecouter tous les a, même créés après l'écoute

// ----------------------------------------------------------------------------- TYPES

// All accepted types for event as strings.
// Can add others from lib.dom.d.ts
// FIXME : https://github.com/microsoft/TypeScript/issues/33047
type AllEventMaps = (WindowEventMap & HTMLElementEventMap & DocumentEventMap);
type SingleEventName = (keyof AllEventMaps)|string
// Single or multi-types
type SingleOrMultiEventName = SingleEventName | SingleEventName[];

// TODO : if possible, real event type
export type EventHandler = (event:Event, ...rest) => any|void

// ----------------------------------------------------------------------------- WIRING

// Wire one or several events to several elements
export function connectElements ( connect:boolean, elements:EventTarget[], events:SingleOrMultiEventName, handler:EventHandler, options?:AddEventListenerOptions ) {
	function wire ( eventName:SingleEventName, element:EventTarget ) {
		connect
		? element.addEventListener( eventName, handler, options )
		: element.removeEventListener( eventName, handler, options )
	}
	elements.map( element => (
		Array.isArray( events )
		? events.map( event => wire(event, element) )
		: wire( events, element )
	))
}

// ----------------------------------------------------------------------------- DEFAULTS

// Default for element or selector argument
function defaultElements ( elementOrSelector:EventTarget|EventTarget[]|string ):EventTarget[] {
	if ( typeof elementOrSelector === 'string' )
		elementOrSelector =  $$( elementOrSelector )
	else if ( !Array.isArray( elementOrSelector ) )
		elementOrSelector = [ elementOrSelector ]
	// Check if element is not null
	if ( process.env.NODE_ENV !== 'production' && elementOrSelector.length == 0 )
		throw new Error(`Yadl.on{ce} // Elements are empty`)
	return elementOrSelector
}

// ----------------------------------------------------------------------------- ON

/**
 * Listen one or several Events on one or several DOM Elements
 * @param elementOrSelector Can be one DOM Element, an array of DOM Elements, or a query selector as string.
 * @param events Can be one event, or an array of events.
 * @param handler The handler called when a listened event triggers. Have to be correctly scoped.
 * @param options addEventListener options.
 */
export function on (
	elementOrSelector	:EventTarget|EventTarget[]|string,
	events				:SingleOrMultiEventName,
	handler				:EventHandler,
	options				?:AddEventListenerOptions
):() => void {
	// Get default from arguments
	const elements = defaultElements( elementOrSelector );
	// Wire all events on this element
	connectElements( true, elements, events, handler, options );
	// Returns a function which kills all events listeners if called
	return () => connectElements( false, elements, events, handler, options );
}


export function once (
	elementOrSelector	:EventTarget|EventTarget[]|string,
	events				:SingleOrMultiEventName,
	handler				:EventHandler,
	options				?:AddEventListenerOptions
):() => void {
	// Get default from arguments
	const elements = defaultElements( elementOrSelector );

	const removeAll = () => connectElements( false, elements, events, handlerProxy, options );
	function handlerProxy (...rest) {
		removeAll();
		handler.apply(null, rest)
	}
	// Wire all events on this element
	connectElements( true, elements, events, handlerProxy, options );
	// Returns a function which kills all events listeners if called
	return removeAll;
}