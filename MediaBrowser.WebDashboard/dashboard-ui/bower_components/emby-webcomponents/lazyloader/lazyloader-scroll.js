define(["visibleinviewport", "dom", "browser"], function(visibleinviewport, dom, browser) {
    "use strict";

    function resetThresholds() {
        thresholdX = .3 * screen.availWidth, thresholdY = .3 * screen.availHeight
    }

    function resetThresholdsOnTimer() {
        setTimeout(resetThresholds, 500)
    }

    function isVisible(elem) {
        return visibleinviewport(elem, !0, thresholdX, thresholdY)
    }

    function cancelAll(tokens) {
        for (var i = 0, length = tokens.length; i < length; i++) tokens[i] = !0
    }

    function unveilElementsInternal(instance, callback) {
        function unveilInternal(tokenIndex) {
            for (var anyFound = !1, out = !1, elements = instance.elements, i = 0, length = elements.length; i < length; i++) {
                if (cancellationTokens[tokenIndex]) return;
                if (!unveiledElements[i]) {
                    var elem = elements[i];
                    !out && isVisible(elem) ? (anyFound = !0, unveiledElements[i] = !0, callback(elem), loadedCount++) : anyFound && (out = !0)
                }
            }
            loadedCount >= elements.length && (dom.removeEventListener(document, "focus", unveil, {
                capture: !0,
                passive: !0
            }), dom.removeEventListener(document, "scroll", unveil, {
                capture: !0,
                passive: !0
            }), dom.removeEventListener(document, wheelEvent, unveil, {
                capture: !0,
                passive: !0
            }), dom.removeEventListener(window, "resize", unveil, {
                capture: !0,
                passive: !0
            }))
        }

        function unveil() {
            cancelAll(cancellationTokens);
            var index = cancellationTokens.length;
            cancellationTokens.length++, setTimeout(function() {
                unveilInternal(index)
            }, 1)
        }
        var unveiledElements = [],
            cancellationTokens = [],
            loadedCount = 0;
        dom.addEventListener(document, "focus", unveil, {
            capture: !0,
            passive: !0
        }), dom.addEventListener(document, "scroll", unveil, {
            capture: !0,
            passive: !0
        }), dom.addEventListener(document, wheelEvent, unveil, {
            capture: !0,
            passive: !0
        }), dom.addEventListener(window, "resize", unveil, {
            capture: !0,
            passive: !0
        }), unveil()
    }

    function LazyLoader(options) {
        this.options = options
    }

    function unveilElements(elements, root, callback) {
        if (elements.length) {
            new LazyLoader({
                callback: callback
            }).addElements(elements)
        }
    }
    var thresholdX, thresholdY;
    window.requestIdleCallback;
    browser.iOS ? (dom.addEventListener(window, "orientationchange", resetThresholdsOnTimer, {
        passive: !0
    }), dom.addEventListener(window, "resize", resetThresholdsOnTimer, {
        passive: !0
    })) : (dom.addEventListener(window, "orientationchange", resetThresholds, {
        passive: !0
    }), dom.addEventListener(window, "resize", resetThresholds, {
        passive: !0
    })), resetThresholds();
    var wheelEvent = document.implementation.hasFeature("Event.wheel", "3.0") ? "wheel" : "mousewheel";
    return LazyLoader.prototype.createObserver = function() {
        unveilElementsInternal(this, this.options.callback), this.observer = 1
    }, LazyLoader.prototype.addElements = function(elements) {
        this.elements = this.elements || [];
        for (var i = 0, length = elements.length; i < length; i++) this.elements.push(elements[i]);
        this.observer || this.createObserver()
    }, LazyLoader.prototype.destroyObserver = function(elements) {}, LazyLoader.prototype.destroy = function(elements) {
        this.destroyObserver(), this.options = null
    }, LazyLoader.lazyChildren = function(elem, callback) {
        unveilElements(elem.getElementsByClassName("lazy"), elem, callback)
    }, LazyLoader
});