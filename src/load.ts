import { once } from "./events";

/**
 * DOM is parsed ready (not loaded)
 */
export async function onReady () {
	return new Promise<Event|void>( resolve => {
		document.readyState == 'loading'
		? once( document, 'DOMContentLoaded', resolve )
		: resolve()
	});
}

/**
 * Wait to an element to load.
 * By default, will wait all dom to be loaded (is equivalent to body.onLoad).
 * Can wait for images to load.
 */
export async function onLoad ( element:HTMLElement = document.body ) {
	return new Promise<void>( (resolve, reject) => {
		// Check if element has already loaded
		if ( 'complete' in element && element['complete'] )
			return resolve();
		// Otherwise, listen for load and error events once
		once(element, ['load', 'error'], event => {
			event.type === 'load' ? resolve() : reject();
		});
	});
}
