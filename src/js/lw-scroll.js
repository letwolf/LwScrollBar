( function( global, factory ) {
    if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        module.exports = global.document ?
            factory( global, true ) :
                function( w ) {
                    if ( !w.document ) {
                        throw new Error( 'Requires a window with a document' );
                    }
            return factory( w );
                };
        } else {
            factory( global );
        }
} ( typeof window !== 'undefined' ? window : this, function( window, noGlobal ) {
    
    var SCROLL_ID = 0;
    
    var CHANGE_SCROLL_IDS = {};
    
    
    // Auxiliary methods of the LW library.
    function Lw(){};
    
    var _Storage = {
        requestAnimationFrame: {}
    };

    Lw.prototype = {
        delay: function( draw, duration ) {
            var requestAnim,
                than = this, start = performance.now();
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
            var requestAnim,
                than = this, start = performance.now();
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
            var requestAnim,
                than = this, start = performance.now();
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
        scrollBar.innerHTML = '<div class="lw-scroll-bar-thumb lw-scroll-bar-thumb-vertical"></div>'
        then.wrapper.appendChild( scrollBar );
        
        then.scrollBarVertical      = then.wrapper.querySelector( '.lw-scroll-bar-vertical' );
        then.scrollBarVerticalThumb = then.wrapper.querySelector( '.lw-scroll-bar-thumb-vertical' );
        
        setSizeScrollBarVertical( then );
    }
    
    function createScrollBarHorizontal( then ) {
        var scrollBar = document.createElement( 'div' );
        
        scrollBar.className = 'lw-scroll-bar lw-scroll-bar-horizontal';
        scrollBar.innerHTML = '<div class="lw-scroll-bar-thumb lw-scroll-bar-thumb-horizontal"></div>'
        then.wrapper.appendChild( scrollBar );
        
        then.scrollBarHorizontal      = then.wrapper.querySelector( '.lw-scroll-bar-horizontal' );
        then.scrollBarHorizontalThumb = then.wrapper.querySelector( '.lw-scroll-bar-thumb-horizontal' );
        
        setSizeScrollBarHorizontal( then );
    }
    
    function setPosScrollBarVertical( then ) {
        setSizeScrollBarVertical( then );
        
        var scrollBarPge = ( then.scroller.scrollTop / ( then.scroller.scrollHeight - then.scroller.clientHeight ) * 100 ) || 0,
            valPos       = ( then.wrapper.offsetHeight - then.scrollBarVerticalThumb.offsetHeight ) * scrollBarPge / 100;
        
        if ( valPos < 0 )
            valPos = 0;
        else if ( valPos > then.wrapper.offsetHeight * scrollBarPge / 100 )
            valPos = then.wrapper.offsetHeight * scrollBarPge / 100;
        
            then.scrollBarVerticalThumb.style.transform = 'translateY(' + valPos + 'px)';
    }
    
    function setPosScrollBarHorizontal( then ) {
        setSizeScrollBarHorizontal( then );
        
        var scrollBarPge = ( then.scroller.scrollLeft / ( then.scroller.scrollWidth - then.scroller.clientWidth ) * 100 ) || 0,
            valPos       = ( ( then.wrapper.offsetWidth - then.scrollBarHorizontalThumb.offsetWidth ) * scrollBarPge / 100 );

        if ( valPos < 0 )
            valPos = 0;
        else if ( valPos > then.wrapper.offsetWidth * scrollBarPge / 100 )
            valPos = then.wrapper.offsetWidth * scrollBarPge / 100;
        
        then.scrollBarHorizontalThumb.style.transform = 'translateX(' + valPos + 'px)';
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
            wrapper:                  {},
            scroller:                 {},
            element:                  {},
            scrollBarVertical:        {},
            scrollBarVerticalThumb:   {},
            scrollBarHorizontal:      {},
            scrollBarHorizontalThumb: {},
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

                    scrollCast[ key ].getComputedStyleCssText = getComputedStyle( then[ key ] ).cssText;
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
                 callback();
                 isChange = false;
             }
         } );
    }
    
    function addEventChangeScroll( callback ) {
        var eventChangeID = changeScroll( this, callback.bind( this ) );
        
        if ( !CHANGE_SCROLL_IDS.length )
            CHANGE_SCROLL_IDS[ this.scrollID ] = [];
        
        if ( CHANGE_SCROLL_IDS[ this.scrollID ].length == 0 )
            CHANGE_SCROLL_IDS[ this.scrollID ] = [ eventChangeID ];
        else
            CHANGE_SCROLL_IDS[ this.scrollID ].push( eventChangeID );
        
        return eventChangeID;
    }
    
    function removeEventChangeScroll( eventChangeID ) {
        if ( eventChangeID ) {
            lw.cancelAnimation( eventChangeID );
            return
        }
        
        for ( var id in CHANGE_SCROLL_IDS[ this.scrollID ] )
            lw.cancelAnimation( CHANGE_SCROLL_IDS[ this.scrollID ][ id ] );
    }
    
    function removeScroll() {
        var then = this;
        unWrap( then.scrollTab );
        unWrap( then.scroller );
        unWrap( then.wrapper );
        then.scrollBarVertical.remove();
        then.scrollBarHorizontal.remove();
        removeEventChangeScroll.call( then );
    }
    
    function reestablishScroll() {
        createScroll( this );
    }
    
    function setSizeScrollBarVertical( then ) {
        var thumbHeight = then.wrapper.offsetHeight / 100 * ( then.scroller.clientHeight / then.scroller.scrollHeight * 100 );
        then.scrollBarVerticalThumb.style.height = ( thumbHeight < then.minSizeScrollBar ? then.minSizeScrollBar : thumbHeight  ) + 'px';
        
        then.scrollBarVertical.classList.remove( 'lw-scrollbar-show', 'lw-scrollbar-hide' );
        
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
        var thumbWidth = then.wrapper.offsetWidth / 100 * ( then.scroller.clientWidth / then.scroller.scrollWidth * 100 );
        then.scrollBarHorizontalThumb.style.width = ( thumbWidth < then.minSizeScrollBar ? then.minSizeScrollBar : thumbWidth  ) + 'px';
        
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
            shiftY = this.shiftY;
        
        var newTop = e.pageY - shiftY - then.scrollBarVertical.getBoundingClientRect().top;

        if ( newTop < 0 )
            newTop = 0;

        var bottomEdge = then.scrollBarVertical.offsetHeight - then.scrollBarVerticalThumb.offsetHeight;

        if ( newTop > bottomEdge )
            newTop = bottomEdge;

        var topPge = newTop / ( then.scrollBarVertical.offsetHeight - then.scrollBarVerticalThumb.offsetHeight ) * 100,
            posScroll = ( then.scroller.scrollHeight - then.scroller.clientHeight ) / 100 * topPge;
        
        then.scroller.scrollTop = posScroll;
    }
    
    function slideScrollBarVertical( then ) {
        var shiftY, mousemoveHandler;
        
        then.scrollBarVerticalThumb.addEventListener( 'mousedown', function( e ) {
            then.wrapper.classList.add( 'lw-scroll-no-select' );
            then.scrollBarVertical.classList.add( 'lw-scrollbar-active' );
            then.scrollBarVerticalActive = true;
            shiftY  = e.pageY - then.scrollBarVerticalThumb.getBoundingClientRect().top;
            
            mousemoveHandler = scrollBarVerticalChange.bind( { then: then, shiftY: shiftY } );
            
            document.addEventListener( 'mousemove', mousemoveHandler );
            
            
            function mouseupHandler( e ) {
                then.scrollBarVerticalActive = false;
                then.wrapper.classList.remove( 'lw-scroll-no-select' );
                then.scrollBarVertical.classList.remove( 'lw-scrollbar-active' );
                document.removeEventListener( 'mousemove', mousemoveHandler );
                document.removeEventListener( 'mouseup', mouseupHandler );
            }
            
            document.addEventListener( 'mouseup', mouseupHandler );
        } );
    }
    
    
        
    function scrollBarHorizontalChange( e ) {
        var then   = this.then,
            shiftX = this.shiftX;
        
        var newLeft = e.pageX - shiftX - then.scrollBarHorizontal.getBoundingClientRect().left;

        if ( newLeft < 0 )
            newLeft = 0;

        var rightEdge = then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalThumb.offsetWidth;

        if ( newLeft > rightEdge )
            newLeft = rightEdge;

        var leftPge = newLeft / ( then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalThumb.offsetWidth ) * 100,
            posScroll = ( then.scroller.scrollWidth - then.scroller.clientWidth ) / 100 * leftPge;

        then.scroller.scrollLeft = posScroll;
    }
    
    function slideScrollBarHorizontal( then ) {
        var shiftX, handler;
        
        then.scrollBarHorizontalThumb.addEventListener( 'mousedown', function( e ) {
            then.wrapper.classList.add( 'lw-scroll-no-select' );
            then.scrollBarHorizontal.classList.add( 'lw-scrollbar-active' );
            then.scrollBarHorizontalActive = true;
            shiftX = e.pageX - then.scrollBarHorizontalThumb.getBoundingClientRect().left;
            
            mousemoveHandler = scrollBarHorizontalChange.bind( { then: then, shiftX: shiftX } );
            
            document.addEventListener( 'mousemove', mousemoveHandler );
            
            function mouseupHandler( e ) {
                then.scrollBarHorizontalActive = false;
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
                newTop    = ( e.offsetY || e.layerY ) - then.scrollBarVerticalThumb.offsetHeight / 2,
                topPge    = newTop / ( then.scrollBarVertical.offsetHeight - then.scrollBarVerticalThumb.offsetHeight ) * 100,
                posScroll = ( then.scroller.scrollHeight - then.scroller.clientHeight ) / 100 * topPge;
            
            if ( target == then.scrollBarVerticalThumb )
                return false;
            
            then.scroller.scrollTop = posScroll;
        } );
        
        then.scrollBarHorizontal.addEventListener( 'mousedown', function( e ) {
            var target    = e.target || e.srcElement || e.toElement,
                newLeft   = ( e.offsetX || e.layerX ) - then.scrollBarHorizontalThumb.offsetWidth / 2,
                leftPge   = newLeft / ( then.scrollBarHorizontal.offsetWidth - then.scrollBarHorizontalThumb.offsetWidth ) * 100,
                posScroll = ( then.scroller.scrollWidth - then.scroller.clientWidth ) / 100 * leftPge;
            
            if ( target == then.scrollBarHorizontalThumb )
                return false;
            
            then.scroller.scrollLeft = posScroll;
        } );
        
        var delayScrolled;
        addEventChangeScroll.call( then, function() {
            if ( delayScrolled ) {
                lw.cancelAnimation( delayScrolled );
            }
            
            delayScrolled = lw.delay( function() {
                then.wrapper.classList.remove( 'lw-scroll-scrolled-y', 'lw-scroll-scrolled-x' );
            }, 200 );
            
            setPosScrollBarVertical( this );
            setPosScrollBarHorizontal( this );
        } );
    }
    
    function createScroll( then ) {
        wrapScroll( then.element, then.scrollID );
        
        var wrapper   = document.getElementById( 'lw-scroll-wrapper-' + then.scrollID ),
            scroller  = wrapper.firstChild,
            scrollTab = scroller.firstChild;
        
        then.wrapper   = wrapper;
        then.scroller  = scroller;
        then.scrollTab = scrollTab;
        
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
        scrollID:                  null,
        element:                   null,
        scroller:                  null,
        scrollTab:                 null,
        wrapper:                   null,
        scrollBarVerticalActive:   false,
        scrollBarHorizontalActive: false,
        scrollBarVertical:         null,
        scrollBarVerticalThumb:    null,
        scrollBarHorizontal:       null,
        scrollBarHorizontalThumb:  null,
        overflowX:                 'auto',
        overflowY:                 'auto',
        addEventChangeScroll:      addEventChangeScroll,
        removeEventChangeScroll:   removeEventChangeScroll,
        removeScroll:              removeScroll,
        reestablishScroll:         reestablishScroll,
        minSizeScrollBar:          50,
    };
    
    window.LwScrollBar = LwScrollBar;
    
} ) );
