# Yadl

Yet Another DOM Library

### onReady / onLoad


```typescript
// Listen when DOM is ready
onReady(() => {
    console.log('DOM is ready')
})

// Listen when body is loaded
onLoad(document.body, () => {
    console.log('Body and its assets are loaded')
})

// Listen when an image is loaded
onLoad(imageElement, () => {
    console.log(imageElement, 'has loaded')
})
```


### Find / FindAll

- `find` will get one element from the document or a container.
- `findAll` will target several elements from the document or a container.
- `findAll` is an array, not a dom iterator.

```typescript
import { find, findAll } from "@zouloux/yadl"

// Select all divs which have "Special" class from document
const allSpecialDivs:HTMLElement[] = findAll('div.Special')

// Find the only element which have the id "Test"
const testElement:HTMLElement = find('#Test')

// Select all divs from element test
const allDivs:HTMLElement[] = findAll(testElement, 'div')

// allDivs is a regular array
allDivs.map( (div, i) => {
    // Do something with selected div
})
```

```typescript
import { $, $$ } from "@zouloux/yadl"
// Alias for find
const oneDiv:HTMLElement = $('div#id') 
// Alias for findAll
const severalDivs:HTMLElement[] = $$('div.Special')
```

### Get parent with class

`getParentWithClass` can help to select a parent of a DOM element with a specific class.

```html
<div class="App">
    <!-- POPUP -->
    <div class="Popup_container">
        <div class="Popup_inner">
            <button onClick="popupCloseClicked()">Close</button>
        </div>
    </div>
</div>
```
```typescript
import { popupCloseClicked } from "@zouloux/yadl"
// Close popup when close button is clicked
function popupCloseClicked ( event:Event ) {
    const popupContainer = getParentWithClass( event.currentTarget, 'Popup_container' )
    popupContainer.remove();
}
```


### Listen events with `on` / `once`

```typescript
import { on, once } from "@zouloux/yadl"

// Listen an event on a target
on(document, 'click', e => {
    console.log("Document has been clicked")
})

// Listen several events on a target from a selector
on("#Element", ['mouseenter', 'mouseleave'], e => {
    console.log("#Element mouse event", e.type)
})

// Listen an event only once (removed after first dispatch)
once(target, "click", e => {
    console.log("Called once")
})

// Remove several attached listeners
const listeners = on(target, ["eventA", "someevent"], event => {
    // Will remove event listeners if something is true
    if ( something )
        listeners();
})

// Listener options
on(target, 'scroll', scrollhandler, {
    // addEventListener options can be added here
    passive: true
})
```

### Create elements with `element`


```typescript
import { element, setAttributes } from "@zouloux/yadl"

// Create a new div element
const div1:HTMLDivElement = element('div')

// Create a new div element with attributes
const div2:HTMLDivElement = element('div', {
    'class': 'Class1 Class2',
    id: 'DivID',
    disabled: true,
})

// Create a new div element with style
const div3:HTMLDivElement = element('div', {}, {
    border: '1px solid red',
    width: '50%',
})

// Bonus, set attributes to an element
setAttributes(div2, {
	id: 'MyID', 	// override attribute
	'class': null, 	// remove attribute
	role: 'status'	// add attribute
})
```

### Get and set style on elements with `getStyle` / `setStyle`

#### TODO DOC

### More with `getStyle` and `convertREMToPixels`

#### TODO DOC

### parseValue / setAttributes

#### TODO DOC

### SVG `svgColor` / `svgPosition

#### TODO DOC
