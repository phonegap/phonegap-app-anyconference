(function(){
    /*
        Pull To Action scroll gesture handler for use in touch-based apps 
        for UX metaphors such as 'pull to close' or 'pull to refresh'.
        
        @param {Object} options Configuration object with setup parameters: 
               - @param required {DOM Element} wrapperEl Element that wraps both scrolling scrollerEL and messageEl
               - @param required {DOM Element} scrollerEl Element with content that scrolls
               - @param required {DOM Element} messageEl Element that contains pull and release messages
               - @param optional {Function} onAction Function called once when content is scrolled beyond the threshold and then released
               - @param optional {Function} onPull Function called constantly when content is scrolled, but under over the threshold to release
               - @param optional {Function} onReleaseReady Function called constantly when content is scrolled over the threshold, but not yet released
               
        @param {Function} driver Decorator applied to handle touch inputs.
                          Used to handle native touch events on iOS.
                          Used to initialize and handle iScroll on Android.
    */
    function PTA(options, driver){
        
        var self = this;

        ['onAction', 'onPull', 'onReleaseReady'].forEach(function(item){
            self[item] = isFunction( options[item] ) ? function (){ return options[item].call(self) } : noop
        });
        
        ['wrapperEl', 'scrollerEl', 'messageEl'].forEach(function(item){
            self[item] = isElement( options[item] ) ? options[item] : throwSetupError(item, 'DOM Element', options)
        });
        
        this.reset()
        
        // apply external handlers
        driver.call(this)
        
        // re-calculate dimensions
        window.addEventListener('orientationchange', this.setup.bind(this))
    }
    
    PTA.prototype = {
        
        css: {
            // CSS class to apply on messageEl when scroll is over threshold
            releaseState: 'pta-state-release'
        },
        
        setup: function(){
            this.offset = this.messageEl.offsetHeight
            this.maxScroll = Math.max(this.scrollerEl.offsetHeight - this.wrapperEl.offsetHeight, 0) 
        },
        
        reset: function(){
            this.setup()
            this.wrapperEl.removeEventListener('touchend', this.onAction)
            this.messageEl.classList.remove(this.css.releaseState)
        },
        
        handleScrollPosition: function(scrollPos){
            if (scrollPos >= this.maxScroll + this.offset){

                this.messageEl.classList.add(this.css.releaseState)
                this.wrapperEl.addEventListener('touchend', this.onAction)
                
                // callback
                this.onReleaseReady.call(this)
            }
            else{
                
                this.messageEl.classList.remove(this.css.releaseState)
                this.wrapperEl.removeEventListener('touchend', this.onAction)
                
                // callback
                this.onPull.call(this)
            }
        }
    }
    
    function noop(){ }
    
    function isFunction(obj){ return typeof obj === 'function' }
    
    function isElement(obj){ return obj && obj.nodeType && obj.nodeType === 1 }
    
    function throwSetupError(item, type, config){ 
        throw new Error('Invalid setup parameter: ' + item + '. Expected '+ type + ', got ' + config[item])
    }
    
    /*
        Decorator to be applied to PTA.
        Handles native touch and scroll events.
    */
    function nativeScrollDriver(){
        // `this` in this context is the the PTA object instance
        var el = this.wrapperEl
        var pta = this
        
        el.addEventListener('touchstart', function(e){
          /* 
            Force a scroll offset if none exists to trick iOS into scrolling this.
            Use existent scroll offset if the content has been scrolled before. 
          */
          el.scrollTop = (el.scrollTop === 0) ? 1 : el.scrollTop
          el.scrollTop = (el.scrollTop === pta.maxScroll) ? pta.maxScroll - 1 : el.scrollTop
        })

        el.addEventListener('touchmove', function(e){
            pta.handleScrollPosition(el.scrollTop)
        })

        el.addEventListener('scroll', function(e){
          if (el.scrollTop == pta.maxScroll){
            /* 
                Insert artificial scroll offset that makes the element not completely
                scrolled so iOS won't default to scrolling the whole page.
            */
            el.scrollTop = pta.maxScroll - 1
          }
        })
    }
   
    /*
        Decorator to be applied to PTA.
        Loads iScroll library and handles scroll events on it.
    */
    function iScrollDriver(){
       // `this` in this context is the the PTA object instance

       // CSS fix for Android
       this.messageEl.style['position'] = 'absolute';
       var el = this.wrapperEl
       var pta = this
       
       if (!iScroll){
           throw new Error("iScoll library missing")
       }
       
       new iScroll(el, {
         // Android 4+ performs better without tranisition
         useTransition: false,
         
         onScrollMove: function(){
           // iScroll returns negative scroll positions. Invert for use in PTA
           pta.handleScrollPosition( -1 * this.y )
         }
       })
    }
    
    window.PullToAction = function(options){
        // Shameless check for user agent. 
        var ua = window.navigator.userAgent;
        var driver = (/\s?iPhone|iPad\s?/.test(ua)) ? nativeScrollDriver : iScrollDriver;
        
        return new PTA(options, driver)
    }
})()