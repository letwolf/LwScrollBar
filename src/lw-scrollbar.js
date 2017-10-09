( function( global, factory ) {
    if ( typeof module === 'object' && typeof module.exports === 'object' )
        module.exports = global.document ?
            factory( global, true ) :
                function( w ) {
                    if ( !w.document )
                        throw new Error( 'Requires a window with a document' );
            
                    return factory( w );
                };
        else
            factory( global );
} ( typeof window !== 'undefined' ? window : this, function( window, noGlobal ) {
    
    var SCROLL_ID = 0;
    
    // Events
    
    // Сreate an event to listen for changing the scroll.
    var changeScrollEvent = new createEvent( 'changeScroll' );
    
    
    // Auxiliary methods of the LW library.
    function Lw(){};
    
    var _Storage = {
        requestAnimationFrame: {}
    };

    Lw.prototype = {
        delay: function( draw, duration ) {
            var requestAnim, start = performance.now();
            duration    = Number( duration ) || 0;
            requestAnim = requestAnimationFrame( function animate( time ) {
                var timePassed = time - start;
                
                if ( timePassed < 0 )
                    timePassed = 0;
                
                if ( timePassed > duration )
                    timePassed = duration;
                
                if ( timePassed == duration ) {
                    draw( timePassed );
                } else {
                    _Storage.requestAnimationFrame[ requestAnim ] = requestAnimationFrame( animate );
                }
            } );
            _Storage.requestAnimationFrame[ requestAnim ] = requestAnim;
            
            return requestAnim;
        },
        interval: function( draw, duration ) {
            var requestAnim, start = performance.now();
            duration = Number( duration ) || 0;
            
            requestAnim = requestAnimationFrame( function animate( time ) {
                var timePassed = time - start;
                
                if ( timePassed < 0 )
                    timePassed = 0;
                
                if ( timePassed > duration )
                    timePassed = duration;
                
                if ( timePassed == duration ) {
                    start = performance.now();
                    draw( timePassed );
                }
                
                _Storage.requestAnimationFrame[ requestAnim ] = requestAnimationFrame( animate );
            } );
            _Storage.requestAnimationFrame[ requestAnim ] = requestAnim;
            return requestAnim;
        },
        animate: function( draw, duration ) {
            var requestAnim, start = performance.now();
            duration = Number( duration ) || 0;
            requestAnim = requestAnimationFrame( function animate( time ) {
                var timePassed = time - start;
                
                if ( timePassed < 0 )
                    timePassed = 0;
                
                if ( timePassed > duration && duration > 0 )
                    timePassed = duration;
                
                draw( timePassed );
                
                if ( timePassed < duration || duration == 0 ) {
                    _Storage.requestAnimationFrame[ requestAnim ] = requestAnimationFrame( animate );
                }
            } );
            _Storage.requestAnimationFrame[ requestAnim ] = requestAnim;
            return requestAnim;
        },
        cancelAnimation: function( requestId ) {
            return cancelAnimationFrame( _Storage.requestAnimationFrame[ requestId ] );
        }
    };
    
    var lw = new Lw();
    
    function wrap( node, wrapper ) {
        node.parentNode.insertBefore( wrapper, node );
        node.parentNode.removeChild( node );
        wrapper.appendChild( node );
    }
    
    function unWrap( node ) {
        var parent = node.parentNode;
        while ( node.firstChild ) parent.insertBefore( node.firstChild, node );
        parent.removeChild( node );
    }
    
    function createEvent() {
        try {
            return CustomEvent.apply( this, arguments );
        } catch ( e ) {
            function CustomEvent( event, params ) {
                var evt;
                params = params || {
                    bubbles:    false,
                    cancelable: false,
                    detail:     undefined
                };
                
                evt = document.createEvent( 'CustomEvent' );
                evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                return evt;
            };
            
            return CustomEvent.apply( this, arguments );
        }
    }
    
    function AutoIncrement() {
        SCROLL_ID++;
    }
    
    function wrapScroll( container, scrollID ) {
        var wrapScroll       = document.createElement( 'div' );
        wrapScroll.id        = 'lw-scroll-wrapper-' + scrollID;
        wrapScroll.className = 'lw-scroll-wrapper';
        wrapScroll.innerHTML = '<div class="lw-scroll-overflow"><div class="lw-scroll-tab"></div></div>';
        
        var scrollTab = wrapScroll.firstChild;
        var scroller  = scrollTab.firstChild;
        
        wrap( container, scroller );
        wrap( scroller, scrollTab );
        wrap( scrollTab, wrapScroll );
    }
    
    function createScrollBarVertical( then ) {
        var scrollBar = document.createElement( 'div' );
        
        scrollBar.className = 'lw-scroll-bar lw-scroll-bar-vertical';
        scrollBar.innerHTML = '<div class="lw-scroll-bar-slider lw-scroll-bar-slider-vertical"></div>'
        then.wrapper.appendChild( scrollBar );
        
        then.scrollBarVertical      = then.wrapper.querySelector( '.lw-scroll-bar-vertical' );
        then.scrollBarVerticalSlider = then.wrapper.querySelector( '.lw-scroll-bar-slider-vertical' );
        
        setSizeScrollBarVertical( then );
    }
    
    function setPaddingScrollTab( then ) {
        then.scrollTab.style.paddingRight = 50 - ( then.scroller.offsetWidth - then.scroller.clientWidth ) + 'px';
        then.scrollTab.style.paddingRight = 50 - ( then.scroller.offsetHeight - then.scroller.clientHeight ) + 'px';
    }
    
    function createScrollBarHorizontal( then ) {
        var scrollBar = document.createElement( 'div' );
        
        scrollBar.className = 'lw-scroll-bar lw-scroll-bar-horizontal';
        scrollBar.innerHTML = '<div class="lw-scroll-bar-slider lw-scroll-bar-slider-horizontal"></div>'
        then.wrapper.appendChild( scrollBar );
        
        then.scrollBarHorizontal      = then.wrapper.querySelector( '.lw-scroll-bar-horizontal' );
        then.scrollBarHorizontalSlider = then.wrapper.querySelector( '.lw-scroll-bar-slider-horizontal' );
        
        setSizeScrollBarHorizontal( then );
    }
    
    function setPosScrollBarVertical( then ) {
        setSizeScrollBarVertical( then );
        
        var scrollBarPge = ( then.scroller.scrollTop / ( then.scroller.scrollHeight - then.scroller.clientHeight ) * 100 ) || 0,
            valPos       = ( then.scrollBarVertical.offsetHeight - then.scrollBarVerticalSlider.offsetHeight ) * scrollBarPge / 100;
        
        if ( valPos < 0 )
            valPos = 0;
        else if ( valPos > then.scrollBarVertical.offsetHeight * scrollBarPge / 100 )
            valPos = then.scrollBarVertical.offsetHeight * scrollBarPge / 100;
        
            then.scrollBarVerticalSlider.style.transform = 'translateY(' + valPos + 'px)';
    }
    
    function setPosScrollBarHorizontal( then ) {
        setSizeScrollBarHorizontal( then );
        
        var scrollBarPge = ( then.scroller.scrollLeft / ( then.scroller.scrollWidth - then.scroller.clientWidth ) * 100 ) || 0,
            valPos       = ( ( then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalSlider.offsetWidth ) * scrollBarPge / 100 );

        if ( valPos < 0 )
            valPos = 0;
        else if ( valPos > then.scrollBarHorizontal.offsetWidth * scrollBarPge / 100 )
            valPos = then.scrollBarHorizontal.offsetWidth * scrollBarPge / 100;
        
        then.scrollBarHorizontalSlider.style.transform = 'translateX(' + valPos + 'px)';
    }
    
    function isChangeGetComputedStyle( current, last ) {
         for ( var key in current ) {
             if ( current[ key ] != last[ key ] ) {
                 return true;
             }
             return false;
         }
    }
    
    function changeScroll( then, callback ) {
        var scrollCast = {
            wrapper:                   {},
            scroller:                  {},
            scrollTab:                 {},
            element:                   {},
            scrollBarVertical:         {},
            scrollBarVerticalSlider:   {},
            scrollBarHorizontal:       {},
            scrollBarHorizontalSlider: {},
        },
            clone = function() {
                for ( var key in scrollCast ) {
                    scrollCast[ key ].scrollHeight = then[ key ].scrollHeight;
                    scrollCast[ key ].scrollWidth  = then[ key ].scrollWidth;

                    scrollCast[ key ].offsetHeight = then[ key ].offsetHeight;
                    scrollCast[ key ].offsetWidth  = then[ key ].offsetWidth;

                    scrollCast[ key ].clientHeight = then[ key ].clientHeight;
                    scrollCast[ key ].clientWidth  = then[ key ].clientWidth;

                    scrollCast[ key ].offsetTop    = then[ key ].offsetTop;
                    scrollCast[ key ].offsetLeft   = then[ key ].offsetLeft;

                    scrollCast[ key ].scrollTop    = then[ key ].scrollTop;
                    scrollCast[ key ].scrollLeft   = then[ key ].scrollLeft;
                }
            };

         clone();
        
        return lw.interval( function() {
            var isChange = false;
            
            for ( var key in scrollCast ) {
                if (
                    scrollCast[ key ].scrollHeight != then[ key ].scrollHeight ||
                    scrollCast[ key ].scrollWidth  != then[ key ].scrollWidth  ||
                    
                    scrollCast[ key ].offsetHeight != then[ key ].offsetHeight ||
                    scrollCast[ key ].offsetWidth  != then[ key ].offsetWidth  ||
                    
                    scrollCast[ key ].clientHeight != then[ key ].clientHeight ||
                    scrollCast[ key ].clientWidth  != then[ key ].clientWidth  ||
                    
                    scrollCast[ key ].offsetTop    != then[ key ].offsetTop    ||
                    scrollCast[ key ].offsetLeft   != then[ key ].offsetLeft   ||
                    
                    scrollCast[ key ].scrollTop    != then[ key ].scrollTop    ||
                    scrollCast[ key ].scrollLeft   != then[ key ].scrollLeft
                 ) {
                    if ( key == 'scroller' )
                        then.scroller.dispatchEvent( changeScrollEvent );
                    
                    isChange = true;
                    break;
                }
            }
            
            if ( isChange ) {
                clone();
                isChange = false;
            }
        } );
    }
    
    function remove() {
        var then = this;
        unWrap( then.scrollTab );
        unWrap( then.scroller );
        unWrap( then.wrapper );
        then.scrollBarVertical.remove();
        then.scrollBarHorizontal.remove();
        removeEventChangeScroll.call( then );
    }
    
    function reestablish() {
        createScroll( this );
    }
    
    function setSizeScrollBarVertical( then ) {
        var sliderHeight = then.scrollBarVertical.offsetHeight / 100 * ( then.scroller.clientHeight / then.scroller.scrollHeight * 100 );
        then.scrollBarVerticalSlider.style.height = ( sliderHeight < then.minSizeScrollBar ? then.minSizeScrollBar : sliderHeight  ) + 'px';
        
        then.scrollBarVertical.classList.remove( 'lw-scrollbar-hide', 'lw-scrollbar-show' );
        
        if ( then.overflowY == 'auto' ) {
            if ( then.scroller.scrollHeight == then.scroller.clientHeight ) {
                then.scrollBarVertical.classList.add( 'lw-scrollbar-hide' );
            } else {
                then.scrollBarVertical.classList.add( 'lw-scrollbar-show' );
            }
        } else if ( then.overflowY == 'scroll' ) {
            then.scrollBarVertical.classList.add( 'lw-scrollbar-show' );
        } else {
            then.scrollBarVertical.classList.add( 'lw-scrollbar-hide' );
        }
    }
    
    function setSizeScrollBarHorizontal( then ) {
        var sliderWidth = then.scrollBarHorizontal.offsetWidth / 100 * ( then.scroller.clientWidth / then.scroller.scrollWidth * 100 );
        then.scrollBarHorizontalSlider.style.width = ( sliderWidth < then.minSizeScrollBar ? then.minSizeScrollBar : sliderWidth  ) + 'px';
        then.scrollBarHorizontal.classList.remove( 'lw-scrollbar-show', 'lw-scrollbar-hide' )
        
        if ( then.overflowX == 'auto' ) {
            if ( then.scroller.scrollWidth == then.scroller.clientWidth ) {
                then.scrollBarHorizontal.classList.add( 'lw-scrollbar-hide' );
            } else {
                then.scrollBarHorizontal.classList.add( 'lw-scrollbar-show' );
            }
        } else if ( then.overflowX == 'scroll' ) {
            then.scrollBarHorizontal.classList.add( 'lw-scrollbar-show' );
        } else {
            then.scrollBarHorizontal.classList.add( 'lw-scrollbar-hide' );
        }
    }
        
    function scrollBarVerticalChange( e ) {
        var then   = this.then,
            shiftY = this.shiftY,
            newTop = e.pageY - shiftY - then.scrollBarVertical.getBoundingClientRect().top;

        if ( newTop < 0 )
            newTop = 0;

        var bottomEdge = then.scrollBarVertical.offsetHeight - then.scrollBarVerticalSlider.offsetHeight;

        if ( newTop > bottomEdge )
            newTop = bottomEdge;

        var topPge    = newTop / ( then.scrollBarVertical.offsetHeight - then.scrollBarVerticalSlider.offsetHeight ) * 100,
            posScroll = ( then.scroller.scrollHeight - then.scroller.clientHeight ) / 100 * topPge;
        
        then.scroller.scrollTop = posScroll;
    }
    
    function slideScrollBarVertical( then ) {
        var shiftY, mousemoveHandler;
        
        then.scrollBarVerticalSlider.addEventListener( 'mousedown', function( e ) {
            then.wrapper.classList.add( 'lw-scroll-no-select' );
            then.scrollBarVertical.classList.add( 'lw-scrollbar-active' );
            shiftY           = e.pageY - then.scrollBarVerticalSlider.getBoundingClientRect().top;
            mousemoveHandler = scrollBarVerticalChange.bind( { then: then, shiftY: shiftY } );
            
            document.addEventListener( 'mousemove', mousemoveHandler );
            
            function mouseupHandler( e ) {
                then.wrapper.classList.remove( 'lw-scroll-no-select' );
                then.scrollBarVertical.classList.remove( 'lw-scrollbar-active' );
                document.removeEventListener( 'mousemove', mousemoveHandler );
                document.removeEventListener( 'mouseup', mouseupHandler );
            }
            
            document.addEventListener( 'mouseup', mouseupHandler );
        } );
    }
    
    
        
    function scrollBarHorizontalChange( e ) {
        var then    = this.then,
            shiftX  = this.shiftX,
            newLeft = e.pageX - shiftX - then.scrollBarHorizontal.getBoundingClientRect().left;

        if ( newLeft < 0 )
            newLeft = 0;

        var rightEdge = then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalSlider.offsetWidth;

        if ( newLeft > rightEdge )
            newLeft = rightEdge;

        var leftPge = newLeft / ( then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalSlider.offsetWidth ) * 100,
            posScroll = ( then.scroller.scrollWidth - then.scroller.clientWidth ) / 100 * leftPge;

        then.scroller.scrollLeft = posScroll;
    }
    
    function slideScrollBarHorizontal( then ) {
        var shiftX, handler;
        
        then.scrollBarHorizontalSlider.addEventListener( 'mousedown', function( e ) {
            then.wrapper.classList.add( 'lw-scroll-no-select' );
            then.scrollBarHorizontal.classList.add( 'lw-scrollbar-active' );
            shiftX           = e.pageX - then.scrollBarHorizontalSlider.getBoundingClientRect().left;
            mousemoveHandler = scrollBarHorizontalChange.bind( { then: then, shiftX: shiftX } );
            
            document.addEventListener( 'mousemove', mousemoveHandler );
            
            function mouseupHandler( e ) {
                then.wrapper.classList.remove( 'lw-scroll-no-select' );
                then.scrollBarHorizontal.classList.remove( 'lw-scrollbar-active' );
                document.removeEventListener( 'mousemove', mousemoveHandler );
                document.removeEventListener( 'mouseup', mouseupHandler );
            }
        
            document.addEventListener( 'mouseup', mouseupHandler );
            
        } );
    }
    
    function createAction( then ) {
        slideScrollBarVertical( then );
        slideScrollBarHorizontal( then );
        
        var scrollTop  = then.scroller.scrollTop,
            scrollLeft = then.scroller.scrollLeft;
        
        then.scroller.addEventListener( 'scroll' , function( e ) {
            if ( scrollTop != then.scroller.scrollTop ) {
                scrollTop = then.scroller.scrollTop;
                
                then.wrapper.classList.add( 'lw-scroll-scrolled-y' );
                then.wrapper.classList.remove( 'lw-scroll-scrolled-x' );
            } else if ( scrollLeft != then.scroller.scrollLeft ) {
                scrollLeft = then.scroller.scrollLeft;
                then.wrapper.classList.add( 'lw-scroll-scrolled-x' );
                then.wrapper.classList.remove( 'lw-scroll-scrolled-y' );
            }
        } );
        
        then.scrollBarVertical.addEventListener( 'mousedown', function( e ) {
            var target    = e.target || e.srcElement || e.toElement,
                newTop    = ( e.offsetY || e.layerY ) - then.scrollBarVerticalSlider.offsetHeight / 2,
                topPge    = newTop / ( then.scrollBarVertical.offsetHeight - then.scrollBarVerticalSlider.offsetHeight ) * 100,
                posScroll = ( then.scroller.scrollHeight - then.scroller.clientHeight ) / 100 * topPge;
            
            if ( target == then.scrollBarVerticalSlider )
                return false;
            
            then.scroller.scrollTop = posScroll;
        } );
        
        
        then.scrollBarVertical.addEventListener( 'wheel', function( e ) {
            then.scroller.scrollTop += e.deltaY || -e.wheelDelta;
        } );
        
        then.scrollBarHorizontal.addEventListener( 'wheel', function( e ) {
            then.scroller.scrollLeft += e.deltaX || -e.wheelDelta;
        } );
        
        then.scrollBarHorizontal.addEventListener( 'mousedown', function( e ) {
            var target    = e.target || e.srcElement || e.toElement,
                newLeft   = ( e.offsetX || e.layerX ) - then.scrollBarHorizontalSlider.offsetWidth / 2,
                leftPge   = newLeft / ( then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalSlider.offsetWidth ) * 100,
                posScroll = ( then.scroller.scrollWidth - then.scroller.clientWidth ) / 100 * leftPge;
            
            if ( target == then.scrollBarHorizontalSlider )
                return false;
            
            then.scroller.scrollLeft = posScroll;
        } );
        
        
        changeScroll( then );
        var delayScrolled;
        then.scroller.addEventListener( 'changeScroll', function( e ) {
            if ( delayScrolled )
                lw.cancelAnimation( delayScrolled );
            
            delayScrolled = lw.delay( function() {
                then.wrapper.classList.remove( 'lw-scroll-scrolled-y', 'lw-scroll-scrolled-x' );
            }, 200 );
            
            setPaddingScrollTab( then );
            setPosScrollBarVertical( then );
            setPosScrollBarHorizontal( then );
        }, false );
    }
    
    function createScroll( then ) {
        wrapScroll( then.element, then.scrollID );
        
        var wrapper   = document.getElementById( 'lw-scroll-wrapper-' + then.scrollID ),
            scroller  = wrapper.firstChild,
            scrollTab = scroller.firstChild;
        
        then.element.classList.add( 'lw-scroll-element' );
        
        then.wrapper   = wrapper;
        then.scroller  = scroller;
        then.scrollTab = scrollTab;
        
        setPaddingScrollTab( then );
        
        createScrollBarVertical( then );
        createScrollBarHorizontal( then );
        createAction( then );
    }
    
    function LwScrollBar( element ) {
        AutoIncrement();
        
        this.scrollID = SCROLL_ID;
        this.element  = element;
        
        createScroll( this );
    };
    
    
    LwScrollBar.prototype = {
        scrollID:                  null,        // Scroll ID
        element:                   null,        // The element on which the custom scroll hangs
        scroller:                  null,        // Scrollable element
        scrollTab:                 null,        // Shell over content
        wrapper:                   null,        // Basic wrapper on scroll.
        scrollBarVertical:         null,        // Vertical scroll bar.
        scrollBarVerticalSlider:   null,        // Horizontal scroll bar.
        scrollBarHorizontal:       null,        // Vertical scrollbar slider.
        scrollBarHorizontalSlider: null,        // Horizontal scrollbar slider.
        overflowX:                 'auto',      // Type of horizontal scrollbar. `['auto', 'scroll', 'hidden' ]`
        overflowY:                 'auto',      // Type of vertical scrollbar. `['auto', 'scroll', 'hidden' ]`
        remove:                    remove,      // Removes the implementation of custom scroll
        reestablish:               reestablish, // Reestablishs the implementation of custom scroll
        minSizeScrollBar:          50,          // The minimum size of the scroll bar
    };
    
    window.LwScrollBar = LwScrollBar;
    
} ) );
