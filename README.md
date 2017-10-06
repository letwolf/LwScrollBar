# lw-scroll

Custom scroll on native javascript

## What is the purpose of lw-scroll?

lw-scroll does not emulate user scrolling, but only hides the native scroll bars.
lw-scroll is a cross-browser solution most suitable for you.

## Table of Contents

* [How to use](#how-to-use)
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
    <link rel="stylesheet" href="src/css/lw-scroll.css">
    <script type="text/javascript" src="src/js/lw-scroll.js">
</head>
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
        var scrollOne = new LwScrollBar( document.getElementById( 'container' ) );
    } );
</script>
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

### `overflowX {HTML Object}`

Type of horizontal scrollbar. `['auto', 'scroll', 'hidden' ]`

**Default**: `auto`

### `overflowY {HTML Object}`

Type of vertical scrollbar. `['auto', 'scroll', 'hidden' ]`

**Default**: `auto`

## License

[GNU General Public License v3.0](LICENSE)

## IE Support

lw-scroll works with IE 9+
