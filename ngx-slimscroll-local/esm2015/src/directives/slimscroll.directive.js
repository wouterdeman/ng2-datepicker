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
import { DOCUMENT } from '@angular/common';
import { Directive, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, Output, Renderer2, SimpleChanges, ViewContainerRef } from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { SlimScrollOptions, SLIMSCROLL_DEFAULTS } from '../classes/slimscroll-options.class';
import { SlimScrollState } from '../classes/slimscroll-state.class';
const ɵ0 = (t) => t, ɵ1 = (t) => t * t, ɵ2 = (t) => t * (2 - t), ɵ3 = (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t, ɵ4 = (t) => t * t * t, ɵ5 = (t) => (--t) * t * t + 1, ɵ6 = (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, ɵ7 = (t) => t * t * t * t, ɵ8 = (t) => 1 - (--t) * t * t * t, ɵ9 = (t) => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t, ɵ10 = (t) => t * t * t * t * t, ɵ11 = (t) => 1 + (--t) * t * t * t * t, ɵ12 = (t) => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
export const easing = {
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
let SlimScrollDirective = class SlimScrollDirective {
    constructor(viewContainer, renderer, document, optionsDefaults) {
        this.viewContainer = viewContainer;
        this.renderer = renderer;
        this.document = document;
        this.optionsDefaults = optionsDefaults;
        this.enabled = true;
        this.scrollChanged = new EventEmitter();
        this.barVisibilityChange = new EventEmitter();
        this.initWheel = () => {
            const dommousescroll = fromEvent(this.el, 'DOMMouseScroll');
            const mousewheel = fromEvent(this.el, 'mousewheel');
            const wheelSubscription = merge(...[dommousescroll, mousewheel]).subscribe((e) => {
                let delta = 0;
                if (e.wheelDelta) {
                    delta = -e.wheelDelta / 120;
                }
                if (e.detail) {
                    delta = e.detail / 3;
                }
                this.scrollContent(delta, true, false);
                if (e.preventDefault) {
                    e.preventDefault();
                }
            });
            this.interactionSubscriptions.add(wheelSubscription);
        };
        this.initDrag = () => {
            const bar = this.bar;
            const mousemove = fromEvent(this.document.documentElement, 'mousemove');
            const touchmove = fromEvent(this.document.documentElement, 'touchmove');
            const mousedown = fromEvent(bar, 'mousedown');
            const touchstart = fromEvent(this.el, 'touchstart');
            const mouseup = fromEvent(this.document.documentElement, 'mouseup');
            const touchend = fromEvent(this.document.documentElement, 'touchend');
            const mousedrag = mousedown
                .pipe(mergeMap((e) => {
                this.pageY = e.pageY;
                this.top = parseFloat(getComputedStyle(bar).top);
                return mousemove
                    .pipe(map((emove) => {
                    emove.preventDefault();
                    return this.top + emove.pageY - this.pageY;
                }), takeUntil(mouseup));
            }));
            const touchdrag = touchstart
                .pipe(mergeMap((e) => {
                this.pageY = e.targetTouches[0].pageY;
                this.top = -parseFloat(getComputedStyle(bar).top);
                return touchmove
                    .pipe(map((tmove) => {
                    return -(this.top + tmove.targetTouches[0].pageY - this.pageY);
                }), takeUntil(touchend));
            }));
            const dragSubscription = merge(...[mousedrag, touchdrag]).subscribe((top) => {
                this.body.addEventListener('selectstart', this.preventDefaultEvent, false);
                this.renderer.setStyle(this.body, 'touch-action', 'pan-y');
                this.renderer.setStyle(this.body, 'user-select', 'none');
                this.renderer.setStyle(this.bar, 'top', `${top}px`);
                const over = this.scrollContent(0, true, false);
                const maxTop = this.el.offsetHeight - this.bar.offsetHeight;
                if (over && over < 0 && -over <= maxTop) {
                    this.renderer.setStyle(this.el, 'paddingTop', -over + 'px');
                }
                else if (over && over > 0 && over <= maxTop) {
                    this.renderer.setStyle(this.el, 'paddingBottom', over + 'px');
                }
            });
            const dragEndSubscription = merge(...[mouseup, touchend]).subscribe(() => {
                this.body.removeEventListener('selectstart', this.preventDefaultEvent, false);
                const paddingTop = parseInt(this.el.style.paddingTop, 10);
                const paddingBottom = parseInt(this.el.style.paddingBottom, 10);
                this.renderer.setStyle(this.body, 'touch-action', 'unset');
                this.renderer.setStyle(this.body, 'user-select', 'default');
                if (paddingTop > 0) {
                    this.scrollTo(0, 300, 'linear');
                }
                else if (paddingBottom > 0) {
                    this.scrollTo(0, 300, 'linear');
                }
            });
            this.interactionSubscriptions.add(dragSubscription);
            this.interactionSubscriptions.add(dragEndSubscription);
        };
        this.preventDefaultEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        this.viewContainer = viewContainer;
        this.el = viewContainer.element.nativeElement;
        this.body = this.document.querySelector('body');
        this.mutationThrottleTimeout = 50;
    }
    ngOnInit() {
        // setup if no changes for enabled for the first time
        if (!this.interactionSubscriptions && this.enabled) {
            this.setup();
        }
    }
    ngOnChanges(changes) {
        if (changes.enabled) {
            if (this.enabled) {
                this.setup();
            }
            else {
                this.destroy();
            }
        }
    }
    ngOnDestroy() {
        this.destroy();
    }
    setup() {
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
            this.mutationObserver = new MutationObserver(() => {
                if (this.mutationThrottleTimeout) {
                    clearTimeout(this.mutationThrottleTimeout);
                    this.mutationThrottleTimeout = setTimeout(this.onMutation.bind(this), 50);
                }
            });
            this.mutationObserver.observe(this.el, { subtree: true, childList: true });
        }
        if (this.scrollEvents && this.scrollEvents instanceof EventEmitter) {
            const scrollSubscription = this.scrollEvents.subscribe((event) => this.handleEvent(event));
            this.interactionSubscriptions.add(scrollSubscription);
        }
    }
    handleEvent(e) {
        if (e.type === 'scrollToBottom') {
            const y = this.el.scrollHeight - this.el.clientHeight;
            this.scrollTo(y, e.duration, e.easing);
        }
        else if (e.type === 'scrollToTop') {
            const y = 0;
            this.scrollTo(y, e.duration, e.easing);
        }
        else if (e.type === 'scrollToPercent' && (e.percent >= 0 && e.percent <= 100)) {
            const y = Math.round(((this.el.scrollHeight - this.el.clientHeight) / 100) * e.percent);
            this.scrollTo(y, e.duration, e.easing);
        }
        else if (e.type === 'scrollTo') {
            const y = e.y;
            if (y <= this.el.scrollHeight - this.el.clientHeight && y >= 0) {
                this.scrollTo(y, e.duration, e.easing);
            }
        }
        else if (e.type === 'recalculate') {
            this.getBarHeight();
        }
    }
    setStyle() {
        const el = this.el;
        this.renderer.setStyle(el, 'overflow', 'hidden');
        this.renderer.setStyle(el, 'position', 'relative');
        this.renderer.setStyle(el, 'display', 'block');
    }
    onMutation() {
        this.getBarHeight();
    }
    wrapContainer() {
        this.wrapper = this.renderer.createElement('div');
        const wrapper = this.wrapper;
        const el = this.el;
        this.renderer.addClass(wrapper, 'slimscroll-wrapper');
        this.renderer.setStyle(wrapper, 'position', 'relative');
        this.renderer.setStyle(wrapper, 'overflow', 'hidden');
        this.renderer.setStyle(wrapper, 'display', 'inline-block');
        this.renderer.setStyle(wrapper, 'margin', getComputedStyle(el).margin);
        this.renderer.setStyle(wrapper, 'width', '100%');
        this.renderer.setStyle(wrapper, 'height', getComputedStyle(el).height);
        this.renderer.insertBefore(el.parentNode, wrapper, el);
        this.renderer.appendChild(wrapper, el);
    }
    initGrid() {
        this.grid = this.renderer.createElement('div');
        const grid = this.grid;
        this.renderer.addClass(grid, 'slimscroll-grid');
        this.renderer.setStyle(grid, 'position', 'absolute');
        this.renderer.setStyle(grid, 'top', '0');
        this.renderer.setStyle(grid, 'bottom', '0');
        this.renderer.setStyle(grid, this.options.position, '0');
        this.renderer.setStyle(grid, 'width', `${this.options.gridWidth}px`);
        this.renderer.setStyle(grid, 'background', this.options.gridBackground);
        this.renderer.setStyle(grid, 'opacity', this.options.gridOpacity);
        this.renderer.setStyle(grid, 'display', 'block');
        this.renderer.setStyle(grid, 'cursor', 'pointer');
        this.renderer.setStyle(grid, 'z-index', '99');
        this.renderer.setStyle(grid, 'border-radius', `${this.options.gridBorderRadius}px`);
        this.renderer.setStyle(grid, 'margin', this.options.gridMargin);
        this.renderer.appendChild(this.wrapper, grid);
    }
    initBar() {
        this.bar = this.renderer.createElement('div');
        const bar = this.bar;
        this.renderer.addClass(bar, 'slimscroll-bar');
        this.renderer.setStyle(bar, 'position', 'absolute');
        this.renderer.setStyle(bar, 'top', '0');
        this.renderer.setStyle(bar, this.options.position, '0');
        this.renderer.setStyle(bar, 'width', `${this.options.barWidth}px`);
        this.renderer.setStyle(bar, 'background', this.options.barBackground);
        this.renderer.setStyle(bar, 'opacity', this.options.barOpacity);
        this.renderer.setStyle(bar, 'display', 'block');
        this.renderer.setStyle(bar, 'cursor', 'pointer');
        this.renderer.setStyle(bar, 'z-index', '100');
        this.renderer.setStyle(bar, 'border-radius', `${this.options.barBorderRadius}px`);
        this.renderer.setStyle(bar, 'margin', this.options.barMargin);
        this.renderer.appendChild(this.wrapper, bar);
        this.barVisibilityChange.emit(true);
    }
    getBarHeight() {
        const elHeight = this.el.offsetHeight;
        const barHeight = Math.max((elHeight / this.el.scrollHeight) * elHeight, 30) + 'px';
        const display = parseInt(barHeight, 10) === elHeight ? 'none' : 'block';
        if (this.wrapper.offsetHeight !== elHeight) {
            this.renderer.setStyle(this.wrapper, 'height', elHeight + 'px');
        }
        this.renderer.setStyle(this.bar, 'height', barHeight);
        this.renderer.setStyle(this.bar, 'display', display);
        this.renderer.setStyle(this.grid, 'display', display);
        this.barVisibilityChange.emit(display !== 'none');
    }
    scrollTo(y, duration, easingFunc) {
        const start = Date.now();
        const from = this.el.scrollTop;
        const maxTop = this.el.offsetHeight - this.bar.offsetHeight;
        const maxElScrollTop = this.el.scrollHeight - this.el.clientHeight;
        const barHeight = Math.max((this.el.offsetHeight / this.el.scrollHeight) * this.el.offsetHeight, 30);
        const paddingTop = parseInt(this.el.style.paddingTop, 10) || 0;
        const paddingBottom = parseInt(this.el.style.paddingBottom, 10) || 0;
        const scroll = (timestamp) => {
            const currentTime = Date.now();
            const time = Math.min(1, ((currentTime - start) / duration));
            const easedTime = easing[easingFunc](time);
            if (paddingTop > 0 || paddingBottom > 0) {
                let fromY = null;
                if (paddingTop > 0) {
                    fromY = -paddingTop;
                    fromY = -((easedTime * (y - fromY)) + fromY);
                    this.renderer.setStyle(this.el, 'paddingTop', `${fromY}px`);
                }
                if (paddingBottom > 0) {
                    fromY = paddingBottom;
                    fromY = ((easedTime * (y - fromY)) + fromY);
                    this.renderer.setStyle(this.el, 'paddingBottom', `${fromY}px`);
                }
            }
            else {
                this.el.scrollTop = (easedTime * (y - from)) + from;
            }
            const percentScroll = this.el.scrollTop / maxElScrollTop;
            if (paddingBottom === 0) {
                const delta = Math.round(Math.round(this.el.clientHeight * percentScroll) - barHeight);
                if (delta > 0) {
                    this.renderer.setStyle(this.bar, 'top', `${delta}px`);
                }
            }
            if (time < 1) {
                requestAnimationFrame(scroll);
            }
        };
        requestAnimationFrame(scroll);
    }
    scrollContent(y, isWheel, isJump) {
        let delta = y;
        const maxTop = this.el.offsetHeight - this.bar.offsetHeight;
        const hiddenContent = this.el.scrollHeight - this.el.offsetHeight;
        let percentScroll;
        let over = null;
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
            this.visibleTimeout = setTimeout(() => {
                this.hideBarAndGrid();
            }, this.options.visibleTimeout);
        }
        const isScrollAtStart = delta === 0;
        const isScrollAtEnd = delta === hiddenContent;
        const scrollPosition = Math.ceil(delta);
        const scrollState = new SlimScrollState({ scrollPosition, isScrollAtStart, isScrollAtEnd });
        this.scrollChanged.emit(scrollState);
        return over;
    }
    showBarAndGrid() {
        this.renderer.setStyle(this.grid, 'background', this.options.gridBackground);
        this.renderer.setStyle(this.bar, 'background', this.options.barBackground);
    }
    hideBarAndGrid() {
        this.renderer.setStyle(this.grid, 'background', 'transparent');
        this.renderer.setStyle(this.bar, 'background', 'transparent');
    }
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        if (this.el.parentElement.classList.contains('slimscroll-wrapper')) {
            const wrapper = this.el.parentElement;
            const bar = wrapper.querySelector('.slimscroll-bar');
            wrapper.removeChild(bar);
            const grid = wrapper.querySelector('.slimscroll-grid');
            wrapper.removeChild(grid);
            this.unwrap(wrapper);
        }
        if (this.interactionSubscriptions) {
            this.interactionSubscriptions.unsubscribe();
        }
    }
    unwrap(wrapper) {
        const docFrag = document.createDocumentFragment();
        while (wrapper.firstChild) {
            const child = wrapper.removeChild(wrapper.firstChild);
            docFrag.appendChild(child);
        }
        wrapper.parentNode.replaceChild(docFrag, wrapper);
    }
    onResize($event) {
        this.getBarHeight();
    }
};
SlimScrollDirective.ctorParameters = () => [
    { type: ViewContainerRef, decorators: [{ type: Inject, args: [ViewContainerRef,] }] },
    { type: Renderer2, decorators: [{ type: Inject, args: [Renderer2,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [SLIMSCROLL_DEFAULTS,] }, { type: Optional }] }
];
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
export { SlimScrollDirective };
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, ɵ11, ɵ12 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpbXNjcm9sbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtc2xpbXNjcm9sbC8iLCJzb3VyY2VzIjpbInNyYy9kaXJlY3RpdmVzL3NsaW1zY3JvbGwuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDakwsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTFELE9BQU8sRUFBc0IsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNqSCxPQUFPLEVBQW9CLGVBQWUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO1dBRzVFLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQ2hCLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUNuQixDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUN4QixDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQzFELENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FDdkIsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FDOUIsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQ2xGLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQzNCLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUNsQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQ3hFLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUMvQixDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFB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QSxRQUFRLEVBQUUsQ0FBQTtxQ0FIUyxnQkFBZ0I7UUFDNUIsU0FBUztHQXRCckMsbUJBQW1CLENBdWIvQjtTQXZiWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBEaXJlY3RpdmUsIEV2ZW50RW1pdHRlciwgSG9zdExpc3RlbmVyLCBJbmplY3QsIElucHV0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT25Jbml0LCBPcHRpb25hbCwgT3V0cHV0LCBSZW5kZXJlcjIsIFNpbXBsZUNoYW5nZXMsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGZyb21FdmVudCwgbWVyZ2UsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwLCBtZXJnZU1hcCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgSVNsaW1TY3JvbGxFdmVudCwgU2xpbVNjcm9sbEV2ZW50IH0gZnJvbSAnLi4vY2xhc3Nlcy9zbGltc2Nyb2xsLWV2ZW50LmNsYXNzJztcbmltcG9ydCB7IElTbGltU2Nyb2xsT3B0aW9ucywgU2xpbVNjcm9sbE9wdGlvbnMsIFNMSU1TQ1JPTExfREVGQVVMVFMgfSBmcm9tICcuLi9jbGFzc2VzL3NsaW1zY3JvbGwtb3B0aW9ucy5jbGFzcyc7XG5pbXBvcnQgeyBJU2xpbVNjcm9sbFN0YXRlLCBTbGltU2Nyb2xsU3RhdGUgfSBmcm9tICcuLi9jbGFzc2VzL3NsaW1zY3JvbGwtc3RhdGUuY2xhc3MnO1xuXG5leHBvcnQgY29uc3QgZWFzaW5nOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7XG4gIGxpbmVhcjogKHQ6IG51bWJlcikgPT4gdCxcbiAgaW5RdWFkOiAodDogbnVtYmVyKSA9PiB0ICogdCxcbiAgb3V0UXVhZDogKHQ6IG51bWJlcikgPT4gdCAqICgyIC0gdCksXG4gIGluT3V0UXVhZDogKHQ6IG51bWJlcikgPT4gdCA8IC41ID8gMiAqIHQgKiB0IDogLTEgKyAoNCAtIDIgKiB0KSAqIHQsXG4gIGluQ3ViaWM6ICh0OiBudW1iZXIpID0+IHQgKiB0ICogdCxcbiAgb3V0Q3ViaWM6ICh0OiBudW1iZXIpID0+ICgtLXQpICogdCAqIHQgKyAxLFxuICBpbk91dEN1YmljOiAodDogbnVtYmVyKSA9PiB0IDwgLjUgPyA0ICogdCAqIHQgKiB0IDogKHQgLSAxKSAqICgyICogdCAtIDIpICogKDIgKiB0IC0gMikgKyAxLFxuICBpblF1YXJ0OiAodDogbnVtYmVyKSA9PiB0ICogdCAqIHQgKiB0LFxuICBvdXRRdWFydDogKHQ6IG51bWJlcikgPT4gMSAtICgtLXQpICogdCAqIHQgKiB0LFxuICBpbk91dFF1YXJ0OiAodDogbnVtYmVyKSA9PiB0IDwgLjUgPyA4ICogdCAqIHQgKiB0ICogdCA6IDEgLSA4ICogKC0tdCkgKiB0ICogdCAqIHQsXG4gIGluUXVpbnQ6ICh0OiBudW1iZXIpID0+IHQgKiB0ICogdCAqIHQgKiB0LFxuICBvdXRRdWludDogKHQ6IG51bWJlcikgPT4gMSArICgtLXQpICogdCAqIHQgKiB0ICogdCxcbiAgaW5PdXRRdWludDogKHQ6IG51bWJlcikgPT4gdCA8IC41ID8gMTYgKiB0ICogdCAqIHQgKiB0ICogdCA6IDEgKyAxNiAqICgtLXQpICogdCAqIHQgKiB0ICogdFxufTtcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3NsaW1TY3JvbGxdJywgLy8gdHNsaW50OmRpc2FibGUtbGluZVxuICBleHBvcnRBczogJ3NsaW1TY3JvbGwnXG59KVxuZXhwb3J0IGNsYXNzIFNsaW1TY3JvbGxEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZW5hYmxlZCA9IHRydWU7XG4gIEBJbnB1dCgpIG9wdGlvbnM6IFNsaW1TY3JvbGxPcHRpb25zO1xuICBASW5wdXQoKSBzY3JvbGxFdmVudHM6IEV2ZW50RW1pdHRlcjxJU2xpbVNjcm9sbEV2ZW50PjtcbiAgQE91dHB1dCgpIHNjcm9sbENoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyPElTbGltU2Nyb2xsU3RhdGU+KCk7XG4gIEBPdXRwdXQoKSBiYXJWaXNpYmlsaXR5Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIGVsOiBIVE1MRWxlbWVudDtcbiAgd3JhcHBlcjogSFRNTEVsZW1lbnQ7XG4gIGdyaWQ6IEhUTUxFbGVtZW50O1xuICBiYXI6IEhUTUxFbGVtZW50O1xuICBib2R5OiBIVE1MRWxlbWVudDtcbiAgcGFnZVk6IG51bWJlcjtcbiAgdG9wOiBudW1iZXI7XG4gIGRyYWdnaW5nOiBib29sZWFuO1xuICBtdXRhdGlvblRocm90dGxlVGltZW91dDogbnVtYmVyIHwgYW55O1xuICBtdXRhdGlvbk9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyO1xuICBsYXN0VG91Y2hQb3NpdGlvblk6IG51bWJlcjtcbiAgdmlzaWJsZVRpbWVvdXQ6IGFueTtcbiAgaW50ZXJhY3Rpb25TdWJzY3JpcHRpb25zOiBTdWJzY3JpcHRpb247XG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoVmlld0NvbnRhaW5lclJlZikgcHJpdmF0ZSB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIEBJbmplY3QoUmVuZGVyZXIyKSBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2N1bWVudDogYW55LFxuICAgIEBJbmplY3QoU0xJTVNDUk9MTF9ERUZBVUxUUykgQE9wdGlvbmFsKCkgcHJpdmF0ZSBvcHRpb25zRGVmYXVsdHM6IElTbGltU2Nyb2xsT3B0aW9uc1xuICApIHtcbiAgICB0aGlzLnZpZXdDb250YWluZXIgPSB2aWV3Q29udGFpbmVyO1xuICAgIHRoaXMuZWwgPSB2aWV3Q29udGFpbmVyLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcbiAgICB0aGlzLmJvZHkgPSB0aGlzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbiAgICB0aGlzLm11dGF0aW9uVGhyb3R0bGVUaW1lb3V0ID0gNTA7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBzZXR1cCBpZiBubyBjaGFuZ2VzIGZvciBlbmFibGVkIGZvciB0aGUgZmlyc3QgdGltZVxuICAgIGlmICghdGhpcy5pbnRlcmFjdGlvblN1YnNjcmlwdGlvbnMgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLnNldHVwKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzLmVuYWJsZWQpIHtcbiAgICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgdGhpcy5zZXR1cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cblxuICBzZXR1cCgpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICBpZiAodGhpcy5vcHRpb25zRGVmYXVsdHMpIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBTbGltU2Nyb2xsT3B0aW9ucyh0aGlzLm9wdGlvbnNEZWZhdWx0cykubWVyZ2UodGhpcy5vcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0gbmV3IFNsaW1TY3JvbGxPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdHlsZSgpO1xuICAgIHRoaXMud3JhcENvbnRhaW5lcigpO1xuICAgIHRoaXMuaW5pdEdyaWQoKTtcbiAgICB0aGlzLmluaXRCYXIoKTtcbiAgICB0aGlzLmdldEJhckhlaWdodCgpO1xuICAgIHRoaXMuaW5pdFdoZWVsKCk7XG4gICAgdGhpcy5pbml0RHJhZygpO1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuYWx3YXlzVmlzaWJsZSkge1xuICAgICAgdGhpcy5oaWRlQmFyQW5kR3JpZCgpO1xuICAgIH1cblxuICAgIGlmIChNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICBpZiAodGhpcy5tdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHRoaXMubXV0YXRpb25PYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLm11dGF0aW9uVGhyb3R0bGVUaW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMubXV0YXRpb25UaHJvdHRsZVRpbWVvdXQpO1xuICAgICAgICAgIHRoaXMubXV0YXRpb25UaHJvdHRsZVRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMub25NdXRhdGlvbi5iaW5kKHRoaXMpLCA1MCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUodGhpcy5lbCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsRXZlbnRzICYmIHRoaXMuc2Nyb2xsRXZlbnRzIGluc3RhbmNlb2YgRXZlbnRFbWl0dGVyKSB7XG4gICAgICBjb25zdCBzY3JvbGxTdWJzY3JpcHRpb24gPSB0aGlzLnNjcm9sbEV2ZW50cy5zdWJzY3JpYmUoKGV2ZW50OiBTbGltU2Nyb2xsRXZlbnQpID0+IHRoaXMuaGFuZGxlRXZlbnQoZXZlbnQpKTtcbiAgICAgIHRoaXMuaW50ZXJhY3Rpb25TdWJzY3JpcHRpb25zLmFkZChzY3JvbGxTdWJzY3JpcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV2ZW50KGU6IFNsaW1TY3JvbGxFdmVudCk6IHZvaWQge1xuICAgIGlmIChlLnR5cGUgPT09ICdzY3JvbGxUb0JvdHRvbScpIHtcbiAgICAgIGNvbnN0IHkgPSB0aGlzLmVsLnNjcm9sbEhlaWdodCAtIHRoaXMuZWwuY2xpZW50SGVpZ2h0O1xuICAgICAgdGhpcy5zY3JvbGxUbyh5LCBlLmR1cmF0aW9uLCBlLmVhc2luZyk7XG4gICAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdzY3JvbGxUb1RvcCcpIHtcbiAgICAgIGNvbnN0IHkgPSAwO1xuICAgICAgdGhpcy5zY3JvbGxUbyh5LCBlLmR1cmF0aW9uLCBlLmVhc2luZyk7XG4gICAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdzY3JvbGxUb1BlcmNlbnQnICYmIChlLnBlcmNlbnQgPj0gMCAmJiBlLnBlcmNlbnQgPD0gMTAwKSkge1xuICAgICAgY29uc3QgeSA9IE1hdGgucm91bmQoKCh0aGlzLmVsLnNjcm9sbEhlaWdodCAtIHRoaXMuZWwuY2xpZW50SGVpZ2h0KSAvIDEwMCkgKiBlLnBlcmNlbnQpO1xuICAgICAgdGhpcy5zY3JvbGxUbyh5LCBlLmR1cmF0aW9uLCBlLmVhc2luZyk7XG4gICAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdzY3JvbGxUbycpIHtcbiAgICAgIGNvbnN0IHkgPSBlLnk7XG4gICAgICBpZiAoeSA8PSB0aGlzLmVsLnNjcm9sbEhlaWdodCAtIHRoaXMuZWwuY2xpZW50SGVpZ2h0ICYmIHkgPj0gMCkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvKHksIGUuZHVyYXRpb24sIGUuZWFzaW5nKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGUudHlwZSA9PT0gJ3JlY2FsY3VsYXRlJykge1xuICAgICAgdGhpcy5nZXRCYXJIZWlnaHQoKTtcbiAgICB9XG4gIH1cblxuICBzZXRTdHlsZSgpOiB2b2lkIHtcbiAgICBjb25zdCBlbCA9IHRoaXMuZWw7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShlbCwgJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZWwsICdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZWwsICdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gIH1cblxuICBvbk11dGF0aW9uKCkge1xuICAgIHRoaXMuZ2V0QmFySGVpZ2h0KCk7XG4gIH1cblxuICB3cmFwQ29udGFpbmVyKCk6IHZvaWQge1xuICAgIHRoaXMud3JhcHBlciA9IHRoaXMucmVuZGVyZXIuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMud3JhcHBlcjtcbiAgICBjb25zdCBlbCA9IHRoaXMuZWw7XG5cbiAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHdyYXBwZXIsICdzbGltc2Nyb2xsLXdyYXBwZXInKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHdyYXBwZXIsICdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUod3JhcHBlciwgJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUod3JhcHBlciwgJ2Rpc3BsYXknLCAnaW5saW5lLWJsb2NrJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh3cmFwcGVyLCAnbWFyZ2luJywgZ2V0Q29tcHV0ZWRTdHlsZShlbCkubWFyZ2luKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHdyYXBwZXIsICd3aWR0aCcsICcxMDAlJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh3cmFwcGVyLCAnaGVpZ2h0JywgZ2V0Q29tcHV0ZWRTdHlsZShlbCkuaGVpZ2h0KTtcblxuICAgIHRoaXMucmVuZGVyZXIuaW5zZXJ0QmVmb3JlKGVsLnBhcmVudE5vZGUsIHdyYXBwZXIsIGVsKTtcbiAgICB0aGlzLnJlbmRlcmVyLmFwcGVuZENoaWxkKHdyYXBwZXIsIGVsKTtcbiAgfVxuXG4gIGluaXRHcmlkKCk6IHZvaWQge1xuICAgIHRoaXMuZ3JpZCA9IHRoaXMucmVuZGVyZXIuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgZ3JpZCA9IHRoaXMuZ3JpZDtcblxuICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3MoZ3JpZCwgJ3NsaW1zY3JvbGwtZ3JpZCcpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShncmlkLCAndG9wJywgJzAnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGdyaWQsICdib3R0b20nLCAnMCcpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgdGhpcy5vcHRpb25zLnBvc2l0aW9uLCAnMCcpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ3dpZHRoJywgYCR7dGhpcy5vcHRpb25zLmdyaWRXaWR0aH1weGApO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ2JhY2tncm91bmQnLCB0aGlzLm9wdGlvbnMuZ3JpZEJhY2tncm91bmQpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ29wYWNpdHknLCB0aGlzLm9wdGlvbnMuZ3JpZE9wYWNpdHkpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGdyaWQsICdjdXJzb3InLCAncG9pbnRlcicpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZ3JpZCwgJ3otaW5kZXgnLCAnOTknKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGdyaWQsICdib3JkZXItcmFkaXVzJywgYCR7dGhpcy5vcHRpb25zLmdyaWRCb3JkZXJSYWRpdXN9cHhgKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGdyaWQsICdtYXJnaW4nLCB0aGlzLm9wdGlvbnMuZ3JpZE1hcmdpbik7XG5cbiAgICB0aGlzLnJlbmRlcmVyLmFwcGVuZENoaWxkKHRoaXMud3JhcHBlciwgZ3JpZCk7XG4gIH1cblxuICBpbml0QmFyKCk6IHZvaWQge1xuICAgIHRoaXMuYmFyID0gdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBiYXIgPSB0aGlzLmJhcjtcblxuICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3MoYmFyLCAnc2xpbXNjcm9sbC1iYXInKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsICd0b3AnLCAnMCcpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoYmFyLCB0aGlzLm9wdGlvbnMucG9zaXRpb24sICcwJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsICd3aWR0aCcsIGAke3RoaXMub3B0aW9ucy5iYXJXaWR0aH1weGApO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoYmFyLCAnYmFja2dyb3VuZCcsIHRoaXMub3B0aW9ucy5iYXJCYWNrZ3JvdW5kKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ29wYWNpdHknLCB0aGlzLm9wdGlvbnMuYmFyT3BhY2l0eSk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsICdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsICdjdXJzb3InLCAncG9pbnRlcicpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoYmFyLCAnei1pbmRleCcsICcxMDAnKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGJhciwgJ2JvcmRlci1yYWRpdXMnLCBgJHt0aGlzLm9wdGlvbnMuYmFyQm9yZGVyUmFkaXVzfXB4YCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShiYXIsICdtYXJnaW4nLCB0aGlzLm9wdGlvbnMuYmFyTWFyZ2luKTtcblxuICAgIHRoaXMucmVuZGVyZXIuYXBwZW5kQ2hpbGQodGhpcy53cmFwcGVyLCBiYXIpO1xuICAgIHRoaXMuYmFyVmlzaWJpbGl0eUNoYW5nZS5lbWl0KHRydWUpO1xuICB9XG5cbiAgZ2V0QmFySGVpZ2h0KCk6IHZvaWQge1xuICAgIGNvbnN0IGVsSGVpZ2h0ID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG4gICAgY29uc3QgYmFySGVpZ2h0ID0gTWF0aC5tYXgoKGVsSGVpZ2h0IC8gdGhpcy5lbC5zY3JvbGxIZWlnaHQpICogZWxIZWlnaHQsIDMwKSArICdweCc7XG4gICAgY29uc3QgZGlzcGxheSA9IHBhcnNlSW50KGJhckhlaWdodCwgMTApID09PSBlbEhlaWdodCA/ICdub25lJyA6ICdibG9jayc7XG5cbiAgICBpZiAodGhpcy53cmFwcGVyLm9mZnNldEhlaWdodCAhPT0gZWxIZWlnaHQpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy53cmFwcGVyLCAnaGVpZ2h0JywgZWxIZWlnaHQgKyAncHgnKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuYmFyLCAnaGVpZ2h0JywgYmFySGVpZ2h0KTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuYmFyLCAnZGlzcGxheScsIGRpc3BsYXkpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5ncmlkLCAnZGlzcGxheScsIGRpc3BsYXkpO1xuICAgIHRoaXMuYmFyVmlzaWJpbGl0eUNoYW5nZS5lbWl0KGRpc3BsYXkgIT09ICdub25lJyk7XG4gIH1cblxuICBzY3JvbGxUbyh5OiBudW1iZXIsIGR1cmF0aW9uOiBudW1iZXIsIGVhc2luZ0Z1bmM6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBmcm9tID0gdGhpcy5lbC5zY3JvbGxUb3A7XG4gICAgY29uc3QgbWF4VG9wID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQgLSB0aGlzLmJhci5vZmZzZXRIZWlnaHQ7XG4gICAgY29uc3QgbWF4RWxTY3JvbGxUb3AgPSB0aGlzLmVsLnNjcm9sbEhlaWdodCAtIHRoaXMuZWwuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IGJhckhlaWdodCA9IE1hdGgubWF4KCh0aGlzLmVsLm9mZnNldEhlaWdodCAvIHRoaXMuZWwuc2Nyb2xsSGVpZ2h0KSAqIHRoaXMuZWwub2Zmc2V0SGVpZ2h0LCAzMCk7XG4gICAgY29uc3QgcGFkZGluZ1RvcCA9IHBhcnNlSW50KHRoaXMuZWwuc3R5bGUucGFkZGluZ1RvcCwgMTApIHx8IDA7XG4gICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KHRoaXMuZWwuc3R5bGUucGFkZGluZ0JvdHRvbSwgMTApIHx8IDA7XG5cbiAgICBjb25zdCBzY3JvbGwgPSAodGltZXN0YW1wOiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIGNvbnN0IHRpbWUgPSBNYXRoLm1pbigxLCAoKGN1cnJlbnRUaW1lIC0gc3RhcnQpIC8gZHVyYXRpb24pKTtcbiAgICAgIGNvbnN0IGVhc2VkVGltZSA9IGVhc2luZ1tlYXNpbmdGdW5jXSh0aW1lKTtcblxuICAgICAgaWYgKHBhZGRpbmdUb3AgPiAwIHx8IHBhZGRpbmdCb3R0b20gPiAwKSB7XG4gICAgICAgIGxldCBmcm9tWSA9IG51bGw7XG5cbiAgICAgICAgaWYgKHBhZGRpbmdUb3AgPiAwKSB7XG4gICAgICAgICAgZnJvbVkgPSAtcGFkZGluZ1RvcDtcbiAgICAgICAgICBmcm9tWSA9IC0oKGVhc2VkVGltZSAqICh5IC0gZnJvbVkpKSArIGZyb21ZKTtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWwsICdwYWRkaW5nVG9wJywgYCR7ZnJvbVl9cHhgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5nQm90dG9tID4gMCkge1xuICAgICAgICAgIGZyb21ZID0gcGFkZGluZ0JvdHRvbTtcbiAgICAgICAgICBmcm9tWSA9ICgoZWFzZWRUaW1lICogKHkgLSBmcm9tWSkpICsgZnJvbVkpO1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbCwgJ3BhZGRpbmdCb3R0b20nLCBgJHtmcm9tWX1weGApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsLnNjcm9sbFRvcCA9IChlYXNlZFRpbWUgKiAoeSAtIGZyb20pKSArIGZyb207XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBlcmNlbnRTY3JvbGwgPSB0aGlzLmVsLnNjcm9sbFRvcCAvIG1heEVsU2Nyb2xsVG9wO1xuICAgICAgaWYgKHBhZGRpbmdCb3R0b20gPT09IDApIHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBNYXRoLnJvdW5kKE1hdGgucm91bmQodGhpcy5lbC5jbGllbnRIZWlnaHQgKiBwZXJjZW50U2Nyb2xsKSAtIGJhckhlaWdodCk7XG4gICAgICAgIGlmIChkZWx0YSA+IDApIHtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuYmFyLCAndG9wJywgYCR7ZGVsdGF9cHhgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGltZSA8IDEpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGwpO1xuICB9XG5cbiAgc2Nyb2xsQ29udGVudCh5OiBudW1iZXIsIGlzV2hlZWw6IGJvb2xlYW4sIGlzSnVtcDogYm9vbGVhbik6IG51bGwgfCBudW1iZXIge1xuICAgIGxldCBkZWx0YSA9IHk7XG4gICAgY29uc3QgbWF4VG9wID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQgLSB0aGlzLmJhci5vZmZzZXRIZWlnaHQ7XG4gICAgY29uc3QgaGlkZGVuQ29udGVudCA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG4gICAgbGV0IHBlcmNlbnRTY3JvbGw6IG51bWJlcjtcbiAgICBsZXQgb3ZlciA9IG51bGw7XG5cbiAgICBpZiAoaXNXaGVlbCkge1xuICAgICAgZGVsdGEgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKHRoaXMuYmFyKS50b3AsIDEwKSArIHkgKiAyMCAvIDEwMCAqIHRoaXMuYmFyLm9mZnNldEhlaWdodDtcblxuICAgICAgaWYgKGRlbHRhIDwgMCB8fCBkZWx0YSA+IG1heFRvcCkge1xuICAgICAgICBvdmVyID0gZGVsdGEgPiBtYXhUb3AgPyBkZWx0YSAtIG1heFRvcCA6IGRlbHRhO1xuICAgICAgfVxuXG4gICAgICBkZWx0YSA9IE1hdGgubWluKE1hdGgubWF4KGRlbHRhLCAwKSwgbWF4VG9wKTtcbiAgICAgIGRlbHRhID0gKHkgPiAwKSA/IE1hdGguY2VpbChkZWx0YSkgOiBNYXRoLmZsb29yKGRlbHRhKTtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5iYXIsICd0b3AnLCBkZWx0YSArICdweCcpO1xuICAgIH1cblxuICAgIHBlcmNlbnRTY3JvbGwgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKHRoaXMuYmFyKS50b3AsIDEwKSAvICh0aGlzLmVsLm9mZnNldEhlaWdodCAtIHRoaXMuYmFyLm9mZnNldEhlaWdodCk7XG4gICAgZGVsdGEgPSBwZXJjZW50U2Nyb2xsICogaGlkZGVuQ29udGVudDtcblxuICAgIHRoaXMuZWwuc2Nyb2xsVG9wID0gZGVsdGE7XG5cbiAgICB0aGlzLnNob3dCYXJBbmRHcmlkKCk7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5hbHdheXNWaXNpYmxlKSB7XG4gICAgICBpZiAodGhpcy52aXNpYmxlVGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy52aXNpYmxlVGltZW91dCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudmlzaWJsZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5oaWRlQmFyQW5kR3JpZCgpO1xuICAgICAgfSwgdGhpcy5vcHRpb25zLnZpc2libGVUaW1lb3V0KTtcbiAgICB9XG4gICAgY29uc3QgaXNTY3JvbGxBdFN0YXJ0ID0gZGVsdGEgPT09IDA7XG4gICAgY29uc3QgaXNTY3JvbGxBdEVuZCA9IGRlbHRhID09PSBoaWRkZW5Db250ZW50O1xuICAgIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gTWF0aC5jZWlsKGRlbHRhKTtcbiAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IG5ldyBTbGltU2Nyb2xsU3RhdGUoeyBzY3JvbGxQb3NpdGlvbiwgaXNTY3JvbGxBdFN0YXJ0LCBpc1Njcm9sbEF0RW5kIH0pO1xuICAgIHRoaXMuc2Nyb2xsQ2hhbmdlZC5lbWl0KHNjcm9sbFN0YXRlKTtcblxuICAgIHJldHVybiBvdmVyO1xuICB9XG5cbiAgaW5pdFdoZWVsID0gKCkgPT4ge1xuICAgIGNvbnN0IGRvbW1vdXNlc2Nyb2xsID0gZnJvbUV2ZW50KHRoaXMuZWwsICdET01Nb3VzZVNjcm9sbCcpO1xuICAgIGNvbnN0IG1vdXNld2hlZWwgPSBmcm9tRXZlbnQodGhpcy5lbCwgJ21vdXNld2hlZWwnKTtcblxuICAgIGNvbnN0IHdoZWVsU3Vic2NyaXB0aW9uID0gbWVyZ2UoLi4uW2RvbW1vdXNlc2Nyb2xsLCBtb3VzZXdoZWVsXSkuc3Vic2NyaWJlKChlOiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICBsZXQgZGVsdGEgPSAwO1xuXG4gICAgICBpZiAoKDxhbnk+ZSkud2hlZWxEZWx0YSkge1xuICAgICAgICBkZWx0YSA9IC0oPGFueT5lKS53aGVlbERlbHRhIC8gMTIwO1xuICAgICAgfVxuXG4gICAgICBpZiAoZS5kZXRhaWwpIHtcbiAgICAgICAgZGVsdGEgPSBlLmRldGFpbCAvIDM7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2Nyb2xsQ29udGVudChkZWx0YSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmludGVyYWN0aW9uU3Vic2NyaXB0aW9ucy5hZGQod2hlZWxTdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgaW5pdERyYWcgPSAoKSA9PiB7XG4gICAgY29uc3QgYmFyID0gdGhpcy5iYXI7XG5cbiAgICBjb25zdCBtb3VzZW1vdmUgPSBmcm9tRXZlbnQodGhpcy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsICdtb3VzZW1vdmUnKTtcbiAgICBjb25zdCB0b3VjaG1vdmUgPSBmcm9tRXZlbnQodGhpcy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsICd0b3VjaG1vdmUnKTtcblxuICAgIGNvbnN0IG1vdXNlZG93biA9IGZyb21FdmVudChiYXIsICdtb3VzZWRvd24nKTtcbiAgICBjb25zdCB0b3VjaHN0YXJ0ID0gZnJvbUV2ZW50KHRoaXMuZWwsICd0b3VjaHN0YXJ0Jyk7XG4gICAgY29uc3QgbW91c2V1cCA9IGZyb21FdmVudCh0aGlzLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNldXAnKTtcbiAgICBjb25zdCB0b3VjaGVuZCA9IGZyb21FdmVudCh0aGlzLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ3RvdWNoZW5kJyk7XG5cbiAgICBjb25zdCBtb3VzZWRyYWcgPSBtb3VzZWRvd25cbiAgICAgIC5waXBlKFxuICAgICAgICBtZXJnZU1hcCgoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMucGFnZVkgPSBlLnBhZ2VZO1xuICAgICAgICAgIHRoaXMudG9wID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGJhcikudG9wKTtcblxuICAgICAgICAgIHJldHVybiBtb3VzZW1vdmVcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICBtYXAoKGVtb3ZlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZW1vdmUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b3AgKyBlbW92ZS5wYWdlWSAtIHRoaXMucGFnZVk7XG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICB0YWtlVW50aWwobW91c2V1cClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgY29uc3QgdG91Y2hkcmFnID0gdG91Y2hzdGFydFxuICAgICAgLnBpcGUoXG4gICAgICAgIG1lcmdlTWFwKChlOiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5wYWdlWSA9IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWTtcbiAgICAgICAgICB0aGlzLnRvcCA9IC1wYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUoYmFyKS50b3ApO1xuXG4gICAgICAgICAgcmV0dXJuIHRvdWNobW92ZVxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgIG1hcCgodG1vdmU6IFRvdWNoRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLSh0aGlzLnRvcCArIHRtb3ZlLnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgLSB0aGlzLnBhZ2VZKTtcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIHRha2VVbnRpbCh0b3VjaGVuZClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgY29uc3QgZHJhZ1N1YnNjcmlwdGlvbiA9IG1lcmdlKC4uLlttb3VzZWRyYWcsIHRvdWNoZHJhZ10pLnN1YnNjcmliZSgodG9wOiBudW1iZXIpID0+IHtcbiAgICAgIHRoaXMuYm9keS5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIHRoaXMucHJldmVudERlZmF1bHRFdmVudCwgZmFsc2UpO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJvZHksICd0b3VjaC1hY3Rpb24nLCAncGFuLXknKTtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5ib2R5LCAndXNlci1zZWxlY3QnLCAnbm9uZScpO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJhciwgJ3RvcCcsIGAke3RvcH1weGApO1xuICAgICAgY29uc3Qgb3ZlciA9IHRoaXMuc2Nyb2xsQ29udGVudCgwLCB0cnVlLCBmYWxzZSk7XG4gICAgICBjb25zdCBtYXhUb3AgPSB0aGlzLmVsLm9mZnNldEhlaWdodCAtIHRoaXMuYmFyLm9mZnNldEhlaWdodDtcblxuICAgICAgaWYgKG92ZXIgJiYgb3ZlciA8IDAgJiYgLW92ZXIgPD0gbWF4VG9wKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbCwgJ3BhZGRpbmdUb3AnLCAtb3ZlciArICdweCcpO1xuICAgICAgfSBlbHNlIGlmIChvdmVyICYmIG92ZXIgPiAwICYmIG92ZXIgPD0gbWF4VG9wKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbCwgJ3BhZGRpbmdCb3R0b20nLCBvdmVyICsgJ3B4Jyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBkcmFnRW5kU3Vic2NyaXB0aW9uID0gbWVyZ2UoLi4uW21vdXNldXAsIHRvdWNoZW5kXSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIHRoaXMucHJldmVudERlZmF1bHRFdmVudCwgZmFsc2UpO1xuICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IHBhcnNlSW50KHRoaXMuZWwuc3R5bGUucGFkZGluZ1RvcCwgMTApO1xuICAgICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KHRoaXMuZWwuc3R5bGUucGFkZGluZ0JvdHRvbSwgMTApO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJvZHksICd0b3VjaC1hY3Rpb24nLCAndW5zZXQnKTtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5ib2R5LCAndXNlci1zZWxlY3QnLCAnZGVmYXVsdCcpO1xuXG4gICAgICBpZiAocGFkZGluZ1RvcCA+IDApIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUbygwLCAzMDAsICdsaW5lYXInKTtcbiAgICAgIH0gZWxzZSBpZiAocGFkZGluZ0JvdHRvbSA+IDApIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUbygwLCAzMDAsICdsaW5lYXInKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuaW50ZXJhY3Rpb25TdWJzY3JpcHRpb25zLmFkZChkcmFnU3Vic2NyaXB0aW9uKTtcbiAgICB0aGlzLmludGVyYWN0aW9uU3Vic2NyaXB0aW9ucy5hZGQoZHJhZ0VuZFN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBzaG93QmFyQW5kR3JpZCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZ3JpZCwgJ2JhY2tncm91bmQnLCB0aGlzLm9wdGlvbnMuZ3JpZEJhY2tncm91bmQpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5iYXIsICdiYWNrZ3JvdW5kJywgdGhpcy5vcHRpb25zLmJhckJhY2tncm91bmQpO1xuICB9XG5cbiAgaGlkZUJhckFuZEdyaWQoKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmdyaWQsICdiYWNrZ3JvdW5kJywgJ3RyYW5zcGFyZW50Jyk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmJhciwgJ2JhY2tncm91bmQnLCAndHJhbnNwYXJlbnQnKTtcbiAgfVxuXG4gIHByZXZlbnREZWZhdWx0RXZlbnQgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICB0aGlzLm11dGF0aW9uT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnc2xpbXNjcm9sbC13cmFwcGVyJykpIHtcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmVsLnBhcmVudEVsZW1lbnQ7XG4gICAgICBjb25zdCBiYXIgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJy5zbGltc2Nyb2xsLWJhcicpO1xuICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZChiYXIpO1xuICAgICAgY29uc3QgZ3JpZCA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignLnNsaW1zY3JvbGwtZ3JpZCcpO1xuICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZChncmlkKTtcbiAgICAgIHRoaXMudW53cmFwKHdyYXBwZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmludGVyYWN0aW9uU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5pbnRlcmFjdGlvblN1YnNjcmlwdGlvbnMudW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cblxuICB1bndyYXAod3JhcHBlcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBkb2NGcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHdoaWxlICh3cmFwcGVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gd3JhcHBlci5yZW1vdmVDaGlsZCh3cmFwcGVyLmZpcnN0Q2hpbGQpO1xuICAgICAgZG9jRnJhZy5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgfVxuICAgIHdyYXBwZXIucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZG9jRnJhZywgd3JhcHBlcik7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJywgWyckZXZlbnQnXSlcbiAgb25SZXNpemUoJGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLmdldEJhckhlaWdodCgpO1xuICB9XG59XG4iXX0=