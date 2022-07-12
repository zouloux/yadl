import { on } from "./events";

/**
 * DOM is parsed ready (not loaded)
 */
export async function domReady () {
	return new Promise<Event|void>( resolve => {
		if ( document.readyState !== 'loading' )
			resolve();
		else
			document.addEventListener('DOMContentLoaded', resolve);
	});
}

/**
 * Wait to an element to load.
 * By default, will wait all dom to be loaded (is equivalent to body.onLoad).
 * Can wait for images to load.
 */
export async function onLoad ( element:HTMLElement = document.body ) {
	return new Promise<void>( (resolve, reject) => {
		if ( 'complete' in element && element['complete'] )
			return resolve();
		on(element, ['load', 'error'], event => {
			event.type === 'load' ? resolve() : reject();
		});
	});
}
