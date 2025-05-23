import { u as useFetch, _ as __nuxt_component_0$1, a as __nuxt_component_1, S as Swiper$1, b as useSiteSettings, m as makeElementsArray, d as defaults, e as elementOuterSize, c as elementIndex, f as elementParents, g as elementChildren, h as createElement, i as getSlideTransformEl, j as elementTransitionEnd } from './footer-GDMYG6Rr.mjs';
import { defineComponent, createElementBlock, ref, provide, withAsyncContext, unref, createVNode, resolveDynamicComponent, mergeProps, useSSRContext, watchEffect, withCtx, toDisplayString, openBlock, createBlock, Fragment, renderList, createTextVNode, watch, nextTick, h, computed } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderVNode, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-gThAqNr3.mjs';
import { a as useRuntimeConfig, c as useRouter } from './server.mjs';
import he from 'he';
import _ from 'lodash';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import './asyncData-COfFyXNC.mjs';
import 'pinia';
import 'vue-router';

const paramsList = [
  "eventsPrefix",
  "injectStyles",
  "injectStylesUrls",
  "modules",
  "init",
  "_direction",
  "oneWayMovement",
  "swiperElementNodeName",
  "touchEventsTarget",
  "initialSlide",
  "_speed",
  "cssMode",
  "updateOnWindowResize",
  "resizeObserver",
  "nested",
  "focusableElements",
  "_enabled",
  "_width",
  "_height",
  "preventInteractionOnTransition",
  "userAgent",
  "url",
  "_edgeSwipeDetection",
  "_edgeSwipeThreshold",
  "_freeMode",
  "_autoHeight",
  "setWrapperSize",
  "virtualTranslate",
  "_effect",
  "breakpoints",
  "breakpointsBase",
  "_spaceBetween",
  "_slidesPerView",
  "maxBackfaceHiddenSlides",
  "_grid",
  "_slidesPerGroup",
  "_slidesPerGroupSkip",
  "_slidesPerGroupAuto",
  "_centeredSlides",
  "_centeredSlidesBounds",
  "_slidesOffsetBefore",
  "_slidesOffsetAfter",
  "normalizeSlideIndex",
  "_centerInsufficientSlides",
  "_watchOverflow",
  "roundLengths",
  "touchRatio",
  "touchAngle",
  "simulateTouch",
  "_shortSwipes",
  "_longSwipes",
  "longSwipesRatio",
  "longSwipesMs",
  "_followFinger",
  "allowTouchMove",
  "_threshold",
  "touchMoveStopPropagation",
  "touchStartPreventDefault",
  "touchStartForcePreventDefault",
  "touchReleaseOnEdges",
  "uniqueNavElements",
  "_resistance",
  "_resistanceRatio",
  "_watchSlidesProgress",
  "_grabCursor",
  "preventClicks",
  "preventClicksPropagation",
  "_slideToClickedSlide",
  "_loop",
  "loopAdditionalSlides",
  "loopAddBlankSlides",
  "loopPreventsSliding",
  "_rewind",
  "_allowSlidePrev",
  "_allowSlideNext",
  "_swipeHandler",
  "_noSwiping",
  "noSwipingClass",
  "noSwipingSelector",
  "passiveListeners",
  "containerModifierClass",
  "slideClass",
  "slideActiveClass",
  "slideVisibleClass",
  "slideFullyVisibleClass",
  "slideNextClass",
  "slidePrevClass",
  "slideBlankClass",
  "wrapperClass",
  "lazyPreloaderClass",
  "lazyPreloadPrevNext",
  "runCallbacksOnInit",
  "observer",
  "observeParents",
  "observeSlideChildren",
  // modules
  "a11y",
  "_autoplay",
  "_controller",
  "coverflowEffect",
  "cubeEffect",
  "fadeEffect",
  "flipEffect",
  "creativeEffect",
  "cardsEffect",
  "hashNavigation",
  "history",
  "keyboard",
  "mousewheel",
  "_navigation",
  "_pagination",
  "parallax",
  "_scrollbar",
  "_thumbs",
  "virtual",
  "zoom",
  "control"
];
function isObject(o) {
  return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object" && !o.__swiper__;
}
function extend(target, src) {
  const noExtend = ["__proto__", "constructor", "prototype"];
  Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
    if (typeof target[key] === "undefined") target[key] = src[key];
    else if (isObject(src[key]) && isObject(target[key]) && Object.keys(src[key]).length > 0) {
      if (src[key].__swiper__) target[key] = src[key];
      else extend(target[key], src[key]);
    } else {
      target[key] = src[key];
    }
  });
}
function needsNavigation(params) {
  if (params === undefined) {
    params = {};
  }
  return params.navigation && typeof params.navigation.nextEl === "undefined" && typeof params.navigation.prevEl === "undefined";
}
function needsPagination(params) {
  if (params === undefined) {
    params = {};
  }
  return params.pagination && typeof params.pagination.el === "undefined";
}
function needsScrollbar(params) {
  if (params === undefined) {
    params = {};
  }
  return params.scrollbar && typeof params.scrollbar.el === "undefined";
}
function uniqueClasses(classNames) {
  if (classNames === undefined) {
    classNames = "";
  }
  const classes = classNames.split(" ").map((c) => c.trim()).filter((c) => !!c);
  const unique = [];
  classes.forEach((c) => {
    if (unique.indexOf(c) < 0) unique.push(c);
  });
  return unique.join(" ");
}
function wrapperClass(className) {
  if (className === undefined) {
    className = "";
  }
  if (!className) return "swiper-wrapper";
  if (!className.includes("swiper-wrapper")) return `swiper-wrapper ${className}`;
  return className;
}
function getParams(obj, splitEvents) {
  if (obj === undefined) {
    obj = {};
  }
  const params = {
    on: {}
  };
  const events = {};
  const passedParams = {};
  extend(params, defaults);
  params._emitClasses = true;
  params.init = false;
  const rest = {};
  const allowedParams = paramsList.map((key) => key.replace(/_/, ""));
  const plainObj = Object.assign({}, obj);
  Object.keys(plainObj).forEach((key) => {
    if (typeof obj[key] === "undefined") return;
    if (allowedParams.indexOf(key) >= 0) {
      if (isObject(obj[key])) {
        params[key] = {};
        passedParams[key] = {};
        extend(params[key], obj[key]);
        extend(passedParams[key], obj[key]);
      } else {
        params[key] = obj[key];
        passedParams[key] = obj[key];
      }
    } else if (key.search(/on[A-Z]/) === 0 && typeof obj[key] === "function") {
      {
        params.on[`${key[2].toLowerCase()}${key.substr(3)}`] = obj[key];
      }
    } else {
      rest[key] = obj[key];
    }
  });
  ["navigation", "pagination", "scrollbar"].forEach((key) => {
    if (params[key] === true) params[key] = {};
    if (params[key] === false) delete params[key];
  });
  return {
    params,
    passedParams,
    rest,
    events
  };
}
const updateOnVirtualData = (swiper) => {
  if (!swiper || swiper.destroyed || !swiper.params.virtual || swiper.params.virtual && !swiper.params.virtual.enabled) return;
  swiper.updateSlides();
  swiper.updateProgress();
  swiper.updateSlidesClasses();
  if (swiper.parallax && swiper.params.parallax && swiper.params.parallax.enabled) {
    swiper.parallax.setTranslate();
  }
};
function getChildren(originalSlots, slidesRef, oldSlidesRef) {
  if (originalSlots === undefined) {
    originalSlots = {};
  }
  const slides = [];
  const slots = {
    "container-start": [],
    "container-end": [],
    "wrapper-start": [],
    "wrapper-end": []
  };
  const getSlidesFromElements = (els, slotName) => {
    if (!Array.isArray(els)) {
      return;
    }
    els.forEach((vnode) => {
      const isFragment = typeof vnode.type === "symbol";
      if (slotName === "default") slotName = "container-end";
      if (isFragment && vnode.children) {
        getSlidesFromElements(vnode.children, slotName);
      } else if (vnode.type && (vnode.type.name === "SwiperSlide" || vnode.type.name === "AsyncComponentWrapper") || vnode.componentOptions && vnode.componentOptions.tag === "SwiperSlide") {
        slides.push(vnode);
      } else if (slots[slotName]) {
        slots[slotName].push(vnode);
      }
    });
  };
  Object.keys(originalSlots).forEach((slotName) => {
    if (typeof originalSlots[slotName] !== "function") return;
    const els = originalSlots[slotName]();
    getSlidesFromElements(els, slotName);
  });
  oldSlidesRef.value = slidesRef.value;
  slidesRef.value = slides;
  return {
    slides,
    slots
  };
}
function renderVirtual(swiperRef, slides, virtualData) {
  if (!virtualData) return null;
  const getSlideIndex = (index) => {
    let slideIndex = index;
    if (index < 0) {
      slideIndex = slides.length + index;
    } else if (slideIndex >= slides.length) {
      slideIndex = slideIndex - slides.length;
    }
    return slideIndex;
  };
  const style = swiperRef.value.isHorizontal() ? {
    [swiperRef.value.rtlTranslate ? "right" : "left"]: `${virtualData.offset}px`
  } : {
    top: `${virtualData.offset}px`
  };
  const {
    from,
    to
  } = virtualData;
  const loopFrom = swiperRef.value.params.loop ? -slides.length : 0;
  const loopTo = swiperRef.value.params.loop ? slides.length * 2 : slides.length;
  const slidesToRender = [];
  for (let i = loopFrom; i < loopTo; i += 1) {
    if (i >= from && i <= to && slidesToRender.length < slides.length) {
      slidesToRender.push(slides[getSlideIndex(i)]);
    }
  }
  return slidesToRender.map((slide) => {
    if (!slide.props) slide.props = {};
    if (!slide.props.style) slide.props.style = {};
    slide.props.swiperRef = swiperRef;
    slide.props.style = style;
    if (slide.type) {
      return h(slide.type, {
        ...slide.props
      }, slide.children);
    } else if (slide.componentOptions) {
      return h(slide.componentOptions.Ctor, {
        ...slide.props
      }, slide.componentOptions.children);
    }
  });
}
const Swiper = {
  name: "Swiper",
  props: {
    tag: {
      type: String,
      default: "div"
    },
    wrapperTag: {
      type: String,
      default: "div"
    },
    modules: {
      type: Array,
      default: undefined
    },
    init: {
      type: Boolean,
      default: undefined
    },
    direction: {
      type: String,
      default: undefined
    },
    oneWayMovement: {
      type: Boolean,
      default: undefined
    },
    swiperElementNodeName: {
      type: String,
      default: "SWIPER-CONTAINER"
    },
    touchEventsTarget: {
      type: String,
      default: undefined
    },
    initialSlide: {
      type: Number,
      default: undefined
    },
    speed: {
      type: Number,
      default: undefined
    },
    cssMode: {
      type: Boolean,
      default: undefined
    },
    updateOnWindowResize: {
      type: Boolean,
      default: undefined
    },
    resizeObserver: {
      type: Boolean,
      default: undefined
    },
    nested: {
      type: Boolean,
      default: undefined
    },
    focusableElements: {
      type: String,
      default: undefined
    },
    width: {
      type: Number,
      default: undefined
    },
    height: {
      type: Number,
      default: undefined
    },
    preventInteractionOnTransition: {
      type: Boolean,
      default: undefined
    },
    userAgent: {
      type: String,
      default: undefined
    },
    url: {
      type: String,
      default: undefined
    },
    edgeSwipeDetection: {
      type: [Boolean, String],
      default: undefined
    },
    edgeSwipeThreshold: {
      type: Number,
      default: undefined
    },
    autoHeight: {
      type: Boolean,
      default: undefined
    },
    setWrapperSize: {
      type: Boolean,
      default: undefined
    },
    virtualTranslate: {
      type: Boolean,
      default: undefined
    },
    effect: {
      type: String,
      default: undefined
    },
    breakpoints: {
      type: Object,
      default: undefined
    },
    breakpointsBase: {
      type: String,
      default: undefined
    },
    spaceBetween: {
      type: [Number, String],
      default: undefined
    },
    slidesPerView: {
      type: [Number, String],
      default: undefined
    },
    maxBackfaceHiddenSlides: {
      type: Number,
      default: undefined
    },
    slidesPerGroup: {
      type: Number,
      default: undefined
    },
    slidesPerGroupSkip: {
      type: Number,
      default: undefined
    },
    slidesPerGroupAuto: {
      type: Boolean,
      default: undefined
    },
    centeredSlides: {
      type: Boolean,
      default: undefined
    },
    centeredSlidesBounds: {
      type: Boolean,
      default: undefined
    },
    slidesOffsetBefore: {
      type: Number,
      default: undefined
    },
    slidesOffsetAfter: {
      type: Number,
      default: undefined
    },
    normalizeSlideIndex: {
      type: Boolean,
      default: undefined
    },
    centerInsufficientSlides: {
      type: Boolean,
      default: undefined
    },
    watchOverflow: {
      type: Boolean,
      default: undefined
    },
    roundLengths: {
      type: Boolean,
      default: undefined
    },
    touchRatio: {
      type: Number,
      default: undefined
    },
    touchAngle: {
      type: Number,
      default: undefined
    },
    simulateTouch: {
      type: Boolean,
      default: undefined
    },
    shortSwipes: {
      type: Boolean,
      default: undefined
    },
    longSwipes: {
      type: Boolean,
      default: undefined
    },
    longSwipesRatio: {
      type: Number,
      default: undefined
    },
    longSwipesMs: {
      type: Number,
      default: undefined
    },
    followFinger: {
      type: Boolean,
      default: undefined
    },
    allowTouchMove: {
      type: Boolean,
      default: undefined
    },
    threshold: {
      type: Number,
      default: undefined
    },
    touchMoveStopPropagation: {
      type: Boolean,
      default: undefined
    },
    touchStartPreventDefault: {
      type: Boolean,
      default: undefined
    },
    touchStartForcePreventDefault: {
      type: Boolean,
      default: undefined
    },
    touchReleaseOnEdges: {
      type: Boolean,
      default: undefined
    },
    uniqueNavElements: {
      type: Boolean,
      default: undefined
    },
    resistance: {
      type: Boolean,
      default: undefined
    },
    resistanceRatio: {
      type: Number,
      default: undefined
    },
    watchSlidesProgress: {
      type: Boolean,
      default: undefined
    },
    grabCursor: {
      type: Boolean,
      default: undefined
    },
    preventClicks: {
      type: Boolean,
      default: undefined
    },
    preventClicksPropagation: {
      type: Boolean,
      default: undefined
    },
    slideToClickedSlide: {
      type: Boolean,
      default: undefined
    },
    loop: {
      type: Boolean,
      default: undefined
    },
    loopedSlides: {
      type: Number,
      default: undefined
    },
    loopPreventsSliding: {
      type: Boolean,
      default: undefined
    },
    rewind: {
      type: Boolean,
      default: undefined
    },
    allowSlidePrev: {
      type: Boolean,
      default: undefined
    },
    allowSlideNext: {
      type: Boolean,
      default: undefined
    },
    swipeHandler: {
      type: Boolean,
      default: undefined
    },
    noSwiping: {
      type: Boolean,
      default: undefined
    },
    noSwipingClass: {
      type: String,
      default: undefined
    },
    noSwipingSelector: {
      type: String,
      default: undefined
    },
    passiveListeners: {
      type: Boolean,
      default: undefined
    },
    containerModifierClass: {
      type: String,
      default: undefined
    },
    slideClass: {
      type: String,
      default: undefined
    },
    slideActiveClass: {
      type: String,
      default: undefined
    },
    slideVisibleClass: {
      type: String,
      default: undefined
    },
    slideFullyVisibleClass: {
      type: String,
      default: undefined
    },
    slideBlankClass: {
      type: String,
      default: undefined
    },
    slideNextClass: {
      type: String,
      default: undefined
    },
    slidePrevClass: {
      type: String,
      default: undefined
    },
    wrapperClass: {
      type: String,
      default: undefined
    },
    lazyPreloaderClass: {
      type: String,
      default: undefined
    },
    lazyPreloadPrevNext: {
      type: Number,
      default: undefined
    },
    runCallbacksOnInit: {
      type: Boolean,
      default: undefined
    },
    observer: {
      type: Boolean,
      default: undefined
    },
    observeParents: {
      type: Boolean,
      default: undefined
    },
    observeSlideChildren: {
      type: Boolean,
      default: undefined
    },
    a11y: {
      type: [Boolean, Object],
      default: undefined
    },
    autoplay: {
      type: [Boolean, Object],
      default: undefined
    },
    controller: {
      type: Object,
      default: undefined
    },
    coverflowEffect: {
      type: Object,
      default: undefined
    },
    cubeEffect: {
      type: Object,
      default: undefined
    },
    fadeEffect: {
      type: Object,
      default: undefined
    },
    flipEffect: {
      type: Object,
      default: undefined
    },
    creativeEffect: {
      type: Object,
      default: undefined
    },
    cardsEffect: {
      type: Object,
      default: undefined
    },
    hashNavigation: {
      type: [Boolean, Object],
      default: undefined
    },
    history: {
      type: [Boolean, Object],
      default: undefined
    },
    keyboard: {
      type: [Boolean, Object],
      default: undefined
    },
    mousewheel: {
      type: [Boolean, Object],
      default: undefined
    },
    navigation: {
      type: [Boolean, Object],
      default: undefined
    },
    pagination: {
      type: [Boolean, Object],
      default: undefined
    },
    parallax: {
      type: [Boolean, Object],
      default: undefined
    },
    scrollbar: {
      type: [Boolean, Object],
      default: undefined
    },
    thumbs: {
      type: Object,
      default: undefined
    },
    virtual: {
      type: [Boolean, Object],
      default: undefined
    },
    zoom: {
      type: [Boolean, Object],
      default: undefined
    },
    grid: {
      type: [Object],
      default: undefined
    },
    freeMode: {
      type: [Boolean, Object],
      default: undefined
    },
    enabled: {
      type: Boolean,
      default: undefined
    }
  },
  emits: ["_beforeBreakpoint", "_containerClasses", "_slideClass", "_slideClasses", "_swiper", "_freeModeNoMomentumRelease", "activeIndexChange", "afterInit", "autoplay", "autoplayStart", "autoplayStop", "autoplayPause", "autoplayResume", "autoplayTimeLeft", "beforeDestroy", "beforeInit", "beforeLoopFix", "beforeResize", "beforeSlideChangeStart", "beforeTransitionStart", "breakpoint", "changeDirection", "click", "disable", "doubleTap", "doubleClick", "destroy", "enable", "fromEdge", "hashChange", "hashSet", "init", "keyPress", "lock", "loopFix", "momentumBounce", "navigationHide", "navigationShow", "navigationPrev", "navigationNext", "observerUpdate", "orientationchange", "paginationHide", "paginationRender", "paginationShow", "paginationUpdate", "progress", "reachBeginning", "reachEnd", "realIndexChange", "resize", "scroll", "scrollbarDragEnd", "scrollbarDragMove", "scrollbarDragStart", "setTransition", "setTranslate", "slidesUpdated", "slideChange", "slideChangeTransitionEnd", "slideChangeTransitionStart", "slideNextTransitionEnd", "slideNextTransitionStart", "slidePrevTransitionEnd", "slidePrevTransitionStart", "slideResetTransitionStart", "slideResetTransitionEnd", "sliderMove", "sliderFirstMove", "slidesLengthChange", "slidesGridLengthChange", "snapGridLengthChange", "snapIndexChange", "swiper", "tap", "toEdge", "touchEnd", "touchMove", "touchMoveOpposite", "touchStart", "transitionEnd", "transitionStart", "unlock", "update", "virtualUpdate", "zoomChange"],
  setup(props, _ref) {
    let {
      slots: originalSlots,
      emit
    } = _ref;
    const {
      tag: Tag,
      wrapperTag: WrapperTag
    } = props;
    const containerClasses = ref("swiper");
    const virtualData = ref(null);
    const breakpointChanged = ref(false);
    ref(false);
    const swiperElRef = ref(null);
    const swiperRef = ref(null);
    const oldPassedParamsRef = ref(null);
    const slidesRef = {
      value: []
    };
    const oldSlidesRef = {
      value: []
    };
    const nextElRef = ref(null);
    const prevElRef = ref(null);
    const paginationElRef = ref(null);
    const scrollbarElRef = ref(null);
    const {
      params: swiperParams,
      passedParams
    } = getParams(props);
    getChildren(originalSlots, slidesRef, oldSlidesRef);
    oldPassedParamsRef.value = passedParams;
    oldSlidesRef.value = slidesRef.value;
    const onBeforeBreakpoint = () => {
      getChildren(originalSlots, slidesRef, oldSlidesRef);
      breakpointChanged.value = true;
    };
    swiperParams.onAny = function(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      emit(event, ...args);
    };
    Object.assign(swiperParams.on, {
      _beforeBreakpoint: onBeforeBreakpoint,
      _containerClasses(swiper, classes) {
        containerClasses.value = classes;
      }
    });
    const passParams = {
      ...swiperParams
    };
    delete passParams.wrapperClass;
    swiperRef.value = new Swiper$1(passParams);
    if (swiperRef.value.virtual && swiperRef.value.params.virtual.enabled) {
      swiperRef.value.virtual.slides = slidesRef.value;
      const extendWith = {
        cache: false,
        slides: slidesRef.value,
        renderExternal: (data) => {
          virtualData.value = data;
        },
        renderExternalUpdate: false
      };
      extend(swiperRef.value.params.virtual, extendWith);
      extend(swiperRef.value.originalParams.virtual, extendWith);
    }
    provide("swiper", swiperRef);
    watch(virtualData, () => {
      nextTick(() => {
        updateOnVirtualData(swiperRef.value);
      });
    });
    function renderSlides(slides) {
      if (swiperParams.virtual) {
        return renderVirtual(swiperRef, slides, virtualData.value);
      }
      slides.forEach((slide, index) => {
        if (!slide.props) slide.props = {};
        slide.props.swiperRef = swiperRef;
        slide.props.swiperSlideIndex = index;
      });
      return slides;
    }
    return () => {
      const {
        slides,
        slots
      } = getChildren(originalSlots, slidesRef, oldSlidesRef);
      return h(Tag, {
        ref: swiperElRef,
        class: uniqueClasses(containerClasses.value)
      }, [slots["container-start"], h(WrapperTag, {
        class: wrapperClass(swiperParams.wrapperClass)
      }, [slots["wrapper-start"], renderSlides(slides), slots["wrapper-end"]]), needsNavigation(props) && [h("div", {
        ref: prevElRef,
        class: "swiper-button-prev"
      }), h("div", {
        ref: nextElRef,
        class: "swiper-button-next"
      })], needsScrollbar(props) && h("div", {
        ref: scrollbarElRef,
        class: "swiper-scrollbar"
      }), needsPagination(props) && h("div", {
        ref: paginationElRef,
        class: "swiper-pagination"
      }), slots["container-end"]]);
    };
  }
};
const SwiperSlide = {
  name: "SwiperSlide",
  props: {
    tag: {
      type: String,
      default: "div"
    },
    swiperRef: {
      type: Object,
      required: false
    },
    swiperSlideIndex: {
      type: Number,
      default: undefined,
      required: false
    },
    zoom: {
      type: Boolean,
      default: undefined,
      required: false
    },
    lazy: {
      type: Boolean,
      default: false,
      required: false
    },
    virtualIndex: {
      type: [String, Number],
      default: undefined
    }
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const {
      swiperRef
    } = props;
    const slideElRef = ref(null);
    const slideClasses = ref("swiper-slide");
    const lazyLoaded = ref(false);
    const slideData = computed(() => ({
      isActive: slideClasses.value.indexOf("swiper-slide-active") >= 0,
      isVisible: slideClasses.value.indexOf("swiper-slide-visible") >= 0,
      isPrev: slideClasses.value.indexOf("swiper-slide-prev") >= 0,
      isNext: slideClasses.value.indexOf("swiper-slide-next") >= 0
    }));
    provide("swiperSlide", slideData);
    const onLoad = () => {
      lazyLoaded.value = true;
    };
    return () => {
      return h(props.tag, {
        class: uniqueClasses(`${slideClasses.value}`),
        ref: slideElRef,
        "data-swiper-slide-index": typeof props.virtualIndex === "undefined" && swiperRef && swiperRef.value && swiperRef.value.params.loop ? props.swiperSlideIndex : props.virtualIndex,
        onLoadCapture: onLoad
      }, props.zoom ? h("div", {
        class: "swiper-zoom-container",
        "data-swiper-zoom": typeof props.zoom === "number" ? props.zoom : undefined
      }, [slots.default && slots.default(slideData.value), props.lazy && !lazyLoaded.value && h("div", {
        class: "swiper-lazy-preloader"
      })]) : [slots.default && slots.default(slideData.value), props.lazy && !lazyLoaded.value && h("div", {
        class: "swiper-lazy-preloader"
      })]);
    };
  }
};
function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
  if (swiper.params.createElements) {
    Object.keys(checkProps).forEach((key) => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement("div", checkProps[key]);
          element.className = checkProps[key];
          swiper.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}
function Navigation(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  extendParams({
    navigation: {
      nextEl: null,
      prevEl: null,
      hideOnClick: false,
      disabledClass: "swiper-button-disabled",
      hiddenClass: "swiper-button-hidden",
      lockClass: "swiper-button-lock",
      navigationDisabledClass: "swiper-navigation-disabled"
    }
  });
  swiper.navigation = {
    nextEl: null,
    prevEl: null
  };
  function getEl(el) {
    let res;
    if (el && typeof el === "string" && swiper.isElement) {
      res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
      if (res) return res;
    }
    if (el) {
      if (typeof el === "string") res = [...(undefined).querySelectorAll(el)];
      if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
        res = swiper.el.querySelector(el);
      } else if (res && res.length === 1) {
        res = res[0];
      }
    }
    if (el && !res) return el;
    return res;
  }
  function toggleEl(el, disabled) {
    const params = swiper.params.navigation;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (subEl) {
        subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
        if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
        if (swiper.params.watchOverflow && swiper.enabled) {
          subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
        }
      }
    });
  }
  function update() {
    const {
      nextEl,
      prevEl
    } = swiper.navigation;
    if (swiper.params.loop) {
      toggleEl(prevEl, false);
      toggleEl(nextEl, false);
      return;
    }
    toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
    toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
  }
  function onPrevClick(e) {
    e.preventDefault();
    if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slidePrev();
    emit("navigationPrev");
  }
  function onNextClick(e) {
    e.preventDefault();
    if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slideNext();
    emit("navigationNext");
  }
  function init() {
    const params = swiper.params.navigation;
    swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
      nextEl: "swiper-button-next",
      prevEl: "swiper-button-prev"
    });
    if (!(params.nextEl || params.prevEl)) return;
    let nextEl = getEl(params.nextEl);
    let prevEl = getEl(params.prevEl);
    Object.assign(swiper.navigation, {
      nextEl,
      prevEl
    });
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const initButton = (el, dir) => {
      if (el) {
        el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      }
      if (!swiper.enabled && el) {
        el.classList.add(...params.lockClass.split(" "));
      }
    };
    nextEl.forEach((el) => initButton(el, "next"));
    prevEl.forEach((el) => initButton(el, "prev"));
  }
  function destroy() {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const destroyButton = (el, dir) => {
      el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
    };
    nextEl.forEach((el) => destroyButton(el, "next"));
    prevEl.forEach((el) => destroyButton(el, "prev"));
  }
  on("init", () => {
    if (swiper.params.navigation.enabled === false) {
      disable();
    } else {
      init();
      update();
    }
  });
  on("toEdge fromEdge lock unlock", () => {
    update();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    if (swiper.enabled) {
      update();
      return;
    }
    [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper.params.navigation.lockClass));
  });
  on("click", (_s, e) => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const targetEl = e.target;
    let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
    if (swiper.isElement && !targetIsButton) {
      const path = e.path || e.composedPath && e.composedPath();
      if (path) {
        targetIsButton = path.find((pathEl) => nextEl.includes(pathEl) || prevEl.includes(pathEl));
      }
    }
    if (swiper.params.navigation.hideOnClick && !targetIsButton) {
      if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
      let isHidden;
      if (nextEl.length) {
        isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      } else if (prevEl.length) {
        isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      }
      if (isHidden === true) {
        emit("navigationShow");
      } else {
        emit("navigationHide");
      }
      [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper.params.navigation.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
    init();
    update();
  };
  const disable = () => {
    swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
    destroy();
  };
  Object.assign(swiper.navigation, {
    enable,
    disable,
    update,
    init,
    destroy
  });
}
function classesToSelector(classes) {
  if (classes === undefined) {
    classes = "";
  }
  return `.${classes.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`;
}
function Pagination(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const pfx = "swiper-pagination";
  extendParams({
    pagination: {
      el: null,
      bulletElement: "span",
      clickable: false,
      hideOnClick: false,
      renderBullet: null,
      renderProgressbar: null,
      renderFraction: null,
      renderCustom: null,
      progressbarOpposite: false,
      type: "bullets",
      // 'bullets' or 'progressbar' or 'fraction' or 'custom'
      dynamicBullets: false,
      dynamicMainBullets: 1,
      formatFractionCurrent: (number) => number,
      formatFractionTotal: (number) => number,
      bulletClass: `${pfx}-bullet`,
      bulletActiveClass: `${pfx}-bullet-active`,
      modifierClass: `${pfx}-`,
      currentClass: `${pfx}-current`,
      totalClass: `${pfx}-total`,
      hiddenClass: `${pfx}-hidden`,
      progressbarFillClass: `${pfx}-progressbar-fill`,
      progressbarOppositeClass: `${pfx}-progressbar-opposite`,
      clickableClass: `${pfx}-clickable`,
      lockClass: `${pfx}-lock`,
      horizontalClass: `${pfx}-horizontal`,
      verticalClass: `${pfx}-vertical`,
      paginationDisabledClass: `${pfx}-disabled`
    }
  });
  swiper.pagination = {
    el: null,
    bullets: []
  };
  let bulletSize;
  let dynamicBulletIndex = 0;
  function isPaginationDisabled() {
    return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
  }
  function setSideBullets(bulletEl, position) {
    const {
      bulletActiveClass
    } = swiper.params.pagination;
    if (!bulletEl) return;
    bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
    if (bulletEl) {
      bulletEl.classList.add(`${bulletActiveClass}-${position}`);
      bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
      if (bulletEl) {
        bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
      }
    }
  }
  function getMoveDirection(prevIndex, nextIndex, length) {
    prevIndex = prevIndex % length;
    nextIndex = nextIndex % length;
    if (nextIndex === prevIndex + 1) {
      return "next";
    } else if (nextIndex === prevIndex - 1) {
      return "previous";
    }
    return;
  }
  function onBulletClick(e) {
    const bulletEl = e.target.closest(classesToSelector(swiper.params.pagination.bulletClass));
    if (!bulletEl) {
      return;
    }
    e.preventDefault();
    const index = elementIndex(bulletEl) * swiper.params.slidesPerGroup;
    if (swiper.params.loop) {
      if (swiper.realIndex === index) return;
      const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
      if (moveDirection === "next") {
        swiper.slideNext();
      } else if (moveDirection === "previous") {
        swiper.slidePrev();
      } else {
        swiper.slideToLoop(index);
      }
    } else {
      swiper.slideTo(index);
    }
  }
  function update() {
    const rtl = swiper.rtl;
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let current;
    let previousIndex;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
    const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
    if (swiper.params.loop) {
      previousIndex = swiper.previousRealIndex || 0;
      current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
    } else if (typeof swiper.snapIndex !== "undefined") {
      current = swiper.snapIndex;
      previousIndex = swiper.previousSnapIndex;
    } else {
      previousIndex = swiper.previousIndex || 0;
      current = swiper.activeIndex || 0;
    }
    if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
      const bullets = swiper.pagination.bullets;
      let firstIndex;
      let lastIndex;
      let midIndex;
      if (params.dynamicBullets) {
        bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height");
        el.forEach((subEl) => {
          subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
        });
        if (params.dynamicMainBullets > 1 && previousIndex !== undefined) {
          dynamicBulletIndex += current - (previousIndex || 0);
          if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
            dynamicBulletIndex = params.dynamicMainBullets - 1;
          } else if (dynamicBulletIndex < 0) {
            dynamicBulletIndex = 0;
          }
        }
        firstIndex = Math.max(current - dynamicBulletIndex, 0);
        lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
        midIndex = (lastIndex + firstIndex) / 2;
      }
      bullets.forEach((bulletEl) => {
        const classesToRemove = [...["", "-next", "-next-next", "-prev", "-prev-prev", "-main"].map((suffix) => `${params.bulletActiveClass}${suffix}`)].map((s) => typeof s === "string" && s.includes(" ") ? s.split(" ") : s).flat();
        bulletEl.classList.remove(...classesToRemove);
      });
      if (el.length > 1) {
        bullets.forEach((bullet) => {
          const bulletIndex = elementIndex(bullet);
          if (bulletIndex === current) {
            bullet.classList.add(...params.bulletActiveClass.split(" "));
          } else if (swiper.isElement) {
            bullet.setAttribute("part", "bullet");
          }
          if (params.dynamicBullets) {
            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
              bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
            if (bulletIndex === firstIndex) {
              setSideBullets(bullet, "prev");
            }
            if (bulletIndex === lastIndex) {
              setSideBullets(bullet, "next");
            }
          }
        });
      } else {
        const bullet = bullets[current];
        if (bullet) {
          bullet.classList.add(...params.bulletActiveClass.split(" "));
        }
        if (swiper.isElement) {
          bullets.forEach((bulletEl, bulletIndex) => {
            bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
          });
        }
        if (params.dynamicBullets) {
          const firstDisplayedBullet = bullets[firstIndex];
          const lastDisplayedBullet = bullets[lastIndex];
          for (let i = firstIndex; i <= lastIndex; i += 1) {
            if (bullets[i]) {
              bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
          }
          setSideBullets(firstDisplayedBullet, "prev");
          setSideBullets(lastDisplayedBullet, "next");
        }
      }
      if (params.dynamicBullets) {
        const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
        const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
        const offsetProp = rtl ? "right" : "left";
        bullets.forEach((bullet) => {
          bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
        });
      }
    }
    el.forEach((subEl, subElIndex) => {
      if (params.type === "fraction") {
        subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach((fractionEl) => {
          fractionEl.textContent = params.formatFractionCurrent(current + 1);
        });
        subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach((totalEl) => {
          totalEl.textContent = params.formatFractionTotal(total);
        });
      }
      if (params.type === "progressbar") {
        let progressbarDirection;
        if (params.progressbarOpposite) {
          progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal";
        } else {
          progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
        }
        const scale = (current + 1) / total;
        let scaleX = 1;
        let scaleY = 1;
        if (progressbarDirection === "horizontal") {
          scaleX = scale;
        } else {
          scaleY = scale;
        }
        subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach((progressEl) => {
          progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
          progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
        });
      }
      if (params.type === "custom" && params.renderCustom) {
        subEl.innerHTML = params.renderCustom(swiper, current + 1, total);
        if (subElIndex === 0) emit("paginationRender", subEl);
      } else {
        if (subElIndex === 0) emit("paginationRender", subEl);
        emit("paginationUpdate", subEl);
      }
      if (swiper.params.watchOverflow && swiper.enabled) {
        subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
      }
    });
  }
  function render() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let paginationHTML = "";
    if (params.type === "bullets") {
      let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
      if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) {
        numberOfBullets = slidesLength;
      }
      for (let i = 0; i < numberOfBullets; i += 1) {
        if (params.renderBullet) {
          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
        } else {
          paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
        }
      }
    }
    if (params.type === "fraction") {
      if (params.renderFraction) {
        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
      } else {
        paginationHTML = `<span class="${params.currentClass}"></span> / <span class="${params.totalClass}"></span>`;
      }
    }
    if (params.type === "progressbar") {
      if (params.renderProgressbar) {
        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
      } else {
        paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
      }
    }
    swiper.pagination.bullets = [];
    el.forEach((subEl) => {
      if (params.type !== "custom") {
        subEl.innerHTML = paginationHTML || "";
      }
      if (params.type === "bullets") {
        swiper.pagination.bullets.push(...subEl.querySelectorAll(classesToSelector(params.bulletClass)));
      }
    });
    if (params.type !== "custom") {
      emit("paginationRender", el[0]);
    }
  }
  function init() {
    swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
      el: "swiper-pagination"
    });
    const params = swiper.params.pagination;
    if (!params.el) return;
    let el;
    if (typeof params.el === "string" && swiper.isElement) {
      el = swiper.el.querySelector(params.el);
    }
    if (!el && typeof params.el === "string") {
      el = [...(undefined).querySelectorAll(params.el)];
    }
    if (!el) {
      el = params.el;
    }
    if (!el || el.length === 0) return;
    if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
      el = [...swiper.el.querySelectorAll(params.el)];
      if (el.length > 1) {
        el = el.find((subEl) => {
          if (elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
          return true;
        });
      }
    }
    if (Array.isArray(el) && el.length === 1) el = el[0];
    Object.assign(swiper.pagination, {
      el
    });
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (params.type === "bullets" && params.clickable) {
        subEl.classList.add(...(params.clickableClass || "").split(" "));
      }
      subEl.classList.add(params.modifierClass + params.type);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
      if (params.type === "bullets" && params.dynamicBullets) {
        subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
        dynamicBulletIndex = 0;
        if (params.dynamicMainBullets < 1) {
          params.dynamicMainBullets = 1;
        }
      }
      if (params.type === "progressbar" && params.progressbarOpposite) {
        subEl.classList.add(params.progressbarOppositeClass);
      }
      if (params.clickable) {
        subEl.addEventListener("click", onBulletClick);
      }
      if (!swiper.enabled) {
        subEl.classList.add(params.lockClass);
      }
    });
  }
  function destroy() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => {
        subEl.classList.remove(params.hiddenClass);
        subEl.classList.remove(params.modifierClass + params.type);
        subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (params.clickable) {
          subEl.classList.remove(...(params.clickableClass || "").split(" "));
          subEl.removeEventListener("click", onBulletClick);
        }
      });
    }
    if (swiper.pagination.bullets) swiper.pagination.bullets.forEach((subEl) => subEl.classList.remove(...params.bulletActiveClass.split(" ")));
  }
  on("changeDirection", () => {
    if (!swiper.pagination || !swiper.pagination.el) return;
    const params = swiper.params.pagination;
    let {
      el
    } = swiper.pagination;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      subEl.classList.remove(params.horizontalClass, params.verticalClass);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
    });
  });
  on("init", () => {
    if (swiper.params.pagination.enabled === false) {
      disable();
    } else {
      init();
      render();
      update();
    }
  });
  on("activeIndexChange", () => {
    if (typeof swiper.snapIndex === "undefined") {
      update();
    }
  });
  on("snapIndexChange", () => {
    update();
  });
  on("snapGridLengthChange", () => {
    render();
    update();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass));
    }
  });
  on("lock unlock", () => {
    update();
  });
  on("click", (_s, e) => {
    const targetEl = e.target;
    const el = makeElementsArray(swiper.pagination.el);
    if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
      if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
      const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
      if (isHidden === true) {
        emit("paginationShow");
      } else {
        emit("paginationHide");
      }
      el.forEach((subEl) => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
    }
    init();
    render();
    update();
  };
  const disable = () => {
    swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
    }
    destroy();
  };
  Object.assign(swiper.pagination, {
    enable,
    disable,
    render,
    update,
    init,
    destroy
  });
}
function effectInit(params) {
  const {
    effect,
    swiper,
    on,
    setTranslate,
    setTransition,
    overwriteParams,
    perspective,
    recreateShadows,
    getEffectParams
  } = params;
  on("beforeInit", () => {
    if (swiper.params.effect !== effect) return;
    swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
    if (perspective && perspective()) {
      swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
    }
    const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
    Object.assign(swiper.params, overwriteParamsResult);
    Object.assign(swiper.originalParams, overwriteParamsResult);
  });
  on("setTranslate", () => {
    if (swiper.params.effect !== effect) return;
    setTranslate();
  });
  on("setTransition", (_s, duration) => {
    if (swiper.params.effect !== effect) return;
    setTransition(duration);
  });
  on("transitionEnd", () => {
    if (swiper.params.effect !== effect) return;
    if (recreateShadows) {
      if (!getEffectParams || !getEffectParams().slideShadows) return;
      swiper.slides.forEach((slideEl) => {
        slideEl.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((shadowEl) => shadowEl.remove());
      });
      recreateShadows();
    }
  });
  let requireUpdateOnVirtual;
  on("virtualUpdate", () => {
    if (swiper.params.effect !== effect) return;
    if (!swiper.slides.length) {
      requireUpdateOnVirtual = true;
    }
    requestAnimationFrame(() => {
      if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
        setTranslate();
        requireUpdateOnVirtual = false;
      }
    });
  });
}
function effectTarget(effectParams, slideEl) {
  const transformEl = getSlideTransformEl(slideEl);
  if (transformEl !== slideEl) {
    transformEl.style.backfaceVisibility = "hidden";
    transformEl.style["-webkit-backface-visibility"] = "hidden";
  }
  return transformEl;
}
function effectVirtualTransitionEnd(_ref) {
  let {
    swiper,
    duration,
    transformElements,
    allSlides
  } = _ref;
  const {
    activeIndex
  } = swiper;
  const getSlide = (el) => {
    if (!el.parentElement) {
      const slide = swiper.slides.find((slideEl) => slideEl.shadowRoot && slideEl.shadowRoot === el.parentNode);
      return slide;
    }
    return el.parentElement;
  };
  if (swiper.params.virtualTranslate && duration !== 0) {
    let eventTriggered = false;
    let transitionEndTarget;
    if (allSlides) {
      transitionEndTarget = transformElements;
    } else {
      transitionEndTarget = transformElements.filter((transformEl) => {
        const el = transformEl.classList.contains("swiper-slide-transform") ? getSlide(transformEl) : transformEl;
        return swiper.getSlideIndex(el) === activeIndex;
      });
    }
    transitionEndTarget.forEach((el) => {
      elementTransitionEnd(el, () => {
        if (eventTriggered) return;
        if (!swiper || swiper.destroyed) return;
        eventTriggered = true;
        swiper.animating = false;
        const evt = new (undefined).CustomEvent("transitionend", {
          bubbles: true,
          cancelable: true
        });
        swiper.wrapperEl.dispatchEvent(evt);
      });
    });
  }
}
function EffectFade(_ref) {
  let {
    swiper,
    extendParams,
    on
  } = _ref;
  extendParams({
    fadeEffect: {
      crossFade: false
    }
  });
  const setTranslate = () => {
    const {
      slides
    } = swiper;
    const params = swiper.params.fadeEffect;
    for (let i = 0; i < slides.length; i += 1) {
      const slideEl = swiper.slides[i];
      const offset = slideEl.swiperSlideOffset;
      let tx = -offset;
      if (!swiper.params.virtualTranslate) tx -= swiper.translate;
      let ty = 0;
      if (!swiper.isHorizontal()) {
        ty = tx;
        tx = 0;
      }
      const slideOpacity = swiper.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(slideEl.progress), 0) : 1 + Math.min(Math.max(slideEl.progress, -1), 0);
      const targetEl = effectTarget(params, slideEl);
      targetEl.style.opacity = slideOpacity;
      targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
    }
  };
  const setTransition = (duration) => {
    const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
    transformElements.forEach((el) => {
      el.style.transitionDuration = `${duration}ms`;
    });
    effectVirtualTransitionEnd({
      swiper,
      duration,
      transformElements,
      allSlides: true
    });
  };
  effectInit({
    effect: "fade",
    swiper,
    on,
    setTranslate,
    setTransition,
    overwriteParams: () => ({
      slidesPerView: 1,
      slidesPerGroup: 1,
      watchSlidesProgress: true,
      spaceBetween: 0,
      virtualTranslate: !swiper.params.cssMode
    })
  });
}
const _sfc_main$7 = {
  __name: "imagelayout",
  __ssrInlineRender: true,
  props: {
    titreDeLaSection: String,
    image: Object
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen" }, _attrs))}>${ssrInterpolate((_b = (_a = props == null ? undefined : props.image) == null ? undefined : _a.node) == null ? undefined : _b.guid)} <img${ssrRenderAttr("src", (_d = (_c = props == null ? undefined : props.image) == null ? undefined : _c.node) == null ? undefined : _d.guid)}${ssrRenderAttr("alt", "test")} class="${ssrRenderClass("h-screen w-full object-cover")}"></div>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/acf/imagelayout.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : undefined;
};
const _sfc_main$6 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<h1${ssrRenderAttrs(_attrs)}>cat\xE9</h1>`);
}
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/acf/contenulayout.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : undefined;
};
const ContenuLayout = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$5 = {
  __name: "guidevoyagelayout",
  __ssrInlineRender: true,
  props: {
    titreDeLaSection: String,
    categorie: Object
  },
  async setup(__props) {
    let __temp, __restore;
    const { decode } = he;
    const config = useRuntimeConfig();
    const props = __props;
    const posts = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentArticle = ref({
      title: "",
      location: "",
      summary: ""
    });
    const variables = {
      categorySlug: props.categorie.nodes[0].slug,
      limit: 10
    };
    const { data, pending, error: fetchError } = ([__temp, __restore] = withAsyncContext(() => useFetch(config.public.wordpressUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
      query GetPostsByCategory($categorySlug: String!, $limit: Int!) {
        posts(where: { categoryName: $categorySlug }, first: $limit) {
          edges {
            node {
              id
              title
              excerpt
              slug
              optionsArticles {
                imagePortait {
                  node {
                    guid
                    srcSet
                  }
                }
                champsLibrePageAccueil
              }
              categories(first:40) {
                edges {
                  node {
                    id
                    name
                    slug
                    children {
                      nodes {
                        id
                        name
                        slug
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
        variables
      }),
      transform: (data2) => data2.data.posts.edges.map((edge) => edge.node)
    }, "$brNPj6Mhd6")), __temp = await __temp, __restore(), __temp);
    watchEffect(() => {
      var _a, _b, _c;
      if (pending.value) {
        loading.value = true;
      } else if (fetchError.value) {
        error.value = fetchError.value.message;
        loading.value = false;
      } else if (data.value) {
        posts.value = data.value || [];
        if (posts.value.length > 0) {
          currentArticle.value = {
            title: posts.value[0].title,
            location: (_c = (_b = (_a = posts.value[0].categories) == null ? undefined : _a.edges) == null ? undefined : _b[0]) == null ? undefined : _c.node.name,
            summary: decode(posts.value[0].excerpt.replace(/<\/?[^>]+(>|$)/g, ""))
          };
        }
        loading.value = false;
      }
    });
    const onSlideChange = (swiper) => {
      var _a, _b, _c;
      const index = swiper.activeIndex;
      const article = posts.value[index];
      if (article) {
        currentArticle.value = {
          title: article.title,
          location: (_c = (_b = (_a = article.categories) == null ? undefined : _a.edges) == null ? undefined : _b[0]) == null ? undefined : _c.node.name,
          summary: decode(article.excerpt.replace(/<\/?[^>]+(>|$)/g, ""))
        };
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "my-20 max-w-screen-full mx-auto" }, _attrs))}><h2 class="md:text-[110pt] pl-[5rem] lg:pl-[15rem] text-center lg:text-left font-custom text-[5rem] lg:text-[7rem] mb-10 lg:mb-0">${ssrInterpolate(__props.titreDeLaSection)}</h2>`);
      if (loading.value) {
        _push(`<div class="text-center mt-6">Chargement...</div>`);
      } else if (error.value) {
        _push(`<div class="text-center mt-6 text-red-500">Erreur : ${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<div class="flex flex-row items-center mt-10"><div class="w-1/2 lg:w-2/6 text-left mb-10 lg:mb-0 px-[2rem] lg:px-[10rem]"><h2 class="text-[20px] uppercase font-brandon_grotesquemedium">${ssrInterpolate(currentArticle.value.title)}</h2><h3 class="text-[20px] text-gray-600 lato-light-italic">${ssrInterpolate(currentArticle.value.location)}</h3><p class="mt-4 text-sm lato-light font-[20pt]">${ssrInterpolate(currentArticle.value.summary)}</p><button class="mt-10 px-4 py-2 bg-black text-white text-sm uppercase lato-regular">Lire la suite</button></div><div class="w-1/2 lg:w-4/6 overflow-hidden pl-[1rem]">`);
        _push(ssrRenderComponent(unref(Swiper), {
          class: "mySwiper",
          "slides-per-view": 1.2,
          "space-between": 20,
          breakpoints: {
            640: { slidesPerView: 1.7, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 2.5, spaceBetween: 40 }
          },
          onSlideChange
        }, {
          default: withCtx((_2, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(posts.value, (post, index) => {
                _push2(ssrRenderComponent(unref(SwiperSlide), {
                  key: post.id,
                  class: "carousel-item"
                }, {
                  default: withCtx((_22, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<div class="slide-content group relative"${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_NuxtLink, {
                        to: "/articles/" + post.slug
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          var _a2;
                          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
                          if (_push4) {
                            _push4(`<div class="w-full h-[300px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden"${_scopeId3}><img${ssrRenderAttr("src", (_b = (_a = post.optionsArticles.imagePortait) == null ? undefined : _a.node) == null ? undefined : _b.guid)}${ssrRenderAttr("srcset", (_d = (_c = post.optionsArticles.imagePortait) == null ? undefined : _c.node) == null ? undefined : _d.srcSet)}${ssrRenderAttr("alt", post.title)} class="w-full h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-lg"${_scopeId3}></div><div class="mt-3"${_scopeId3}><p class="mb-1 font-brandon_grotesquelight_italic uppercase text-[12px] z-9"${_scopeId3}>${(_a2 = (_g = (_f = (_e = post.categories) == null ? undefined : _e.edges) == null ? undefined : _f[0]) == null ? undefined : _g.node.name) != null ? _a2 : ""}</p><h3 class="mt-2 text-[15px] font-brandon_grotesquemedium uppercase text-left"${_scopeId3}>${ssrInterpolate(post.title)}</h3></div>`);
                          } else {
                            return [
                              createVNode("div", { class: "w-full h-[300px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden" }, [
                                createVNode("img", {
                                  src: (_i = (_h = post.optionsArticles.imagePortait) == null ? undefined : _h.node) == null ? undefined : _i.guid,
                                  srcset: (_k = (_j = post.optionsArticles.imagePortait) == null ? undefined : _j.node) == null ? undefined : _k.srcSet,
                                  alt: post.title,
                                  class: "w-full h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-lg"
                                }, null, 8, ["src", "srcset", "alt"])
                              ]),
                              createVNode("div", { class: "mt-3" }, [
                                createVNode("p", {
                                  class: "mb-1 font-brandon_grotesquelight_italic uppercase text-[12px] z-9",
                                  innerHTML: (_n = (_m = (_l = post.categories) == null ? undefined : _l.edges) == null ? undefined : _m[0]) == null ? undefined : _n.node.name
                                }, null, 8, ["innerHTML"]),
                                createVNode("h3", { class: "mt-2 text-[15px] font-brandon_grotesquemedium uppercase text-left" }, toDisplayString(post.title), 1)
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                      _push3(`</div>`);
                    } else {
                      return [
                        createVNode("div", { class: "slide-content group relative" }, [
                          createVNode(_component_NuxtLink, {
                            to: "/articles/" + post.slug
                          }, {
                            default: withCtx(() => {
                              var _a, _b, _c, _d, _e, _f, _g;
                              return [
                                createVNode("div", { class: "w-full h-[300px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden" }, [
                                  createVNode("img", {
                                    src: (_b = (_a = post.optionsArticles.imagePortait) == null ? undefined : _a.node) == null ? undefined : _b.guid,
                                    srcset: (_d = (_c = post.optionsArticles.imagePortait) == null ? undefined : _c.node) == null ? undefined : _d.srcSet,
                                    alt: post.title,
                                    class: "w-full h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-lg"
                                  }, null, 8, ["src", "srcset", "alt"])
                                ]),
                                createVNode("div", { class: "mt-3" }, [
                                  createVNode("p", {
                                    class: "mb-1 font-brandon_grotesquelight_italic uppercase text-[12px] z-9",
                                    innerHTML: (_g = (_f = (_e = post.categories) == null ? undefined : _e.edges) == null ? undefined : _f[0]) == null ? undefined : _g.node.name
                                  }, null, 8, ["innerHTML"]),
                                  createVNode("h3", { class: "mt-2 text-[15px] font-brandon_grotesquemedium uppercase text-left" }, toDisplayString(post.title), 1)
                                ])
                              ];
                            }),
                            _: 2
                          }, 1032, ["to"])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(posts.value, (post, index) => {
                  return openBlock(), createBlock(unref(SwiperSlide), {
                    key: post.id,
                    class: "carousel-item"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "slide-content group relative" }, [
                        createVNode(_component_NuxtLink, {
                          to: "/articles/" + post.slug
                        }, {
                          default: withCtx(() => {
                            var _a, _b, _c, _d, _e, _f, _g;
                            return [
                              createVNode("div", { class: "w-full h-[300px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden" }, [
                                createVNode("img", {
                                  src: (_b = (_a = post.optionsArticles.imagePortait) == null ? undefined : _a.node) == null ? undefined : _b.guid,
                                  srcset: (_d = (_c = post.optionsArticles.imagePortait) == null ? undefined : _c.node) == null ? undefined : _d.srcSet,
                                  alt: post.title,
                                  class: "w-full h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-lg"
                                }, null, 8, ["src", "srcset", "alt"])
                              ]),
                              createVNode("div", { class: "mt-3" }, [
                                createVNode("p", {
                                  class: "mb-1 font-brandon_grotesquelight_italic uppercase text-[12px] z-9",
                                  innerHTML: (_g = (_f = (_e = post.categories) == null ? undefined : _e.edges) == null ? undefined : _f[0]) == null ? undefined : _g.node.name
                                }, null, 8, ["innerHTML"]),
                                createVNode("h3", { class: "mt-2 text-[15px] font-brandon_grotesquemedium uppercase text-left" }, toDisplayString(post.title), 1)
                              ])
                            ];
                          }),
                          _: 2
                        }, 1032, ["to"])
                      ])
                    ]),
                    _: 2
                  }, 1024);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/acf/guidevoyagelayout.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : undefined;
};
const _sfc_main$4 = {
  __name: "carousellayout",
  __ssrInlineRender: true,
  props: {
    titreDeLaSection: String,
    categorie: Object,
    postParPage: String,
    headline: String,
    contenu: String
  },
  setup(__props) {
    const config = useRuntimeConfig();
    const props = __props;
    const posts = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentArticle = ref({
      title: "",
      location: "",
      summary: ""
    });
    const fetchPosts = async () => {
      var _a, _b;
      loading.value = true;
      error.value = null;
      try {
        const { data } = await useFetch(config.public.wordpressUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `
          query GetPostsByCategory($categorySlug: String!, $limit: Int!) {
            posts(where: { categoryName: $categorySlug }, first: $limit) {
              edges {
                node {
                  id
                  title
                  excerpt
                  slug
                  categories {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                  optionsArticles {
                    imagePortait {
                      node {
                        guid
                        srcSet
                      }
                    }
                    champsLibrePageAccueil
                  }
                }
              }
            }
          }
        `,
            variables: {
              categorySlug: ((_a = props.categorie.nodes[0]) == null ? void 0 : _a.slug) || "",
              limit: props.postParPage
            }
          }),
          key: ((_b = props.categorie.nodes[0]) == null ? void 0 : _b.slug) || "default-key",
          transform: (data2) => data2.data.posts.edges.map((edge) => edge.node)
        }, "$6GArhoVvdQ");
        posts.value = data.value || [];
        if (posts.value.length > 0) {
          currentArticle.value = {
            title: posts.value[0].title,
            location: posts.value[0].categories.edges[0].node.name,
            summary: posts.value[0].excerpt
          };
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    fetchPosts();
    const onSlideChange = (swiper) => {
      const index = swiper.activeIndex;
      const article = posts.value[index];
      if (article) {
        currentArticle.value = {
          title: article.title,
          location: article.categories.edges[0].node.name,
          summary: article.excerpt.replace(/<\/?[^>]+(>|$)/g, "")
        };
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "my-20" }, _attrs))}>`);
      if (loading.value) {
        _push(`<div class="text-center">Chargement...</div>`);
      } else if (error.value) {
        _push(`<div class="text-center text-red-500">Erreur : ${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<div class="${ssrRenderClass({
          "max-w-screen-full mx-auto flex lg:flex-row items-end overflow-hidden mb-[3rem]": props.postParPage > 2,
          "max-w-screen-full mx-auto flex lg:flex-row items-center overflow-hidden": props.postParPage <= 2
        })}"><div class="${ssrRenderClass([{
          "w-1/2 lg:w-2/5 px-4 md:px-10 lg:px-[10rem] text-left lg:mb-10": props.postParPage > 2,
          "w-1/2 lg:w-3/5 px-4 md:px-10 lg:px-[10rem] text-left ": props.postParPage <= 2
        }, "mb-10 lg:mb-0 lg:text-left"])}"><h3 class="lg:text-sm lg:text-lg lato-light">${ssrInterpolate(__props.headline)}</h3><h2 class="${ssrRenderClass([{
          "text-[4rem]": props.postParPage > 2,
          "text-[3rem] z-10 relative": props.postParPage <= 2
        }, "lg:text-[5rem] font-schnyder_wide_xl_webdemi"])}">${ssrInterpolate(__props.titreDeLaSection)}</h2><div class="mt-4 pr-0 lg:pr-[4rem] 3xl:pr-[10rem] text-sm lato-light">${(_a = __props.contenu) != null ? _a : ""}</div></div><div class="${ssrRenderClass([{
          "w-1/2 lg:w-3/5": props.postParPage > 2,
          "w-1/2 lg:w-2/5": props.postParPage <= 2
        }, "overflow-hidden pl-5 lg:pl-0"])}">`);
        _push(ssrRenderComponent(unref(Swiper), {
          class: "mySwiper",
          "slides-per-view": 1.2,
          "space-between": 20,
          breakpoints: {
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: props.postParPage > 2 ? 2.5 : 1.5, spaceBetween: 40 }
          },
          onSlideChange
        }, {
          default: withCtx((_2, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(posts.value, (post, index) => {
                _push2(ssrRenderComponent(unref(SwiperSlide), {
                  key: post.id,
                  class: "carousel-item"
                }, {
                  default: withCtx((_22, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<div class="slide-content group relative"${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_NuxtLink, {
                        to: "/articles/" + post.slug
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          var _a3;
                          var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j;
                          if (_push4) {
                            _push4(`<div class="w-full h-[275px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden"${_scopeId3}><img${ssrRenderAttr("src", (_b = (_a2 = post.optionsArticles.imagePortait) == null ? undefined : _a2.node) == null ? undefined : _b.guid)}${ssrRenderAttr("srcset", (_d = (_c = post.optionsArticles.imagePortait) == null ? undefined : _c.node) == null ? undefined : _d.srcSet)}${ssrRenderAttr("alt", post.title)} class="h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-md"${_scopeId3}></div><div class="mt-3"${_scopeId3}><p class="mb-1 font-brandon_grotesquelight_italic uppercase text-xs z-9"${_scopeId3}>${(_a3 = (_e = post.optionsArticles) == null ? undefined : _e.champsLibrePageAccueil) != null ? _a3 : ""}</p><h3 class="text-base font-brandon_grotesquemedium uppercase"${_scopeId3}>${ssrInterpolate(post.title)}</h3></div>`);
                          } else {
                            return [
                              createVNode("div", { class: "w-full h-[275px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden" }, [
                                createVNode("img", {
                                  src: (_g = (_f = post.optionsArticles.imagePortait) == null ? undefined : _f.node) == null ? undefined : _g.guid,
                                  srcset: (_i = (_h = post.optionsArticles.imagePortait) == null ? undefined : _h.node) == null ? undefined : _i.srcSet,
                                  alt: post.title,
                                  class: "h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-md"
                                }, null, 8, ["src", "srcset", "alt"])
                              ]),
                              createVNode("div", { class: "mt-3" }, [
                                createVNode("p", {
                                  class: "mb-1 font-brandon_grotesquelight_italic uppercase text-xs z-9",
                                  innerHTML: (_j = post.optionsArticles) == null ? undefined : _j.champsLibrePageAccueil
                                }, null, 8, ["innerHTML"]),
                                createVNode("h3", { class: "text-base font-brandon_grotesquemedium uppercase" }, toDisplayString(post.title), 1)
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                      _push3(`</div>`);
                    } else {
                      return [
                        createVNode("div", { class: "slide-content group relative" }, [
                          createVNode(_component_NuxtLink, {
                            to: "/articles/" + post.slug
                          }, {
                            default: withCtx(() => {
                              var _a2, _b, _c, _d, _e;
                              return [
                                createVNode("div", { class: "w-full h-[275px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden" }, [
                                  createVNode("img", {
                                    src: (_b = (_a2 = post.optionsArticles.imagePortait) == null ? undefined : _a2.node) == null ? undefined : _b.guid,
                                    srcset: (_d = (_c = post.optionsArticles.imagePortait) == null ? undefined : _c.node) == null ? undefined : _d.srcSet,
                                    alt: post.title,
                                    class: "h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-md"
                                  }, null, 8, ["src", "srcset", "alt"])
                                ]),
                                createVNode("div", { class: "mt-3" }, [
                                  createVNode("p", {
                                    class: "mb-1 font-brandon_grotesquelight_italic uppercase text-xs z-9",
                                    innerHTML: (_e = post.optionsArticles) == null ? undefined : _e.champsLibrePageAccueil
                                  }, null, 8, ["innerHTML"]),
                                  createVNode("h3", { class: "text-base font-brandon_grotesquemedium uppercase" }, toDisplayString(post.title), 1)
                                ])
                              ];
                            }),
                            _: 2
                          }, 1032, ["to"])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(posts.value, (post, index) => {
                  return openBlock(), createBlock(unref(SwiperSlide), {
                    key: post.id,
                    class: "carousel-item"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "slide-content group relative" }, [
                        createVNode(_component_NuxtLink, {
                          to: "/articles/" + post.slug
                        }, {
                          default: withCtx(() => {
                            var _a2, _b, _c, _d, _e;
                            return [
                              createVNode("div", { class: "w-full h-[275px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden" }, [
                                createVNode("img", {
                                  src: (_b = (_a2 = post.optionsArticles.imagePortait) == null ? undefined : _a2.node) == null ? undefined : _b.guid,
                                  srcset: (_d = (_c = post.optionsArticles.imagePortait) == null ? undefined : _c.node) == null ? undefined : _d.srcSet,
                                  alt: post.title,
                                  class: "h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-md"
                                }, null, 8, ["src", "srcset", "alt"])
                              ]),
                              createVNode("div", { class: "mt-3" }, [
                                createVNode("p", {
                                  class: "mb-1 font-brandon_grotesquelight_italic uppercase text-xs z-9",
                                  innerHTML: (_e = post.optionsArticles) == null ? undefined : _e.champsLibrePageAccueil
                                }, null, 8, ["innerHTML"]),
                                createVNode("h3", { class: "text-base font-brandon_grotesquemedium uppercase" }, toDisplayString(post.title), 1)
                              ])
                            ];
                          }),
                          _: 2
                        }, 1032, ["to"])
                      ])
                    ]),
                    _: 2
                  }, 1024);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/acf/carousellayout.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : undefined;
};
const _sfc_main$3 = {
  __name: "guidelayout",
  __ssrInlineRender: true,
  props: {
    titreDeLaSection: String,
    categorie: Object,
    lien: Object
  },
  setup(__props) {
    Swiper$1.use([Navigation, Pagination, EffectFade]);
    const config = useRuntimeConfig();
    const props = __props;
    const posts = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentArticle = ref({
      title: "",
      location: "",
      summary: ""
    });
    const fetchPosts = async () => {
      var _a, _b;
      loading.value = true;
      error.value = null;
      try {
        const { data } = await useFetch(config.public.wordpressUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `
            query GetPostsByCategory($categorySlug: String!, $limit: Int!) {
              posts(where: { categoryName: $categorySlug }, first: $limit) {
                edges {
                  node {
                    id
                    title
                    excerpt
                    slug
                    categories {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                    optionsArticles {
                      imagePaysage {
                        node {
                          guid
                          srcSet
                        }
                      }
                      champsLibrePageAccueil
                      champsLibre
                    }
                  }
                }
              }
            }
          `,
            variables: {
              categorySlug: ((_a = props.categorie.nodes[0]) == null ? void 0 : _a.slug) || "",
              limit: 10
            }
          }),
          key: ((_b = props.categorie.nodes[0]) == null ? void 0 : _b.slug) || "default-key",
          transform: (data2) => data2.data.posts.edges.map((edge) => edge.node)
        }, "$MAfNohp9xq");
        posts.value = data.value || [];
        if (posts.value.length > 0) {
          currentArticle.value = {
            title: posts.value[0].title,
            location: posts.value[0].categories.edges[0].node.name,
            summary: posts.value[0].excerpt
          };
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    fetchPosts();
    const onSlideChange = (swiper) => {
      const index = swiper.activeIndex;
      const article = posts.value[index];
      if (article) {
        currentArticle.value = {
          title: article.title,
          location: article.categories.edges[0].node.name,
          summary: article.excerpt.replace(/<\/?[^>]+(>|$)/g, "")
        };
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-zinc-900 my-20 max-w-screen-full mx-auto" }, _attrs))} data-v-c969a4b5>`);
      if (loading.value) {
        _push(`<div class="text-center text-white py-6" data-v-c969a4b5>Chargement...</div>`);
      } else if (error.value) {
        _push(`<div class="text-center text-red-500 py-6" data-v-c969a4b5>Erreur : ${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<div class="flex flex-col lg:flex-row items-center lg:h-[80vh]" data-v-c969a4b5><div class="w-full lg:w-10/12 relative" data-v-c969a4b5>`);
        _push(ssrRenderComponent(unref(Swiper), {
          class: "mySwiper",
          "slides-per-view": 1,
          "space-between": 20,
          effect: "fade",
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
          },
          pagination: {
            el: ".custom-pagination",
            clickable: true
          },
          onSlideChange
        }, {
          default: withCtx((_2, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(posts.value, (post, index) => {
                _push2(ssrRenderComponent(unref(SwiperSlide), {
                  key: post.id,
                  class: "carousel-item transition-shadow duration-300"
                }, {
                  default: withCtx((_22, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<div class="relative" data-v-c969a4b5${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_NuxtLink, {
                        to: "/articles/" + post.slug
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          var _a, _b, _c, _d, _e, _f, _g, _h;
                          if (_push4) {
                            _push4(`<img${ssrRenderAttr("src", (_b = (_a = post.optionsArticles.imagePaysage) == null ? undefined : _a.node) == null ? undefined : _b.guid)}${ssrRenderAttr("srcset", (_d = (_c = post.optionsArticles.imagePaysage) == null ? undefined : _c.node) == null ? undefined : _d.srcSet)}${ssrRenderAttr("alt", post.title)} class="w-full h-[500px] md:h-[450px] lg:h-[80vh] object-cover" data-v-c969a4b5${_scopeId3}><div class="absolute inset-0 flex flex-col items-center justify-center text-center text-white" data-v-c969a4b5${_scopeId3}><h3 class="text-2xl md:text-4xl lg:text-6xl font-schnyder_wide_xl_webdemi" data-v-c969a4b5${_scopeId3}>${ssrInterpolate(post.title)}</h3><h4 class="text-sm md:text-lg uppercase mt-2 md:mt-4 font-montserrat" data-v-c969a4b5${_scopeId3}>${ssrInterpolate(post.optionsArticles.champsLibrePageAccueil)}</h4></div>`);
                          } else {
                            return [
                              createVNode("img", {
                                src: (_f = (_e = post.optionsArticles.imagePaysage) == null ? undefined : _e.node) == null ? undefined : _f.guid,
                                srcset: (_h = (_g = post.optionsArticles.imagePaysage) == null ? undefined : _g.node) == null ? undefined : _h.srcSet,
                                alt: post.title,
                                class: "w-full h-[500px] md:h-[450px] lg:h-[80vh] object-cover"
                              }, null, 8, ["src", "srcset", "alt"]),
                              createVNode("div", { class: "absolute inset-0 flex flex-col items-center justify-center text-center text-white" }, [
                                createVNode("h3", { class: "text-2xl md:text-4xl lg:text-6xl font-schnyder_wide_xl_webdemi" }, toDisplayString(post.title), 1),
                                createVNode("h4", { class: "text-sm md:text-lg uppercase mt-2 md:mt-4 font-montserrat" }, toDisplayString(post.optionsArticles.champsLibrePageAccueil), 1)
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                      _push3(`</div>`);
                    } else {
                      return [
                        createVNode("div", { class: "relative" }, [
                          createVNode(_component_NuxtLink, {
                            to: "/articles/" + post.slug
                          }, {
                            default: withCtx(() => {
                              var _a, _b, _c, _d;
                              return [
                                createVNode("img", {
                                  src: (_b = (_a = post.optionsArticles.imagePaysage) == null ? undefined : _a.node) == null ? undefined : _b.guid,
                                  srcset: (_d = (_c = post.optionsArticles.imagePaysage) == null ? undefined : _c.node) == null ? undefined : _d.srcSet,
                                  alt: post.title,
                                  class: "w-full h-[500px] md:h-[450px] lg:h-[80vh] object-cover"
                                }, null, 8, ["src", "srcset", "alt"]),
                                createVNode("div", { class: "absolute inset-0 flex flex-col items-center justify-center text-center text-white" }, [
                                  createVNode("h3", { class: "text-2xl md:text-4xl lg:text-6xl font-schnyder_wide_xl_webdemi" }, toDisplayString(post.title), 1),
                                  createVNode("h4", { class: "text-sm md:text-lg uppercase mt-2 md:mt-4 font-montserrat" }, toDisplayString(post.optionsArticles.champsLibrePageAccueil), 1)
                                ])
                              ];
                            }),
                            _: 2
                          }, 1032, ["to"])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(posts.value, (post, index) => {
                  return openBlock(), createBlock(unref(SwiperSlide), {
                    key: post.id,
                    class: "carousel-item transition-shadow duration-300"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "relative" }, [
                        createVNode(_component_NuxtLink, {
                          to: "/articles/" + post.slug
                        }, {
                          default: withCtx(() => {
                            var _a, _b, _c, _d;
                            return [
                              createVNode("img", {
                                src: (_b = (_a = post.optionsArticles.imagePaysage) == null ? undefined : _a.node) == null ? undefined : _b.guid,
                                srcset: (_d = (_c = post.optionsArticles.imagePaysage) == null ? undefined : _c.node) == null ? undefined : _d.srcSet,
                                alt: post.title,
                                class: "w-full h-[500px] md:h-[450px] lg:h-[80vh] object-cover"
                              }, null, 8, ["src", "srcset", "alt"]),
                              createVNode("div", { class: "absolute inset-0 flex flex-col items-center justify-center text-center text-white" }, [
                                createVNode("h3", { class: "text-2xl md:text-4xl lg:text-6xl font-schnyder_wide_xl_webdemi" }, toDisplayString(post.title), 1),
                                createVNode("h4", { class: "text-sm md:text-lg uppercase mt-2 md:mt-4 font-montserrat" }, toDisplayString(post.optionsArticles.champsLibrePageAccueil), 1)
                              ])
                            ];
                          }),
                          _: 2
                        }, 1032, ["to"])
                      ])
                    ]),
                    _: 2
                  }, 1024);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="swiper-button-prev" data-v-c969a4b5></div><div class="swiper-button-next" data-v-c969a4b5></div><div class="custom-pagination" data-v-c969a4b5></div></div><div class="w-full lg:w-2/12 flex items-center justify-center my-6 lg:my-0" data-v-c969a4b5>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: __props.lien.url,
          class: "px-4 py-2 text-white text-sm uppercase font-montserrat rounded-md transform rotate-0 lg:-rotate-90"
        }, {
          default: withCtx((_2, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(__props.lien.title)}`);
            } else {
              return [
                createTextVNode(toDisplayString(__props.lien.title), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/acf/guidelayout.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : undefined;
};
const GuideLayout = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-c969a4b5"]]);
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = Symbol.for("nuxt:client-only");
const __nuxt_component_0 = defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_2, { slots, attrs }) {
    const mounted = ref(false);
    provide(clientOnlySymbol, true);
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? undefined : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const _sfc_main$2 = {
  __name: "sliderlayout",
  __ssrInlineRender: true,
  props: {
    titreDeLaSection: String,
    slider: Array
  },
  setup(__props) {
    const { debounce } = _;
    const config = useRuntimeConfig();
    useRouter();
    const searchQuery = ref("");
    const suggestions = ref([]);
    const fetchSuggestions = async () => {
      var _a, _b;
      if (searchQuery.value.length < 3) {
        suggestions.value = [];
        return;
      }
      const query = `
    query searchPosts {
      posts(first: 30) {
        nodes {
          id
          title
          slug
          optionsArticles {
            keywordSearch {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;
      try {
        const response = await $fetch(config.public.wordpressUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const allPosts = ((_b = (_a = response == null ? void 0 : response.data) == null ? void 0 : _a.posts) == null ? void 0 : _b.nodes) || [];
        const filteredPosts = allPosts.filter((post) => {
          var _a2, _b2, _c;
          const keywords = ((_c = (_b2 = (_a2 = post.optionsArticles) == null ? void 0 : _a2.keywordSearch) == null ? void 0 : _b2.edges) == null ? void 0 : _c.map((edge) => edge.node.name)) || [];
          const title = post.title || "";
          const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const input = normalize(searchQuery.value);
          return normalize(title).includes(input) || keywords.some((keyword) => normalize(keyword).includes(input));
        });
        suggestions.value = filteredPosts;
      } catch (err) {
        console.error("Erreur lors de la recherche:", err);
        suggestions.value = [];
      }
    };
    debounce(() => {
      fetchSuggestions();
    }, 300);
    const currentPlaceholder = ref("");
    ref(0);
    ref(0);
    const settingsStore = useSiteSettings();
    watch(() => settingsStore.siteTitle, (newTitle) => {
      console.log("Nouveau titre re\xE7u :", newTitle);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full h-screen relative" }, _attrs))}><div class="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-full z-20"><div class="text-center text-white mb-[10vh] mt-[-5vh]"><h1 class="text-[45pt] lg:text-[103pt] font-custom">${ssrInterpolate(unref(settingsStore).siteTitle)}</h1><p class="text-[8pt] lg:text-[10pt] font-montserrat uppercase">${ssrInterpolate(unref(settingsStore).siteDescription)}</p></div><div class="flex flex-col items-center w-full relative mx-auto px-3"><div class="flex flex-row max-w-2xl w-full mx-auto"><input type="text"${ssrRenderAttr("value", searchQuery.value)}${ssrRenderAttr("placeholder", "Vous recherchez " + currentPlaceholder.value)} class="border border-gray-300 rounded-l p-2 w-full focus:outline-none focus:border-blue-500"><button class="bg-black text-white px-4 rounded-r font-semibold hover:bg-gray-900 transition" aria-label="Rechercher"> Rechercher </button></div>`);
      if (suggestions.value.length) {
        _push(`<ul class="absolute left-0 right-0 max-w-2xl w-full z-10 bg-white shadow mt-1 rounded text-left mx-auto" style="${ssrRenderStyle({ "top": "100%" })}"><!--[-->`);
        ssrRenderList(suggestions.value, (post) => {
          _push(`<li class="p-2 hover:bg-gray-200 cursor-pointer">${ssrInterpolate(post.title)}</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/acf/sliderlayout.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : undefined;
};
const _sfc_main$1 = {
  __name: "portraitlayout",
  __ssrInlineRender: true,
  props: {
    titreDeLaSection: String,
    categorie: Object,
    postParPage: String,
    headline: String,
    contenu: String
  },
  setup(__props) {
    Swiper$1.use([Navigation, Pagination, EffectFade]);
    const config = useRuntimeConfig();
    const props = __props;
    const posts = ref([]);
    const currentIndex = ref(0);
    const isVisible = ref(false);
    const loading = ref(true);
    const error = ref(null);
    const fetchPosts = async () => {
      var _a, _b;
      loading.value = true;
      error.value = null;
      try {
        const { data } = await useFetch(config.public.wordpressUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `
          query GetPostsByCategory($categorySlug: String!, $limit: Int!) {
            posts(where: { categoryName: $categorySlug }, first: $limit) {
              edges {
                node {
                  id
                  title
                  excerpt
                  slug
                  categories {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                  optionsArticles {
                    imagePaysage {
                      node {
                        guid
                        srcSet
                      }
                    }
                  }
                }
              }
            }
          }
        `,
            variables: {
              categorySlug: ((_a = props.categorie.nodes[0]) == null ? void 0 : _a.slug) || "",
              limit: props.postParPage
            }
          }),
          key: ((_b = props.categorie.nodes[0]) == null ? void 0 : _b.slug) || "default-key",
          transform: (data2) => data2.data.posts.edges.map((edge) => edge.node)
        }, "$mn5T5gVWUI");
        posts.value = data.value || [];
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    const onSlideChange = (swiper) => {
      currentIndex.value = swiper.activeIndex % posts.value.length;
    };
    const blocPortrait = ref(null);
    fetchPosts();
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_nuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "blocPortrait",
        ref: blocPortrait,
        class: ["h-screen sm:flex sm:flex-col lg:block align-center py-20 relative mb-40 md:mb-0 lg:my-40 transition-colors duration-500 bloc-portrait overflow-hidden", { "bg-black": isVisible.value, "bg-white": !isVisible.value }]
      }, _attrs))}><div class="${ssrRenderClass([{ "text-white": isVisible.value, "text-black": !isVisible.value }, "sm:relative lg:absolute top-[6vw] sm:right-[10.5vw] lg:right-[0.5vw] w-50 md:w-full lg:w-1/2 flex flex-col lg:pl-6 lg:pr-24"])}"><h2 class="px-12 md:px-0 text-[7rem] mb-12 lg:pr-24 font-custom">${ssrInterpolate(__props.titreDeLaSection)}</h2><div class="mb-6 mt-[-4rem] pr-12 lg:pr-48 lato-light">${(_a = __props.contenu) != null ? _a : ""}</div></div>`);
      _push(ssrRenderComponent(unref(Swiper), {
        "slides-per-view": 2.9,
        "space-between": 0,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        },
        onSlideChange,
        class: "portrait-slider mx-4"
      }, {
        default: withCtx((_2, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(posts.value, (post, index) => {
              _push2(ssrRenderComponent(unref(SwiperSlide), {
                key: index,
                class: "relative p-4"
              }, {
                default: withCtx((_3, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_nuxtLink, {
                      to: "articles/" + post.slug || "#"
                    }, {
                      default: withCtx((_4, _push4, _parent4, _scopeId3) => {
                        var _a2, _b, _c, _d;
                        if (_push4) {
                          _push4(`<img${ssrRenderAttr("src", ((_b = (_a2 = post.optionsArticles.imagePaysage) == null ? undefined : _a2.node) == null ? undefined : _b.guid) || "")} alt="Image slide" class="h-[21rem] w-full object-cover border border-white"${_scopeId3}>`);
                        } else {
                          return [
                            createVNode("img", {
                              src: ((_d = (_c = post.optionsArticles.imagePaysage) == null ? undefined : _c.node) == null ? undefined : _d.guid) || "",
                              alt: "Image slide",
                              class: "h-[21rem] w-full object-cover border border-white"
                            }, null, 8, ["src"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(`<div class="${ssrRenderClass({
                      "text-xl": currentIndex.value === index,
                      "text-lg": currentIndex.value !== index,
                      "text-white": isVisible.value,
                      "text-black": !isVisible.value
                    })}"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_nuxtLink, {
                      to: "articles/" + post.slug || "#"
                    }, {
                      default: withCtx((_4, _push4, _parent4, _scopeId3) => {
                        var _a2, _b;
                        if (_push4) {
                          _push4(`<p class="text-sm lato-light"${_scopeId3}>${ssrInterpolate(((_a2 = post.categories.edges[0]) == null ? undefined : _a2.node.name) || "")}</p><h3 class="font-bold font-custom"${_scopeId3}>${ssrInterpolate(post.title)}</h3>`);
                        } else {
                          return [
                            createVNode("p", { class: "text-sm lato-light" }, toDisplayString(((_b = post.categories.edges[0]) == null ? undefined : _b.node.name) || ""), 1),
                            createVNode("h3", { class: "font-bold font-custom" }, toDisplayString(post.title), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode(_component_nuxtLink, {
                        to: "articles/" + post.slug || "#"
                      }, {
                        default: withCtx(() => {
                          var _a2, _b;
                          return [
                            createVNode("img", {
                              src: ((_b = (_a2 = post.optionsArticles.imagePaysage) == null ? undefined : _a2.node) == null ? undefined : _b.guid) || "",
                              alt: "Image slide",
                              class: "h-[21rem] w-full object-cover border border-white"
                            }, null, 8, ["src"])
                          ];
                        }),
                        _: 2
                      }, 1032, ["to"]),
                      createVNode("div", {
                        class: {
                          "text-xl": currentIndex.value === index,
                          "text-lg": currentIndex.value !== index,
                          "text-white": isVisible.value,
                          "text-black": !isVisible.value
                        }
                      }, [
                        createVNode(_component_nuxtLink, {
                          to: "articles/" + post.slug || "#"
                        }, {
                          default: withCtx(() => {
                            var _a2;
                            return [
                              createVNode("p", { class: "text-sm lato-light" }, toDisplayString(((_a2 = post.categories.edges[0]) == null ? undefined : _a2.node.name) || ""), 1),
                              createVNode("h3", { class: "font-bold font-custom" }, toDisplayString(post.title), 1)
                            ];
                          }),
                          _: 2
                        }, 1032, ["to"])
                      ], 2)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
          } else {
            return [
              (openBlock(true), createBlock(Fragment, null, renderList(posts.value, (post, index) => {
                return openBlock(), createBlock(unref(SwiperSlide), {
                  key: index,
                  class: "relative p-4"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_nuxtLink, {
                      to: "articles/" + post.slug || "#"
                    }, {
                      default: withCtx(() => {
                        var _a2, _b;
                        return [
                          createVNode("img", {
                            src: ((_b = (_a2 = post.optionsArticles.imagePaysage) == null ? undefined : _a2.node) == null ? undefined : _b.guid) || "",
                            alt: "Image slide",
                            class: "h-[21rem] w-full object-cover border border-white"
                          }, null, 8, ["src"])
                        ];
                      }),
                      _: 2
                    }, 1032, ["to"]),
                    createVNode("div", {
                      class: {
                        "text-xl": currentIndex.value === index,
                        "text-lg": currentIndex.value !== index,
                        "text-white": isVisible.value,
                        "text-black": !isVisible.value
                      }
                    }, [
                      createVNode(_component_nuxtLink, {
                        to: "articles/" + post.slug || "#"
                      }, {
                        default: withCtx(() => {
                          var _a2;
                          return [
                            createVNode("p", { class: "text-sm lato-light" }, toDisplayString(((_a2 = post.categories.edges[0]) == null ? undefined : _a2.node.name) || ""), 1),
                            createVNode("h3", { class: "font-bold font-custom" }, toDisplayString(post.title), 1)
                          ];
                        }),
                        _: 2
                      }, 1032, ["to"])
                    ], 2)
                  ]),
                  _: 2
                }, 1024);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="swiper-button-prev"></div><div class="swiper-button-next"></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/acf/portraitlayout.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : undefined;
};
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b;
    let __temp, __restore;
    const getComponent = (blocType) => {
      switch (blocType) {
        case "HomepageBlocsImageLayout":
          return _sfc_main$7;
        case "HomepageBlocsContenuLayout":
          return ContenuLayout;
        case "HomepageBlocsGuideVoyageLayout":
          return _sfc_main$5;
        case "HomepageBlocsCarouselLayout":
          return _sfc_main$4;
        case "HomepageBlocsGuideLayout":
          return GuideLayout;
        case "HomepageBlocsSliderLayout":
          return _sfc_main$2;
        case "HomepageBlocsPortraitLayout":
          return _sfc_main$1;
        default:
          return null;
      }
    };
    const config = useRuntimeConfig();
    const { data: settingsData } = ([__temp, __restore] = withAsyncContext(() => useFetch(config.public.wordpressUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
        query GetSiteSettings {
          allSettings {
            readingSettingsPageOnFront
          }
        }
      `
      }),
      transform: (data) => data.data.allSettings
    }, "$PslAyef5YX")), __temp = await __temp, __restore(), __temp);
    const pageId = (_a = settingsData.value) == null ? undefined : _a.readingSettingsPageOnFront;
    const { data: pageData } = ([__temp, __restore] = withAsyncContext(() => useFetch(config.public.wordpressUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
        query GetHomePage($id: ID!) {
          page(id: $id, idType: DATABASE_ID) {
            template {
              ... on Template_HomePage {
                templateName
                homepage {
                  blocs {
                    fieldGroupName
                    ... on HomepageBlocsVideoLayout {
                      fieldGroupName
                      plateforme
                      video
                    }
                    ... on HomepageBlocsSliderLayout{
                      fieldGroupName
                      slider {
                        img {
                          node {
                            guid
                            link
                            slug
                          }
                        }
                        slug {
                          url
                          title
                        }
                        sousTitre
                        titre
                        headline
                        afficherDuTexte
                      }
                    }
                    ... on HomepageBlocsImageLayout {
                      fieldGroupName
                      image {
                        node {
                          sourceUrl(size: CAROUSEL_SIZE)
                          uri
                          srcSet(size: CAROUSEL_SIZE)
                          sizes(size: CAROUSEL_SIZE)
                          guid
                        }
                      }
                    }
                    ... on HomepageBlocsContenuLayout {
                      contenu
                      fieldGroupName
                    }
                    ... on HomepageBlocsCarouselLayout {
                      fieldGroupName
                      postParPage
                      headline
                      contenu
                      titreDeLaSection
                      categorie {
                        nodes {
                          slug
                        }
                      }
                    }
                    ... on HomepageBlocsPortraitLayout {
                      fieldGroupName
                      postParPage
                      headline
                      contenu
                      titreDeLaSection
                      categorie {
                        nodes {
                          slug
                        }
                      }
                    }
                    ... on HomepageBlocsGuideLayout {
                      fieldGroupName
                      categorie {
                        nodes {
                          slug
                        }
                      }
                      lien {
                        target
                        title
                        url
                      }
                    }
                    ... on HomepageBlocsGuideVoyageLayout {
                      fieldGroupName
                      postParPage
                      titreDeLaSection
                      categorie {
                        nodes {
                          slug
                        }
                      }
                    }
                    ... on HomepageBlocsShopLayout {
                      fieldGroupName
                      sousTitre
                      titreDeLaSection
                    }
                  }
                }
              }
            }
          }
        }
      `,
        variables: {
          id: pageId
        }
      }),
      transform: (data) => data.data.page
    }, "$6PO73qLRkI")), __temp = await __temp, __restore(), __temp);
    if (!pageData || pageData.length === 0) {
      console.error("Donn\xE9es introuvables");
    }
    const page = pageData || null;
    ((_b = page == null ? undefined : page.acf) == null ? undefined : _b.blocs) || [];
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2, _c;
      const _component_Header = __nuxt_component_0$1;
      const _component_Footer = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_Header, null, null, _parent));
      _push(`<!--[-->`);
      ssrRenderList((_c = (_b2 = (_a2 = unref(pageData)) == null ? undefined : _a2.template) == null ? undefined : _b2.homepage) == null ? undefined : _c.blocs, (bloc, index) => {
        _push(`<div>`);
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(getComponent(bloc.fieldGroupName)), mergeProps({ ref_for: true }, bloc), null), _parent);
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_Footer, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BCEUbJVJ.mjs.map
