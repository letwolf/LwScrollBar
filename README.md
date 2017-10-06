# LwScrollBar

Custom scroll on native javascript

## What is the purpose of LwScrollBar?

LwScrollBar does not emulate user scrolling, but only hides the native scroll bars.
LwScrollBar is a cross-browser solution most suitable for you.

## Table of Contents

* [How to use](#how-to-use)
* [Examples code](#examples-code)
* [Options](#options)
* [IE Support](#ie-support)
* [License](#license)

## How to use

Add to html code:
```html
<!DOCTYPE html>
<head>
    <title>Lw Scroll</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="src/css/lw-scrollbar.css">
    <script type="text/javascript" src="src/js/lw-scrollbar.js">
</head>
<body>
<div id="wrap-content" class="wrap-content">
    <article id="container" class="container">
        <!--Replace me with the content that will be scrolled-->
    </div>
</div>
```

Then add javascript:
```html
<script type="text/jscript">
    document.addEventListener( 'DOMContentLoaded', function() {
        var scroll = new LwScrollBar( document.getElementById( 'container' ) );
    } );
</script>
</body>
</html>
```

## Examples code

```html
<div id="wrap-content" class="wrap-content">
    <article id="container" class="container">
        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
        <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
        The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>
    </div>
</div>
```

```css
.wrap-content {
    background: #cbcbcb;
    width: 300px;
    height: 300px;
    overflow: hidden;
}
```

```js
document.addEventListener( 'DOMContentLoaded', function() {
    var scroll = new LwScrollBar( document.getElementById( 'container' ) );
    
    scroll.addEventChangeScroll( function() {
        console.log( 'change scroll!' );
    } );
} );
```

## Options

### `scrollID {Number}`

Scroll ID.

**Default**: `null`

### `element {HTML Object}`

The element on which the custom scroll hangs.

**Default**: `null`

### `scroller {HTML Object}`

Scrollable element.

**Default**: `null`

### `scrollTab {HTML Object}`

Shell over content.

**Default**: `null`

### `wrapper {HTML Object}`

Basic wrapper on scroll.

**Default**: `null`

### `scrollBarVertical {HTML Object}`

Vertical scroll bar.

**Default**: `null`

### `scrollBarHorizontal {HTML Object}`

Horizontal scrollbar.

**Default**: `null`

### `scrollBarVerticalThumb {HTML Object}`

Vertical scrollbar slider.

**Default**: `null`

### `scrollBarHorizontalThumb {HTML Object}`

Horizontal scrollbar slider.

**Default**: `null`

### `overflowX {string}`

Type of horizontal scrollbar. `['auto', 'scroll', 'hidden' ]`

**Default**: `auto`

### `overflowY {string}`

Type of vertical scrollbar. `['auto', 'scroll', 'hidden' ]`

**Default**: `auto`

### `addEventChangeScroll {function}`

Adds an event to a scroll change.

**Argument**: `callback`

### `removeEventChangeScroll {function}`

Removes event added addEventChangeScroll.

**Argument**: `eventChangeID`

### `remove {function}`

Removes the implementation of custom scroll.

### `reestablish {function}`

Reestablishs the implementation of custom scroll.

**Argument**: `scrollID`

### `minSizeScrollBar {number}`

The minimum size of the scroll bar.

**Default**: `50`

## License

[GNU General Public License v3.0](LICENSE)

## IE Support

LwScrollBar works with IE 9+
