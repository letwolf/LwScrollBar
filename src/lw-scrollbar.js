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


    var OPTS = {
        overflowX:                 'auto',      // Type of horizontal scrollbar. `['auto', 'scroll', 'hidden' ]`
        overflowY:                 'auto',      // Type of vertical scrollbar. `['auto', 'scroll', 'hidden' ]`
        minSizeScrollBar:          70          // The minimum size of the scroll bar
    };

    var ChangeScrollIDS = {};
    
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
        wrapScroll.innerHTML = '<div class="lw-scroll-y"><div class="lw-scroll-x"></div></div>';
        
        var scrollY = wrapScroll.firstChild;
        var scrollX = scrollY.firstChild;
        
        wrap( container, scrollX );
        wrap( scrollX, scrollY );
    }
    
    function createScrollBarVertical( then ) {
        var scrollBar = document.createElement( 'div' );
        
        scrollBar.className = 'lw-scrollbar lw-scrollbar-vertical';
        scrollBar.innerHTML = '<div class="lw-scrollbar-slider lw-scrollbar-slider-vertical"></div>'
        then.wrapper.appendChild( scrollBar );
        
        then.scrollBarVertical      = then.wrapper.querySelector( '.lw-scrollbar-vertical' );
        then.scrollBarVerticalSlider = then.wrapper.querySelector( '.lw-scrollbar-slider-vertical' );
        
        setSizeScrollBarVertical( then );
    }
    
    function setFrameSizeScroll( then ) {
        then.scrollY.style.paddingRight  = ( then.scrollX.offsetHeight - then.scrollX.clientHeight || 20 ) + 'px';
        then.scrollY.style.marginBottom  = -( ( then.scrollX.offsetHeight - then.scrollX.clientHeight ) * 2 || 20 ) + 'px';
        then.scrollX.style.paddingBottom = ( then.scrollY.offsetWidth - then.scrollY.clientWidth || 20 ) + 'px';
        then.scrollX.style.marginRight   = -( then.scrollY.offsetWidth - then.scrollY.clientWidth ) + 'px';
    }
    
    function createScrollBarHorizontal( then ) {
        var scrollBar = document.createElement( 'div' );
        
        scrollBar.className = 'lw-scrollbar lw-scrollbar-horizontal';
        scrollBar.innerHTML = '<div class="lw-scrollbar-slider lw-scrollbar-slider-horizontal"></div>'
        then.wrapper.appendChild( scrollBar );
        
        then.scrollBarHorizontal      = then.wrapper.querySelector( '.lw-scrollbar-horizontal' );
        then.scrollBarHorizontalSlider = then.wrapper.querySelector( '.lw-scrollbar-slider-horizontal' );
        
        setSizeScrollBarHorizontal( then );
    }
    
    function setPosScrollBarVertical( then ) {
        setSizeScrollBarVertical( then );
        
        var scrollBarPge = ( then.scrollY.scrollTop / ( then.scrollY.scrollHeight - then.scrollY.clientHeight ) * 100 ) || 0,
            valPos       = ( then.scrollBarVertical.offsetHeight - then.scrollBarVerticalSlider.offsetHeight ) * scrollBarPge / 100;
        
        if ( valPos < 0 )
            valPos = 0;
        else if ( valPos > then.scrollBarVertical.offsetHeight * scrollBarPge / 100 )
            valPos = then.scrollBarVertical.offsetHeight * scrollBarPge / 100;
        
            then.scrollBarVerticalSlider.style.transform = 'translateY(' + valPos + 'px)';
    }
    
    function setPosScrollBarHorizontal( then ) {
        setSizeScrollBarHorizontal( then );
        
        var scrollBarPge = ( then.scrollX.scrollLeft / ( then.scrollX.scrollWidth - then.scrollX.clientWidth ) * 100 ) || 0,
            valPos       = ( ( then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalSlider.offsetWidth ) * scrollBarPge / 100 );

        if ( valPos < 0 )
            valPos = 0;
        else if ( valPos > then.scrollBarHorizontal.offsetWidth * scrollBarPge / 100 )
            valPos = then.scrollBarHorizontal.offsetWidth * scrollBarPge / 100;
        
        then.scrollBarHorizontalSlider.style.transform = 'translateX(' + valPos + 'px)';
    }
    
    function changeScroll( then, callback ) {
        var scrollCast = {
            wrapper:                   {},
            scrollX:                   {},
            scrollY:                   {},
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
                    isChange = true;
                    break;
                }
            }
            
            if ( isChange ) {
                clone();
                then.wrapper.dispatchEvent( changeScrollEvent );
                isChange = false;
            }
        } );
    }
    
    function remove() {
        var then = this;
        unWrap( then.scrollY );
        unWrap( then.scrollX );
        unWrap( then.wrapper );
        then.scrollBarVertical.remove();
        then.scrollBarHorizontal.remove();
        
        ChangeScrollIDS[then.scrollID].forEach( function( changeScrollID ) {
            lw.cancelAnimation( changeScrollID );
        } );
    }
    
    function reestablish() {
        createScroll( this );
    }

    function options( options ) {
        for( var key in options ) {
            this[ key ] = options[ key ];

            if ( key == 'overflowY' || key == 'minSizeScrollBar'  )
                setSizeScrollBarVertical( this );

            if ( key == 'overflowX' || key == 'minSizeScrollBar' )
                setSizeScrollBarHorizontal( this );
        }
    }
    
    function setSizeScrollBarVertical( then ) {
        var sliderHeight = then.scrollBarVertical.offsetHeight / 100 * ( then.scrollY.clientHeight / then.scrollY.scrollHeight * 100 );
        then.scrollBarVerticalSlider.style.height = ( sliderHeight < then.minSizeScrollBar ? then.minSizeScrollBar : sliderHeight  ) + 'px';
        
        then.scrollBarVertical.classList.remove( 'lw-scrollbar-hide', 'lw-scrollbar-show' );
        
        if ( then.overflowY == 'auto' ) {
            if ( then.scrollY.scrollHeight == then.scrollY.clientHeight ) {
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
        var sliderWidth = then.scrollBarHorizontal.offsetWidth / 100 * ( then.scrollX.clientWidth / then.scrollX.scrollWidth * 100 );
        then.scrollBarHorizontalSlider.style.width = ( sliderWidth < then.minSizeScrollBar ? then.minSizeScrollBar : sliderWidth  ) + 'px';
        then.scrollBarHorizontal.classList.remove( 'lw-scrollbar-show', 'lw-scrollbar-hide' );
        
        if ( then.overflowX == 'auto' ) {
            if ( then.scrollX.scrollWidth == then.scrollX.clientWidth ) {
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
            posScroll = ( then.scrollY.scrollHeight - then.scrollY.clientHeight ) / 100 * topPge;
        
        then.scrollY.scrollTop = posScroll;
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
            posScroll = ( then.scrollX.scrollWidth - then.scrollX.clientWidth ) / 100 * leftPge;

        then.scrollX.scrollLeft = posScroll;
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
        
        var scrollTop  = then.scrollY.scrollTop,
            scrollLeft = then.scrollX.scrollLeft;
        
        then.scrollX.addEventListener( 'scroll', function( e ) {
                then.wrapper.classList.add( 'lw-scroll-scrolled-x' );
                then.wrapper.classList.remove( 'lw-scroll-scrolled-y' );
        } );
        then.scrollY.addEventListener( 'scroll', function( e ) {
            then.wrapper.classList.add( 'lw-scroll-scrolled-y' );
            then.wrapper.classList.remove( 'lw-scroll-scrolled-x' );
        } );
        
        then.scrollBarVertical.addEventListener( 'mousedown', function( e ) {
            var target    = e.target || e.srcElement || e.toElement,
                newTop    = ( e.offsetY || e.layerY ) - then.scrollBarVerticalSlider.offsetHeight / 2,
                topPge    = newTop / ( then.scrollBarVertical.offsetHeight - then.scrollBarVerticalSlider.offsetHeight ) * 100,
                posScroll = ( then.scrollY.scrollHeight - then.scrollY.clientHeight ) / 100 * topPge;
            
            if ( target == then.scrollBarVerticalSlider )
                return false;
            
            then.scrollY.scrollTop = posScroll;
        } );
        
        
        then.scrollBarVertical.addEventListener( 'wheel', function( e ) {
            then.scrollY.scrollTop += e.deltaY || -e.wheelDelta;
            
            if ( then.scrollY.scrollTop > 0 && then.scrollY.scrollTop < then.scrollY.scrollHeight - then.scrollY.offsetHeight )
                e.preventDefault();
        } );
        
        then.scrollBarHorizontal.addEventListener( 'wheel', function( e ) {
            then.scrollX.scrollLeft += e.deltaX || -e.wheelDelta;
            
            if ( then.scrollX.scrollLeft > 0 && then.scrollX.scrollLeft < then.scrollX.scrollWidth - then.scrollX.offsetWidth )
                e.preventDefault();
        } );
        
        then.scrollBarHorizontal.addEventListener( 'mousedown', function( e ) {
            var target    = e.target || e.srcElement || e.toElement,
                newLeft   = ( e.offsetX || e.layerX ) - then.scrollBarHorizontalSlider.offsetWidth / 2,
                leftPge   = newLeft / ( then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalSlider.offsetWidth ) * 100,
                posScroll = ( then.scrollX.scrollWidth - then.scrollX.clientWidth ) / 100 * leftPge;
            
            if ( target == then.scrollBarHorizontalSlider )
                return false;
            
            then.scrollX.scrollLeft = posScroll;
        } );
        
        
        var changeScrollID = changeScroll( then );
        ChangeScrollIDS[ then.scrollID ] = ChangeScrollIDS[then.scrollID] ?
                                            ChangeScrollIDS[then.scrollID].push( changeScrollID ) :
                                                ChangeScrollIDS[then.scrollID] = [ changeScrollID ];
        var delayScrolled;
        
        then.wrapper.addEventListener( 'changeScroll', function( e ) {
            if ( delayScrolled )
                lw.cancelAnimation( delayScrolled );
            
            delayScrolled = lw.delay( function() {
                then.wrapper.classList.remove( 'lw-scroll-scrolled-y', 'lw-scroll-scrolled-x' );
            }, 200 );
            
            setFrameSizeScroll( then );
            setPosScrollBarVertical( then );
            setPosScrollBarHorizontal( then );
        }, false );
    }
    
    function createScroll( then ) {
        wrapScroll( then.element, then.scrollID );
        
        var wrapper = then.element.parentNode.parentNode.parentNode,
            scrollY = then.element.parentNode.parentNode,
            scrollX = then.element.parentNode;
        
        then.wrapper = wrapper;
        then.scrollY = scrollY;
        then.scrollX = scrollX;
        
        then.wrapper.classList.add( 'lw-scroll-wrapper' );
        
        setFrameSizeScroll( then );
        
        createScrollBarVertical( then );
        createScrollBarHorizontal( then );
        createAction( then );
    }
    
    function LwScrollBar( element ) {
        AutoIncrement();

        for ( var key in OPTS )
            this[ key ] = OPTS[ key ];
        
        this.scrollID = SCROLL_ID;
        this.element  = element;
        
        createScroll( this );
    };
    
    
    LwScrollBar.prototype = {
        scrollID:                  null,        // Scroll ID
        element:                   null,        // The element on which the custom scroll hangs
        scrollX:                   null,        // Scrollable element
        scrollY:                   null,        // Shell over content
        wrapper:                   null,        // Basic wrapper on scroll.
        scrollBarVertical:         null,        // Vertical scroll bar.
        scrollBarVerticalSlider:   null,        // Horizontal scroll bar.
        scrollBarHorizontal:       null,        // Vertical scrollbar slider.
        scrollBarHorizontalSlider: null,        // Horizontal scrollbar slider.
        remove:                    remove,      // Removes the implementation of custom scroll
        reestablish:               reestablish, // Reestablishs the implementation of custom scroll
        options:                   options
    };
    
    
    window.LwScrollBar = LwScrollBar;
    
} ) );
