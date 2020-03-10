var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { DOCUMENT } from '@angular/common';
import { Directive, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, Output, Renderer2, SimpleChanges, ViewContainerRef } from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { SlimScrollOptions, SLIMSCROLL_DEFAULTS } from '../classes/slimscroll-options.class';
import { SlimScrollState } from '../classes/slimscroll-state.class';
var ɵ0 = function (t) { return t; }, ɵ1 = function (t) { return t * t; }, ɵ2 = function (t) { return t * (2 - t); }, ɵ3 = function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }, ɵ4 = function (t) { return t * t * t; }, ɵ5 = function (t) { return (--t) * t * t + 1; }, ɵ6 = function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }, ɵ7 = function (t) { return t * t * t * t; }, ɵ8 = function (t) { return 1 - (--t) * t * t * t; }, ɵ9 = function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; }, ɵ10 = function (t) { return t * t * t * t * t; }, ɵ11 = function (t) { return 1 + (--t) * t * t * t * t; }, ɵ12 = function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; };
export var easing = {
    linear: ɵ0,
    inQuad: ɵ1,
    outQuad: ɵ2,
    inOutQuad: ɵ3,
    inCubic: ɵ4,
    outCubic: ɵ5,
    inOutCubic: ɵ6,
    inQuart: ɵ7,
    outQuart: ɵ8,
    inOutQuart: ɵ9,
    inQuint: ɵ10,
    outQuint: ɵ11,
    inOutQuint: ɵ12
};
var SlimScrollDirective = /** @class */ (function () {
    function SlimScrollDirective(viewContainer, renderer, document, optionsDefaults) {
        var _this = this;
        this.viewContainer = viewContainer;
        this.renderer = renderer;
        this.document = document;
        this.optionsDefaults = optionsDefaults;
        this.enabled = true;
        this.scrollChanged = new EventEmitter();
        this.barVisibilityChange = new EventEmitter();
        this.initWheel = function () {
            var dommousescroll = fromEvent(_this.el, 'DOMMouseScroll');
            var mousewheel = fromEvent(_this.el, 'mousewheel');
            var wheelSubscription = merge.apply(void 0, __spread([dommousescroll, mousewheel])).subscribe(function (e) {
                var delta = 0;
                if (e.wheelDelta) {
                    delta = -e.wheelDelta / 120;
                }
                if (e.detail) {
                    delta = e.detail / 3;
                }
                _this.scrollContent(delta, true, false);
                if (e.preventDefault) {
                    e.preventDefault();
                }
            });
            _this.interactionSubscriptions.add(wheelSubscription);
        };
        this.initDrag = function () {
            var bar = _this.bar;
            var mousemove = fromEvent(_this.document.documentElement, 'mousemove');
            var touchmove = fromEvent(_this.document.documentElement, 'touchmove');
            var mousedown = fromEvent(bar, 'mousedown');
            var touchstart = fromEvent(_this.el, 'touchstart');
            var mouseup = fromEvent(_this.document.documentElement, 'mouseup');
            var touchend = fromEvent(_this.document.documentElement, 'touchend');
            var mousedrag = mousedown
                .pipe(mergeMap(function (e) {
                _this.pageY = e.pageY;
                _this.top = parseFloat(getComputedStyle(bar).top);
                return mousemove
                    .pipe(map(function (emove) {
                    emove.preventDefault();
                    return _this.top + emove.pageY - _this.pageY;
                }), takeUntil(mouseup));
            }));
            var touchdrag = touchstart
                .pipe(mergeMap(function (e) {
                _this.pageY = e.targetTouches[0].pageY;
                _this.top = -parseFloat(getComputedStyle(bar).top);
                return touchmove
                    .pipe(map(function (tmove) {
                    return -(_this.top + tmove.targetTouches[0].pageY - _this.pageY);
                }), takeUntil(touchend));
            }));
            var dragSubscription = merge.apply(void 0, __spread([mousedrag, touchdrag])).subscribe(function (top) {
                _this.body.addEventListener('selectstart', _this.preventDefaultEvent, false);
                _this.renderer.setStyle(_this.body, 'touch-action', 'pan-y');
                _this.renderer.setStyle(_this.body, 'user-select', 'none');
                _this.renderer.setStyle(_this.bar, 'top', top + "px");
                var over = _this.scrollContent(0, true, false);
                var maxTop = _this.el.offsetHeight - _this.bar.offsetHeight;
                if (over && over < 0 && -over <= maxTop) {
                    _this.renderer.setStyle(_this.el, 'paddingTop', -over + 'px');
                }
                else if (over && over > 0 && over <= maxTop) {
                    _this.renderer.setStyle(_this.el, 'paddingBottom', over + 'px');
                }
            });
            var dragEndSubscription = merge.apply(void 0, __spread([mouseup, touchend])).subscribe(function () {
                _this.body.removeEventListener('selectstart', _this.preventDefaultEvent, false);
                var paddingTop = parseInt(_this.el.style.paddingTop, 10);
                var paddingBottom = parseInt(_this.el.style.paddingBottom, 10);
                _this.renderer.setStyle(_this.body, 'touch-action', 'unset');
                _this.renderer.setStyle(_this.body, 'user-select', 'default');
                if (paddingTop > 0) {
                    _this.scrollTo(0, 300, 'linear');
                }
                else if (paddingBottom > 0) {
                    _this.scrollTo(0, 300, 'linear');
                }
            });
            _this.interactionSubscriptions.add(dragSubscription);
            _this.interactionSubscriptions.add(dragEndSubscription);
        };
        this.preventDefaultEvent = function (e) {
            e.preventDefault();
            e.stopPropagation();
        };
        this.viewContainer = viewContainer;
        this.el = viewContainer.element.nativeElement;
        this.body = this.document.querySelector('body');
        this.mutationThrottleTimeout = 50;
    }
    SlimScrollDirective.prototype.ngOnInit = function () {
        // setup if no changes for enabled for the first time
        if (!this.interactionSubscriptions && this.enabled) {
            this.setup();
        }
    };
    SlimScrollDirective.prototype.ngOnChanges = function (changes) {
        if (changes.enabled) {
            if (this.enabled) {
                this.setup();
            }
            else {
                this.destroy();
            }
        }
    };
    SlimScrollDirective.prototype.ngOnDestroy = function () {
        this.destroy();
    };
    SlimScrollDirective.prototype.setup = function () {
        var _this = this;
        this.interactionSubscriptions = new Subscription();
        if (this.optionsDefaults) {
            this.options = new SlimScrollOptions(this.optionsDefaults).merge(this.options);
        }
        else {
            this.options = new SlimScrollOptions(this.options);
        }
        this.setStyle();
        this.wrapContainer();
        this.initGrid();
        this.initBar();
        this.getBarHeight();
        this.initWheel();
        this.initDrag();
        if (!this.options.alwaysVisible) {
            this.hideBarAndGrid();
        }
        if (MutationObserver) {
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }
            this.mutationObserver = new MutationObserver(function () {
                if (_this.mutationThrottleTimeout) {
                    clearTimeout(_this.mutationThrottleTimeout);
                    _this.mutationThrottleTimeout = setTimeout(_this.onMutation.bind(_this), 50);
                }
            });
            this.mutationObserver.observe(this.el, { subtree: true, childList: true });
        }
        if (this.scrollEvents && this.scrollEvents instanceof EventEmitter) {
            var scrollSubscription = this.scrollEvents.subscribe(function (event) { return _this.handleEvent(event); });
            this.interactionSubscriptions.add(scrollSubscription);
        }
    };
    SlimScrollDirective.prototype.handleEvent = function (e) {
        if (e.type === 'scrollToBottom') {
            var y = this.el.scrollHeight - this.el.clientHeight;
            this.scrollTo(y, e.duration, e.easing);
        }
        else if (e.type === 'scrollToTop') {
            var y = 0;
            this.scrollTo(y, e.duration, e.easing);
        }
        else if (e.type === 'scrollToPercent' && (e.percent >= 0 && e.percent <= 100)) {
            var y = Math.round(((this.el.scrollHeight - this.el.clientHeight) / 100) * e.percent);
            this.scrollTo(y, e.duration, e.easing);
        }
        else if (e.type === 'scrollTo') {
            var y = e.y;
            if (y <= this.el.scrollHeight - this.el.clientHeight && y >= 0) {
                this.scrollTo(y, e.duration, e.easing);
            }
        }
        else if (e.type === 'recalculate') {
            this.getBarHeight();
        }
    };
    SlimScrollDirective.prototype.setStyle = function () {
        var el = this.el;
        this.renderer.setStyle(el, 'overflow', 'hidden');
        this.renderer.setStyle(el, 'position', 'relative');
        this.renderer.setStyle(el, 'display', 'block');
    };
    SlimScrollDirective.prototype.onMutation = function () {
        this.getBarHeight();
    };
    SlimScrollDirective.prototype.wrapContainer = function () {
        this.wrapper = this.renderer.createElement('div');
        var wrapper = this.wrapper;
        var el = this.el;
        this.renderer.addClass(wrapper, 'slimscroll-wrapper');
        this.renderer.setStyle(wrapper, 'position', 'relative');
        this.renderer.setStyle(wrapper, 'overflow', 'hidden');
        this.renderer.setStyle(wrapper, 'display', 'inline-block');
        this.renderer.setStyle(wrapper, 'margin', getComputedStyle(el).margin);
        this.renderer.setStyle(wrapper, 'width', '100%');
        this.renderer.setStyle(wrapper, 'height', getComputedStyle(el).height);
        this.renderer.insertBefore(el.parentNode, wrapper, el);
        this.renderer.appendChild(wrapper, el);
    };
    SlimScrollDirective.prototype.initGrid = function () {
        this.grid = this.renderer.createElement('div');
        var grid = this.grid;
        this.renderer.addClass(grid, 'slimscroll-grid');
        this.renderer.setStyle(grid, 'position', 'absolute');
        this.renderer.setStyle(grid, 'top', '0');
        this.renderer.setStyle(grid, 'bottom', '0');
        this.renderer.setStyle(grid, this.options.position, '0');
        this.renderer.setStyle(grid, 'width', this.options.gridWidth + "px");
        this.renderer.setStyle(grid, 'background', this.options.gridBackground);
        this.renderer.setStyle(grid, 'opacity', this.options.gridOpacity);
        this.renderer.setStyle(grid, 'display', 'block');
        this.renderer.setStyle(grid, 'cursor', 'pointer');
        this.renderer.setStyle(grid, 'z-index', '99');
        this.renderer.setStyle(grid, 'border-radius', this.options.gridBorderRadius + "px");
        this.renderer.setStyle(grid, 'margin', this.options.gridMargin);
        this.renderer.appendChild(this.wrapper, grid);
    };
    SlimScrollDirective.prototype.initBar = function () {
        this.bar = this.renderer.createElement('div');
        var bar = this.bar;
        this.renderer.addClass(bar, 'slimscroll-bar');
        this.renderer.setStyle(bar, 'position', 'absolute');
        this.renderer.setStyle(bar, 'top', '0');
        this.renderer.setStyle(bar, this.options.position, '0');
        this.renderer.setStyle(bar, 'width', this.options.barWidth + "px");
        this.renderer.setStyle(bar, 'background', this.options.barBackground);
        this.renderer.setStyle(bar, 'opacity', this.options.barOpacity);
        this.renderer.setStyle(bar, 'display', 'block');
        this.renderer.setStyle(bar, 'cursor', 'pointer');
        this.renderer.setStyle(bar, 'z-index', '100');
        this.renderer.setStyle(bar, 'border-radius', this.options.barBorderRadius + "px");
        this.renderer.setStyle(bar, 'margin', this.options.barMargin);
        this.renderer.appendChild(this.wrapper, bar);
        this.barVisibilityChange.emit(true);
    };
    SlimScrollDirective.prototype.getBarHeight = function () {
        var elHeight = this.el.offsetHeight;
        var barHeight = Math.max((elHeight / this.el.scrollHeight) * elHeight, 30) + 'px';
        var display = parseInt(barHeight, 10) === elHeight ? 'none' : 'block';
        if (this.wrapper.offsetHeight !== elHeight) {
            this.renderer.setStyle(this.wrapper, 'height', elHeight + 'px');
        }
        this.renderer.setStyle(this.bar, 'height', barHeight);
        this.renderer.setStyle(this.bar, 'display', display);
        this.renderer.setStyle(this.grid, 'display', display);
        this.barVisibilityChange.emit(display !== 'none');
    };
    SlimScrollDirective.prototype.scrollTo = function (y, duration, easingFunc) {
        var _this = this;
        var start = Date.now();
        var from = this.el.scrollTop;
        var maxTop = this.el.offsetHeight - this.bar.offsetHeight;
        var maxElScrollTop = this.el.scrollHeight - this.el.clientHeight;
        var barHeight = Math.max((this.el.offsetHeight / this.el.scrollHeight) * this.el.offsetHeight, 30);
        var paddingTop = parseInt(this.el.style.paddingTop, 10) || 0;
        var paddingBottom = parseInt(this.el.style.paddingBottom, 10) || 0;
        var scroll = function (timestamp) {
            var currentTime = Date.now();
            var time = Math.min(1, ((currentTime - start) / duration));
            var easedTime = easing[easingFunc](time);
            if (paddingTop > 0 || paddingBottom > 0) {
                var fromY = null;
                if (paddingTop > 0) {
                    fromY = -paddingTop;
                    fromY = -((easedTime * (y - fromY)) + fromY);
                    _this.renderer.setStyle(_this.el, 'paddingTop', fromY + "px");
                }
                if (paddingBottom > 0) {
                    fromY = paddingBottom;
                    fromY = ((easedTime * (y - fromY)) + fromY);
                    _this.renderer.setStyle(_this.el, 'paddingBottom', fromY + "px");
                }
            }
            else {
                _this.el.scrollTop = (easedTime * (y - from)) + from;
            }
            var percentScroll = _this.el.scrollTop / maxElScrollTop;
            if (paddingBottom === 0) {
                var delta = Math.round(Math.round(_this.el.clientHeight * percentScroll) - barHeight);
                if (delta > 0) {
                    _this.renderer.setStyle(_this.bar, 'top', delta + "px");
                }
            }
            if (time < 1) {
                requestAnimationFrame(scroll);
            }
        };
        requestAnimationFrame(scroll);
    };
    SlimScrollDirective.prototype.scrollContent = function (y, isWheel, isJump) {
        var _this = this;
        var delta = y;
        var maxTop = this.el.offsetHeight - this.bar.offsetHeight;
        var hiddenContent = this.el.scrollHeight - this.el.offsetHeight;
        var percentScroll;
        var over = null;
        if (isWheel) {
            delta = parseInt(getComputedStyle(this.bar).top, 10) + y * 20 / 100 * this.bar.offsetHeight;
            if (delta < 0 || delta > maxTop) {
                over = delta > maxTop ? delta - maxTop : delta;
            }
            delta = Math.min(Math.max(delta, 0), maxTop);
            delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);
            this.renderer.setStyle(this.bar, 'top', delta + 'px');
        }
        percentScroll = parseInt(getComputedStyle(this.bar).top, 10) / (this.el.offsetHeight - this.bar.offsetHeight);
        delta = percentScroll * hiddenContent;
        this.el.scrollTop = delta;
        this.showBarAndGrid();
        if (!this.options.alwaysVisible) {
            if (this.visibleTimeout) {
                clearTimeout(this.visibleTimeout);
            }
            this.visibleTimeout = setTimeout(function () {
                _this.hideBarAndGrid();
            }, this.options.visibleTimeout);
        }
        var isScrollAtStart = delta === 0;
        var isScrollAtEnd = delta === hiddenContent;
        var scrollPosition = Math.ceil(delta);
        var scrollState = new SlimScrollState({ scrollPosition: scrollPosition, isScrollAtStart: isScrollAtStart, isScrollAtEnd: isScrollAtEnd });
        this.scrollChanged.emit(scrollState);
        return over;
    };
    SlimScrollDirective.prototype.showBarAndGrid = function () {
        this.renderer.setStyle(this.grid, 'background', this.options.gridBackground);
        this.renderer.setStyle(this.bar, 'background', this.options.barBackground);
    };
    SlimScrollDirective.prototype.hideBarAndGrid = function () {
        this.renderer.setStyle(this.grid, 'background', 'transparent');
        this.renderer.setStyle(this.bar, 'background', 'transparent');
    };
    SlimScrollDirective.prototype.destroy = function () {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        if (this.el.parentElement.classList.contains('slimscroll-wrapper')) {
            var wrapper = this.el.parentElement;
            var bar = wrapper.querySelector('.slimscroll-bar');
            wrapper.removeChild(bar);
            var grid = wrapper.querySelector('.slimscroll-grid');
            wrapper.removeChild(grid);
            this.unwrap(wrapper);
        }
        if (this.interactionSubscriptions) {
            this.interactionSubscriptions.unsubscribe();
        }
    };
    SlimScrollDirective.prototype.unwrap = function (wrapper) {
        var docFrag = document.createDocumentFragment();
        while (wrapper.firstChild) {
            var child = wrapper.removeChild(wrapper.firstChild);
            docFrag.appendChild(child);
        }
        wrapper.parentNode.replaceChild(docFrag, wrapper);
    };
    SlimScrollDirective.prototype.onResize = function ($event) {
        this.getBarHeight();
    };
    SlimScrollDirective.ctorParameters = function () { return [
        { type: ViewContainerRef, decorators: [{ type: Inject, args: [ViewContainerRef,] }] },
        { type: Renderer2, decorators: [{ type: Inject, args: [Renderer2,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [SLIMSCROLL_DEFAULTS,] }, { type: Optional }] }
    ]; };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SlimScrollDirective.prototype, "enabled", void 0);
    __decorate([
        Input(),
        __metadata("design:type", SlimScrollOptions)
    ], SlimScrollDirective.prototype, "options", void 0);
    __decorate([
        Input(),
        __metadata("design:type", EventEmitter)
    ], SlimScrollDirective.prototype, "scrollEvents", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SlimScrollDirective.prototype, "scrollChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SlimScrollDirective.prototype, "barVisibilityChange", void 0);
    __decorate([
        HostListener('window:resize', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], SlimScrollDirective.prototype, "onResize", null);
    SlimScrollDirective = __decorate([
        Directive({
            selector: '[slimScroll]',
            exportAs: 'slimScroll'
        }),
        __param(0, Inject(ViewContainerRef)),
        __param(1, Inject(Renderer2)),
        __param(2, Inject(DOCUMENT)),
        __param(3, Inject(SLIMSCROLL_DEFAULTS)), __param(3, Optional()),
        __metadata("design:paramtypes", [ViewContainerRef,
            Renderer2, Object, Object])
    ], SlimScrollDirective);
    return SlimScrollDirective;
}());
export { SlimScrollDirective };
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, ɵ11, ɵ12 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpbXNjcm9sbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtc2xpbXNjcm9sbC8iLCJzb3VyY2VzIjpbInNyYy9kaXJlY3RpdmVzL3NsaW1zY3JvbGwuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNqTCxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEQsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFMUQsT0FBTyxFQUFzQixpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ2pILE9BQU8sRUFBb0IsZUFBZSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7U0FHNUUsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLEVBQUQsQ0FBQyxPQUNoQixVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsR0FBRyxDQUFDLEVBQUwsQ0FBSyxPQUNuQixVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBWCxDQUFXLE9BQ3hCLFVBQUMsQ0FBUyxJQUFLLE9BQUEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMs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QUE7UUFDaEIsV0FBQSxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQSxFQUFFLFdBQUEsUUFBUSxFQUFFLENBQUE7eUNBSFMsZ0JBQWdCO1lBQzVCLFNBQVM7T0F0QnJDLG1CQUFtQixDQXViL0I7SUFBRCwwQkFBQztDQUFBLEFBdmJELElBdWJDO1NBdmJZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IERpcmVjdGl2ZSwgRXZlbnRFbWl0dGVyLCBIb3N0TGlzdGVuZXIsIEluamVjdCwgSW5wdXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIE9wdGlvbmFsLCBPdXRwdXQsIFJlbmRlcmVyMiwgU2ltcGxlQ2hhbmdlcywgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgZnJvbUV2ZW50LCBtZXJnZSwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtYXAsIG1lcmdlTWFwLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBJU2xpbVNjcm9sbEV2ZW50LCBTbGltU2Nyb2xsRXZlbnQgfSBmcm9tICcuLi9jbGFzc2VzL3NsaW1zY3JvbGwtZXZlbnQuY2xhc3MnO1xuaW1wb3J0IHsgSVNsaW1TY3JvbGxPcHRpb25zLCBTbGltU2Nyb2xsT3B0aW9ucywgU0xJTVNDUk9MTF9ERUZBVUxUUyB9IGZyb20gJy4uL2NsYXNzZXMvc2xpbXNjcm9sbC1vcHRpb25zLmNsYXNzJztcbmltcG9ydCB7IElTbGltU2Nyb2xsU3RhdGUsIFNsaW1TY3JvbGxTdGF0ZSB9IGZyb20gJy4uL2NsYXNzZXMvc2xpbXNjcm9sbC1zdGF0ZS5jbGFzcyc7XG5cbmV4cG9ydCBjb25zdCBlYXNpbmc6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHtcbiAgbGluZWFyOiAodDogbnVtYmVyKSA9PiB0LFxuICBpblF1YWQ6ICh0OiBudW1iZXIpID0+IHQgKiB0LFxuICBvdXRRdWFkOiAodDogbnVtYmVyKSA9PiB0ICogKDIgLSB0KSxcbiAgaW5PdXRRdWFkOiAodDogbnVtYmVyKSA9PiB0IDwgLjUgPyAyICogdCAqIHQgOiAtMSArICg0IC0gMiAqIHQpICogdCxcbiAgaW5DdWJpYzogKHQ6IG51bWJlcikgPT4gdCAqIHQgKiB0LFxuICBvdXRDdWJpYzogKHQ6IG51bWJlcikgPT4gKC0tdCkgKiB0ICogdCArIDEsXG4gIGluT3V0Q3ViaWM6ICh0OiBudW1iZXIpID0+IHQgPCAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDEsXG4gIGluUXVhcnQ6ICh0OiBudW1iZXIpID0+IHQgKiB0ICogdCAqIHQsXG4gIG91dFF1YXJ0OiAodDogbnVtYmVyKSA9PiAxIC0gKC0tdCkgKiB0ICogdCAqIHQsXG4gIGluT3V0UXVhcnQ6ICh0OiBudW1iZXIpID0+IHQgPCAuNSA/IDggKiB0ICogdCAqIHQgKiB0IDogMSAtIDggKiAoLS10KSAqIHQgKiB0ICogdCxcbiAgaW5RdWludDogKHQ6IG51bWJlcikgPT4gdCAqIHQgKiB0ICogdCAqIHQsXG4gIG91dFF1aW50OiAodDogbnVtYmVyKSA9PiAxICsgKC0tdCkgKiB0ICogdCAqIHQgKiB0LFxuICBpbk91dFF1aW50OiAodDogbnVtYmVyKSA9PiB0IDwgLjUgPyAxNiAqIHQgKiB0ICogdCAqIHQgKiB0IDogMSArIDE2ICogKC0tdCkgKiB0ICogdCAqIHQgKiB0XG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbc2xpbVNjcm9sbF0nLCAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lXG4gIGV4cG9ydEFzOiAnc2xpbVNjcm9sbCdcbn0pXG5leHBvcnQgY2xhc3MgU2xpbVNjcm9sbERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBlbmFibGVkID0gdHJ1ZTtcbiAgQElucHV0KCkgb3B0aW9uczogU2xpbVNjcm9sbE9wdGlvbnM7XG4gIEBJbnB1dCgpIHNjcm9sbEV2ZW50czogRXZlbnRFbWl0dGVyPElTbGltU2Nyb2xsRXZlbnQ+O1xuICBAT3V0cHV0KCkgc2Nyb2xsQ2hhbmdlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SVNsaW1TY3JvbGxTdGF0ZT4oKTtcbiAgQE91dHB1dCgpIGJhclZpc2liaWxpdHlDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KCk7XG5cbiAgZWw6IEhUTUxFbGVtZW50O1xuICB3cmFwcGVyOiBIVE1MRWxlbWVudDtcbiAgZ3JpZDogSFRNTEVsZW1lbnQ7XG4gIGJhcjogSFRNTEVsZW1lbnQ7XG4gIGJvZHk6IEhUTUxFbGVtZW50O1xuICBwYWdlWTogbnVtYmVyO1xuICB0b3A6IG51bWJlcjtcbiAgZHJhZ2dpbmc6IGJvb2xlYW47XG4gIG11dGF0aW9uVGhyb3R0bGVUaW1lb3V0OiBudW1iZXIgfCBhbnk7XG4gIG11dGF0aW9uT2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXI7XG4gIGxhc3RUb3VjaFBvc2l0aW9uWTogbnVtYmVyO1xuICB2aXNpYmxlVGltZW91dDogYW55O1xuICBpbnRlcmFjdGlvblN1YnNjcmlwdGlvbnM6IFN1YnNjcmlwdGlvbjtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChWaWV3Q29udGFpbmVyUmVmKSBwcml2YXRlIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChSZW5kZXJlcjIpIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvY3VtZW50OiBhbnksXG4gICAgQEluamVjdChTTElNU0NST0xMX0RFRkFVTFRTKSBAT3B0aW9uYWwoKSBwcml2YXRlIG9wdGlvbnNEZWZhdWx0czogSVNsaW1TY3JvbGxPcHRpb25zXG4gICkge1xuICAgIHRoaXMudmlld0NvbnRhaW5lciA9IHZpZXdDb250YWluZXI7XG4gICAgdGhpcy5lbCA9IHZpZXdDb250YWluZXIuZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuYm9keSA9IHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgIHRoaXMubXV0YXRpb25UaHJvdHRsZVRpbWVvdXQgPSA1MDtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIHNldHVwIGlmIG5vIGNoYW5nZXMgZm9yIGVuYWJsZWQgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgaWYgKCF0aGlzLmludGVyYWN0aW9uU3Vic2NyaXB0aW9ucyAmJiB0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXMuZW5hYmxlZCkge1xuICAgICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHNldHVwKCkge1xuICAgIHRoaXMuaW50ZXJhY3Rpb25TdWJzY3JpcHRpb25zID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuICAgIGlmICh0aGlzLm9wdGlvbnNEZWZhdWx0cykge1xuICAgICAgdGhpcy5vcHRpb25zID0gbmV3IFNsaW1TY3JvbGxPcHRpb25zKHRoaXMub3B0aW9uc0RlZmF1bHRzKS5tZXJnZSh0aGlzLm9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBuZXcgU2xpbVNjcm9sbE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0eWxlKCk7XG4gICAgdGhpcy53cmFwQ29udGFpbmVyKCk7XG4gICAgdGhpcy5pbml0R3JpZCgpO1xuICAgIHRoaXMuaW5pdEJhcigpO1xuICAgIHRoaXMuZ2V0QmFySGVpZ2h0KCk7XG4gICAgdGhpcy5pbml0V2hlZWwoKTtcbiAgICB0aGlzLmluaXREcmFnKCk7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5hbHdheXNWaXNpYmxlKSB7XG4gICAgICB0aGlzLmhpZGVCYXJBbmRHcmlkKCk7XG4gICAgfVxuXG4gICAgaWYgKE11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIGlmICh0aGlzLm11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubXV0YXRpb25UaHJvdHRsZVRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5tdXRhdGlvblRocm90dGxlVGltZW91dCk7XG4gICAgICAgICAgdGhpcy5tdXRhdGlvblRocm90dGxlVGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5vbk11dGF0aW9uLmJpbmQodGhpcyksIDUwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsLCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY3JvbGxFdmVudHMgJiYgdGhpcy5zY3JvbGxFdmVudHMgaW5zdGFuY2VvZiBFdmVudEVtaXR0ZXIpIHtcbiAgICAgIGNvbnN0IHNjcm9sbFN1YnNjcmlwdGlvbiA9IHRoaXMuc2Nyb2xsRXZlbnRzLnN1YnNjcmliZSgoZXZlbnQ6IFNsaW1TY3JvbGxFdmVudCkgPT4gdGhpcy5oYW5kbGVFdmVudChldmVudCkpO1xuICAgICAgdGhpcy5pbnRlcmFjdGlvblN1YnNjcmlwdGlvbnMuYWRkKHNjcm9sbFN1YnNjcmlwdGlvbik7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlRXZlbnQoZTogU2xpbVNjcm9sbEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKGUudHlwZSA9PT0gJ3Njcm9sbFRvQm90dG9tJykge1xuICAgICAgY29uc3QgeSA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5lbC5jbGllbnRIZWlnaHQ7XG4gICAgICB0aGlzLnNjcm9sbFRvKHksIGUuZHVyYXRpb24sIGUuZWFzaW5nKTtcbiAgICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gJ3Njcm9sbFRvVG9wJykge1xuICAgICAgY29uc3QgeSA9IDA7XG4gICAgICB0aGlzLnNjcm9sbFRvKHksIGUuZHVyYXRpb24sIGUuZWFzaW5nKTtcbiAgICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gJ3Njcm9sbFRvUGVyY2VudCcgJiYgKGUucGVyY2VudCA+PSAwICYmIGUucGVyY2VudCA8PSAxMDApKSB7XG4gICAgICBjb25zdCB5ID0gTWF0aC5yb3VuZCgoKHRoaXMuZWwuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5lbC5jbGllbnRIZWlnaHQpIC8gMTAwKSAqIGUucGVyY2VudCk7XG4gICAgICB0aGlzLnNjcm9sbFRvKHksIGUuZHVyYXRpb24sIGUuZWFzaW5nKTtcbiAgICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gJ3Njcm9sbFRvJykge1xuICAgICAgY29uc3QgeSA9IGUueTtcbiAgICAgIGlmICh5IDw9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5lbC5jbGllbnRIZWlnaHQgJiYgeSA+PSAwKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG8oeSwgZS5kdXJhdGlvbiwgZS5lYXNpbmcpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZS50eXBlID09PSAncmVjYWxjdWxhdGUnKSB7XG4gICAgICB0aGlzLmdldEJhckhlaWdodCgpO1xuICAgIH1cbiAgfVxuXG4gIHNldFN0eWxlKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5lbDtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGVsLCAnb3ZlcmZsb3cnLCAnaGlkZGVuJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShlbCwgJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShlbCwgJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgfVxuXG4gIG9uTXV0YXRpb24oKSB7XG4gICAgdGhpcy5nZXRCYXJIZWlnaHQoKTtcbiAgfVxuXG4gIHdyYXBDb250YWluZXIoKTogdm9pZCB7XG4gICAgdGhpcy53cmFwcGVyID0gdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCB3cmFwcGVyID0gdGhpcy53cmFwcGVyO1xuICAgIGNvbnN0IGVsID0gdGhpcy5lbDtcblxuICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3Mod3JhcHBlciwgJ3NsaW1zY3JvbGwtd3JhcHBlcicpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUod3JhcHBlciwgJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh3cmFwcGVyLCAnb3ZlcmZsb3cnLCAnaGlkZGVuJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh3cmFwcGVyLCAnZGlzcGxheScsICdpbmxpbmUtYmxvY2snKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHdyYXBwZXIsICdtYXJnaW4nLCBnZXRDb21wdXRlZFN0eWxlKGVsKS5tYXJnaW4pO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUod3JhcHBlciwgJ3dpZHRoJywgJzEwMCUnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHdyYXBwZXIsICdoZWlnaHQnLCBnZXRDb21wdXRlZFN0eWxlKGVsKS5oZWlnaHQpO1xuXG4gICAgdGhpcy5yZW5kZXJlci5pbnNlcnRCZWZvcmUoZWwucGFyZW50Tm9kZSwgd3JhcHBlciwgZWwpO1xuICAgIHRoaXMucmVuZGVyZXIuYXBwZW5kQ2hpbGQod3JhcHBlciwgZWwpO1xuICB9XG5cbiAgaW5pdEdyaWQoKTogdm9pZCB7XG4gICAgdGhpcy5ncmlkID0gdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBncmlkID0gdGhpcy5ncmlkO1xuXG4gICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyhncmlkLCAnc2xpbXNjcm9sbC1ncmlkJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCAncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGdyaWQsICd0b3AnLCAnMCcpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ2JvdHRvbScsICcwJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCB0aGlzLm9wdGlvbnMucG9zaXRpb24sICcwJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCAnd2lkdGgnLCBgJHt0aGlzLm9wdGlvbnMuZ3JpZFdpZHRofXB4YCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCAnYmFja2dyb3VuZCcsIHRoaXMub3B0aW9ucy5ncmlkQmFja2dyb3VuZCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCAnb3BhY2l0eScsIHRoaXMub3B0aW9ucy5ncmlkT3BhY2l0eSk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCAnZGlzcGxheScsICdibG9jaycpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ2N1cnNvcicsICdwb2ludGVyJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCAnei1pbmRleCcsICc5OScpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ2JvcmRlci1yYWRpdXMnLCBgJHt0aGlzLm9wdGlvbnMuZ3JpZEJvcmRlclJhZGl1c31weGApO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ21hcmdpbicsIHRoaXMub3B0aW9ucy5ncmlkTWFyZ2luKTtcblxuICAgIHRoaXMucmVuZGVyZXIuYXBwZW5kQ2hpbGQodGhpcy53cmFwcGVyLCBncmlkKTtcbiAgfVxuXG4gIGluaXRCYXIoKTogdm9pZCB7XG4gICAgdGhpcy5iYXIgPSB0aGlzLnJlbmRlcmVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IGJhciA9IHRoaXMuYmFyO1xuXG4gICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyhiYXIsICdzbGltc2Nyb2xsLWJhcicpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoYmFyLCAncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ3RvcCcsICcwJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsIHRoaXMub3B0aW9ucy5wb3NpdGlvbiwgJzAnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ3dpZHRoJywgYCR7dGhpcy5vcHRpb25zLmJhcldpZHRofXB4YCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsICdiYWNrZ3JvdW5kJywgdGhpcy5vcHRpb25zLmJhckJhY2tncm91bmQpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoYmFyLCAnb3BhY2l0eScsIHRoaXMub3B0aW9ucy5iYXJPcGFjaXR5KTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ2N1cnNvcicsICdwb2ludGVyJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsICd6LWluZGV4JywgJzEwMCcpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoYmFyLCAnYm9yZGVyLXJhZGl1cycsIGAke3RoaXMub3B0aW9ucy5iYXJCb3JkZXJSYWRpdXN9cHhgKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ21hcmdpbicsIHRoaXMub3B0aW9ucy5iYXJNYXJnaW4pO1xuXG4gICAgdGhpcy5yZW5kZXJlci5hcHBlbmRDaGlsZCh0aGlzLndyYXBwZXIsIGJhcik7XG4gICAgdGhpcy5iYXJWaXNpYmlsaXR5Q2hhbmdlLmVtaXQodHJ1ZSk7XG4gIH1cblxuICBnZXRCYXJIZWlnaHQoKTogdm9pZCB7XG4gICAgY29uc3QgZWxIZWlnaHQgPSB0aGlzLmVsLm9mZnNldEhlaWdodDtcbiAgICBjb25zdCBiYXJIZWlnaHQgPSBNYXRoLm1heCgoZWxIZWlnaHQgLyB0aGlzLmVsLnNjcm9sbEhlaWdodCkgKiBlbEhlaWdodCwgMzApICsgJ3B4JztcbiAgICBjb25zdCBkaXNwbGF5ID0gcGFyc2VJbnQoYmFySGVpZ2h0LCAxMCkgPT09IGVsSGVpZ2h0ID8gJ25vbmUnIDogJ2Jsb2NrJztcblxuICAgIGlmICh0aGlzLndyYXBwZXIub2Zmc2V0SGVpZ2h0ICE9PSBlbEhlaWdodCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLndyYXBwZXIsICdoZWlnaHQnLCBlbEhlaWdodCArICdweCcpO1xuICAgIH1cblxuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5iYXIsICdoZWlnaHQnLCBiYXJIZWlnaHQpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5iYXIsICdkaXNwbGF5JywgZGlzcGxheSk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmdyaWQsICdkaXNwbGF5JywgZGlzcGxheSk7XG4gICAgdGhpcy5iYXJWaXNpYmlsaXR5Q2hhbmdlLmVtaXQoZGlzcGxheSAhPT0gJ25vbmUnKTtcbiAgfVxuXG4gIHNjcm9sbFRvKHk6IG51bWJlciwgZHVyYXRpb246IG51bWJlciwgZWFzaW5nRnVuYzogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGZyb20gPSB0aGlzLmVsLnNjcm9sbFRvcDtcbiAgICBjb25zdCBtYXhUb3AgPSB0aGlzLmVsLm9mZnNldEhlaWdodCAtIHRoaXMuYmFyLm9mZnNldEhlaWdodDtcbiAgICBjb25zdCBtYXhFbFNjcm9sbFRvcCA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5lbC5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3QgYmFySGVpZ2h0ID0gTWF0aC5tYXgoKHRoaXMuZWwub2Zmc2V0SGVpZ2h0IC8gdGhpcy5lbC5zY3JvbGxIZWlnaHQpICogdGhpcy5lbC5vZmZzZXRIZWlnaHQsIDMwKTtcbiAgICBjb25zdCBwYWRkaW5nVG9wID0gcGFyc2VJbnQodGhpcy5lbC5zdHlsZS5wYWRkaW5nVG9wLCAxMCkgfHwgMDtcbiAgICBjb25zdCBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQodGhpcy5lbC5zdHlsZS5wYWRkaW5nQm90dG9tLCAxMCkgfHwgMDtcblxuICAgIGNvbnN0IHNjcm9sbCA9ICh0aW1lc3RhbXA6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3QgdGltZSA9IE1hdGgubWluKDEsICgoY3VycmVudFRpbWUgLSBzdGFydCkgLyBkdXJhdGlvbikpO1xuICAgICAgY29uc3QgZWFzZWRUaW1lID0gZWFzaW5nW2Vhc2luZ0Z1bmNdKHRpbWUpO1xuXG4gICAgICBpZiAocGFkZGluZ1RvcCA+IDAgfHwgcGFkZGluZ0JvdHRvbSA+IDApIHtcbiAgICAgICAgbGV0IGZyb21ZID0gbnVsbDtcblxuICAgICAgICBpZiAocGFkZGluZ1RvcCA+IDApIHtcbiAgICAgICAgICBmcm9tWSA9IC1wYWRkaW5nVG9wO1xuICAgICAgICAgIGZyb21ZID0gLSgoZWFzZWRUaW1lICogKHkgLSBmcm9tWSkpICsgZnJvbVkpO1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbCwgJ3BhZGRpbmdUb3AnLCBgJHtmcm9tWX1weGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdCb3R0b20gPiAwKSB7XG4gICAgICAgICAgZnJvbVkgPSBwYWRkaW5nQm90dG9tO1xuICAgICAgICAgIGZyb21ZID0gKChlYXNlZFRpbWUgKiAoeSAtIGZyb21ZKSkgKyBmcm9tWSk7XG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmVsLCAncGFkZGluZ0JvdHRvbScsIGAke2Zyb21ZfXB4YCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWwuc2Nyb2xsVG9wID0gKGVhc2VkVGltZSAqICh5IC0gZnJvbSkpICsgZnJvbTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGVyY2VudFNjcm9sbCA9IHRoaXMuZWwuc2Nyb2xsVG9wIC8gbWF4RWxTY3JvbGxUb3A7XG4gICAgICBpZiAocGFkZGluZ0JvdHRvbSA9PT0gMCkge1xuICAgICAgICBjb25zdCBkZWx0YSA9IE1hdGgucm91bmQoTWF0aC5yb3VuZCh0aGlzLmVsLmNsaWVudEhlaWdodCAqIHBlcmNlbnRTY3JvbGwpIC0gYmFySGVpZ2h0KTtcbiAgICAgICAgaWYgKGRlbHRhID4gMCkge1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5iYXIsICd0b3AnLCBgJHtkZWx0YX1weGApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lIDwgMSkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbCk7XG4gIH1cblxuICBzY3JvbGxDb250ZW50KHk6IG51bWJlciwgaXNXaGVlbDogYm9vbGVhbiwgaXNKdW1wOiBib29sZWFuKTogbnVsbCB8IG51bWJlciB7XG4gICAgbGV0IGRlbHRhID0geTtcbiAgICBjb25zdCBtYXhUb3AgPSB0aGlzLmVsLm9mZnNldEhlaWdodCAtIHRoaXMuYmFyLm9mZnNldEhlaWdodDtcbiAgICBjb25zdCBoaWRkZW5Db250ZW50ID0gdGhpcy5lbC5zY3JvbGxIZWlnaHQgLSB0aGlzLmVsLm9mZnNldEhlaWdodDtcbiAgICBsZXQgcGVyY2VudFNjcm9sbDogbnVtYmVyO1xuICAgIGxldCBvdmVyID0gbnVsbDtcblxuICAgIGlmIChpc1doZWVsKSB7XG4gICAgICBkZWx0YSA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUodGhpcy5iYXIpLnRvcCwgMTApICsgeSAqIDIwIC8gMTAwICogdGhpcy5iYXIub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICBpZiAoZGVsdGEgPCAwIHx8IGRlbHRhID4gbWF4VG9wKSB7XG4gICAgICAgIG92ZXIgPSBkZWx0YSA+IG1heFRvcCA/IGRlbHRhIC0gbWF4VG9wIDogZGVsdGE7XG4gICAgICB9XG5cbiAgICAgIGRlbHRhID0gTWF0aC5taW4oTWF0aC5tYXgoZGVsdGEsIDApLCBtYXhUb3ApO1xuICAgICAgZGVsdGEgPSAoeSA+IDApID8gTWF0aC5jZWlsKGRlbHRhKSA6IE1hdGguZmxvb3IoZGVsdGEpO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJhciwgJ3RvcCcsIGRlbHRhICsgJ3B4Jyk7XG4gICAgfVxuXG4gICAgcGVyY2VudFNjcm9sbCA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUodGhpcy5iYXIpLnRvcCwgMTApIC8gKHRoaXMuZWwub2Zmc2V0SGVpZ2h0IC0gdGhpcy5iYXIub2Zmc2V0SGVpZ2h0KTtcbiAgICBkZWx0YSA9IHBlcmNlbnRTY3JvbGwgKiBoaWRkZW5Db250ZW50O1xuXG4gICAgdGhpcy5lbC5zY3JvbGxUb3AgPSBkZWx0YTtcblxuICAgIHRoaXMuc2hvd0JhckFuZEdyaWQoKTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLmFsd2F5c1Zpc2libGUpIHtcbiAgICAgIGlmICh0aGlzLnZpc2libGVUaW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnZpc2libGVUaW1lb3V0KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy52aXNpYmxlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmhpZGVCYXJBbmRHcmlkKCk7XG4gICAgICB9LCB0aGlzLm9wdGlvbnMudmlzaWJsZVRpbWVvdXQpO1xuICAgIH1cbiAgICBjb25zdCBpc1Njcm9sbEF0U3RhcnQgPSBkZWx0YSA9PT0gMDtcbiAgICBjb25zdCBpc1Njcm9sbEF0RW5kID0gZGVsdGEgPT09IGhpZGRlbkNvbnRlbnQ7XG4gICAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSBNYXRoLmNlaWwoZGVsdGEpO1xuICAgIGNvbnN0IHNjcm9sbFN0YXRlID0gbmV3IFNsaW1TY3JvbGxTdGF0ZSh7IHNjcm9sbFBvc2l0aW9uLCBpc1Njcm9sbEF0U3RhcnQsIGlzU2Nyb2xsQXRFbmQgfSk7XG4gICAgdGhpcy5zY3JvbGxDaGFuZ2VkLmVtaXQoc2Nyb2xsU3RhdGUpO1xuXG4gICAgcmV0dXJuIG92ZXI7XG4gIH1cblxuICBpbml0V2hlZWwgPSAoKSA9PiB7XG4gICAgY29uc3QgZG9tbW91c2VzY3JvbGwgPSBmcm9tRXZlbnQodGhpcy5lbCwgJ0RPTU1vdXNlU2Nyb2xsJyk7XG4gICAgY29uc3QgbW91c2V3aGVlbCA9IGZyb21FdmVudCh0aGlzLmVsLCAnbW91c2V3aGVlbCcpO1xuXG4gICAgY29uc3Qgd2hlZWxTdWJzY3JpcHRpb24gPSBtZXJnZSguLi5bZG9tbW91c2VzY3JvbGwsIG1vdXNld2hlZWxdKS5zdWJzY3JpYmUoKGU6IFdoZWVsRXZlbnQpID0+IHtcbiAgICAgIGxldCBkZWx0YSA9IDA7XG5cbiAgICAgIGlmICgoPGFueT5lKS53aGVlbERlbHRhKSB7XG4gICAgICAgIGRlbHRhID0gLSg8YW55PmUpLndoZWVsRGVsdGEgLyAxMjA7XG4gICAgICB9XG5cbiAgICAgIGlmIChlLmRldGFpbCkge1xuICAgICAgICBkZWx0YSA9IGUuZGV0YWlsIC8gMztcbiAgICAgIH1cblxuICAgICAgdGhpcy5zY3JvbGxDb250ZW50KGRlbHRhLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuaW50ZXJhY3Rpb25TdWJzY3JpcHRpb25zLmFkZCh3aGVlbFN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBpbml0RHJhZyA9ICgpID0+IHtcbiAgICBjb25zdCBiYXIgPSB0aGlzLmJhcjtcblxuICAgIGNvbnN0IG1vdXNlbW92ZSA9IGZyb21FdmVudCh0aGlzLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScpO1xuICAgIGNvbnN0IHRvdWNobW92ZSA9IGZyb21FdmVudCh0aGlzLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ3RvdWNobW92ZScpO1xuXG4gICAgY29uc3QgbW91c2Vkb3duID0gZnJvbUV2ZW50KGJhciwgJ21vdXNlZG93bicpO1xuICAgIGNvbnN0IHRvdWNoc3RhcnQgPSBmcm9tRXZlbnQodGhpcy5lbCwgJ3RvdWNoc3RhcnQnKTtcbiAgICBjb25zdCBtb3VzZXVwID0gZnJvbUV2ZW50KHRoaXMuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCAnbW91c2V1cCcpO1xuICAgIGNvbnN0IHRvdWNoZW5kID0gZnJvbUV2ZW50KHRoaXMuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCAndG91Y2hlbmQnKTtcblxuICAgIGNvbnN0IG1vdXNlZHJhZyA9IG1vdXNlZG93blxuICAgICAgLnBpcGUoXG4gICAgICAgIG1lcmdlTWFwKChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5wYWdlWSA9IGUucGFnZVk7XG4gICAgICAgICAgdGhpcy50b3AgPSBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoYmFyKS50b3ApO1xuXG4gICAgICAgICAgcmV0dXJuIG1vdXNlbW92ZVxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgIG1hcCgoZW1vdmU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBlbW92ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvcCArIGVtb3ZlLnBhZ2VZIC0gdGhpcy5wYWdlWTtcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIHRha2VVbnRpbChtb3VzZXVwKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBjb25zdCB0b3VjaGRyYWcgPSB0b3VjaHN0YXJ0XG4gICAgICAucGlwZShcbiAgICAgICAgbWVyZ2VNYXAoKGU6IFRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICB0aGlzLnBhZ2VZID0gZS50YXJnZXRUb3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgICAgIHRoaXMudG9wID0gLXBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZShiYXIpLnRvcCk7XG5cbiAgICAgICAgICByZXR1cm4gdG91Y2htb3ZlXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgbWFwKCh0bW92ZTogVG91Y2hFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAtKHRoaXMudG9wICsgdG1vdmUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWSAtIHRoaXMucGFnZVkpO1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgdGFrZVVudGlsKHRvdWNoZW5kKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBjb25zdCBkcmFnU3Vic2NyaXB0aW9uID0gbWVyZ2UoLi4uW21vdXNlZHJhZywgdG91Y2hkcmFnXSkuc3Vic2NyaWJlKCh0b3A6IG51bWJlcikgPT4ge1xuICAgICAgdGhpcy5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgdGhpcy5wcmV2ZW50RGVmYXVsdEV2ZW50LCBmYWxzZSk7XG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuYm9keSwgJ3RvdWNoLWFjdGlvbicsICdwYW4teScpO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJvZHksICd1c2VyLXNlbGVjdCcsICdub25lJyk7XG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuYmFyLCAndG9wJywgYCR7dG9wfXB4YCk7XG4gICAgICBjb25zdCBvdmVyID0gdGhpcy5zY3JvbGxDb250ZW50KDAsIHRydWUsIGZhbHNlKTtcbiAgICAgIGNvbnN0IG1heFRvcCA9IHRoaXMuZWwub2Zmc2V0SGVpZ2h0IC0gdGhpcy5iYXIub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICBpZiAob3ZlciAmJiBvdmVyIDwgMCAmJiAtb3ZlciA8PSBtYXhUb3ApIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmVsLCAncGFkZGluZ1RvcCcsIC1vdmVyICsgJ3B4Jyk7XG4gICAgICB9IGVsc2UgaWYgKG92ZXIgJiYgb3ZlciA+IDAgJiYgb3ZlciA8PSBtYXhUb3ApIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmVsLCAncGFkZGluZ0JvdHRvbScsIG92ZXIgKyAncHgnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGRyYWdFbmRTdWJzY3JpcHRpb24gPSBtZXJnZSguLi5bbW91c2V1cCwgdG91Y2hlbmRdKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgdGhpcy5wcmV2ZW50RGVmYXVsdEV2ZW50LCBmYWxzZSk7XG4gICAgICBjb25zdCBwYWRkaW5nVG9wID0gcGFyc2VJbnQodGhpcy5lbC5zdHlsZS5wYWRkaW5nVG9wLCAxMCk7XG4gICAgICBjb25zdCBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQodGhpcy5lbC5zdHlsZS5wYWRkaW5nQm90dG9tLCAxMCk7XG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuYm9keSwgJ3RvdWNoLWFjdGlvbicsICd1bnNldCcpO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJvZHksICd1c2VyLXNlbGVjdCcsICdkZWZhdWx0Jyk7XG5cbiAgICAgIGlmIChwYWRkaW5nVG9wID4gMCkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvKDAsIDMwMCwgJ2xpbmVhcicpO1xuICAgICAgfSBlbHNlIGlmIChwYWRkaW5nQm90dG9tID4gMCkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvKDAsIDMwMCwgJ2xpbmVhcicpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5pbnRlcmFjdGlvblN1YnNjcmlwdGlvbnMuYWRkKGRyYWdTdWJzY3JpcHRpb24pO1xuICAgIHRoaXMuaW50ZXJhY3Rpb25TdWJzY3JpcHRpb25zLmFkZChkcmFnRW5kU3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIHNob3dCYXJBbmRHcmlkKCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5ncmlkLCAnYmFja2dyb3VuZCcsIHRoaXMub3B0aW9ucy5ncmlkQmFja2dyb3VuZCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJhciwgJ2JhY2tncm91bmQnLCB0aGlzLm9wdGlvbnMuYmFyQmFja2dyb3VuZCk7XG4gIH1cblxuICBoaWRlQmFyQW5kR3JpZCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZ3JpZCwgJ2JhY2tncm91bmQnLCAndHJhbnNwYXJlbnQnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuYmFyLCAnYmFja2dyb3VuZCcsICd0cmFuc3BhcmVudCcpO1xuICB9XG5cbiAgcHJldmVudERlZmF1bHRFdmVudCA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVsLnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzbGltc2Nyb2xsLXdyYXBwZXInKSkge1xuICAgICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuZWwucGFyZW50RWxlbWVudDtcbiAgICAgIGNvbnN0IGJhciA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignLnNsaW1zY3JvbGwtYmFyJyk7XG4gICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKGJhcik7XG4gICAgICBjb25zdCBncmlkID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCcuc2xpbXNjcm9sbC1ncmlkJyk7XG4gICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKGdyaWQpO1xuICAgICAgdGhpcy51bndyYXAod3JhcHBlcik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW50ZXJhY3Rpb25TdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmludGVyYWN0aW9uU3Vic2NyaXB0aW9ucy51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVud3JhcCh3cmFwcGVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGRvY0ZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgd2hpbGUgKHdyYXBwZXIuZmlyc3RDaGlsZCkge1xuICAgICAgY29uc3QgY2hpbGQgPSB3cmFwcGVyLnJlbW92ZUNoaWxkKHdyYXBwZXIuZmlyc3RDaGlsZCk7XG4gICAgICBkb2NGcmFnLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG4gICAgd3JhcHBlci5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChkb2NGcmFnLCB3cmFwcGVyKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpyZXNpemUnLCBbJyRldmVudCddKVxuICBvblJlc2l6ZSgkZXZlbnQ6IGFueSkge1xuICAgIHRoaXMuZ2V0QmFySGVpZ2h0KCk7XG4gIH1cbn1cbiJdfQ==