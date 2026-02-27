function initPageTransitions() {
  // ------------------------------------------
  // BARBA PAGE TRANSITION BOILERPLATE, by osmo
  // ------------------------------------------


  history.scrollRestoration = "manual";

  let lenis = null;
  let nextPage = document;
  let onceFunctionsInitialized = false;

  let flipState = null;
  let flippedThumbnail = null;
  let savedBodyColor = null;

  const hasLenis = typeof window.Lenis !== "undefined";
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

  const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = rmMQ.matches;
  rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
  rmMQ.addListener?.(e => (reducedMotion = e.matches));

  const has = (s) => !!nextPage.querySelector(s);

  let staggerDefault = 0.05;
  let durationDefault = 0.6;

  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  gsap.defaults({ ease: "osmo", duration: durationDefault });



  // -----------------------------------------
  // FUNCTION REGISTRY
  // -----------------------------------------

  function initOnceFunctions() {
    initLenis();
    if (onceFunctionsInitialized) return;
    onceFunctionsInitialized = true;

    // Runs once on first load
    // if (has('[data-something]')) initSomething();
  }
  function initBeforeEnterFunctions(next) {
    nextPage = next || document;

    // Runs before the enter animation
    // if (has('[data-something]')) initSomething();
  }
  function initAfterEnterFunctions(next) {
    nextPage = next || document;

    document.dispatchEvent(new CustomEvent('barba:afterEnter', { detail: { container: nextPage } }));

    // Runs after enter animation completes
    // if (has('[data-something]')) initSomething();
    // if (has('[data-overlap-slider-init]')) initOverlappingSlider();



    if (lenis) {
      lenis.resize();
    }

    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }


  // -----------------------------------------
  // PAGE TRANSITIONS
  // -----------------------------------------

  function runPageOnceAnimation(next) {
    const tl = gsap.timeline();

    tl.call(() => {
      resetPage(next)
    }, null, 0);

    return tl;
  }

  function runPageLeaveAnimation(current, next) {
    // -----------VARIABLES--------------

    // ------------var_end---------------

    const tl = gsap.timeline({
      onComplete: () => { current.remove() }
    });

    if (reducedMotion) {
      // Immediate swap behavior if user prefers reduced motion
      return tl.set(current, { autoAlpha: 0 });
    }

    // -----------TIMELINE---------------

    tl.to(current, {
      autoAlpha: 0,
      duration: .6
    });

    // ------------tl_end----------------
    return tl;
  }

  function runPageEnterAnimation(next) {
    // -----------VARIABLES--------------

    // ------------var_end---------------

    const tl = gsap.timeline();

    if (reducedMotion) {
      // Immediate swap behavior if user prefers reduced motion
      tl.set(next, { autoAlpha: 1 });
      tl.add("pageReady")
      tl.call(resetPage, [next], "pageReady");
      return new Promise(resolve => tl.call(resolve, null, "pageReady"));
    }

    // -----------TIMELINE---------------
    //gsap marker: marks the start of the animation
    tl.add("startEnter", 0);

    tl.fromTo(next, {
      autoAlpha: 0,
    }, {
      autoAlpha: 1,
    }, "startEnter");

    //gsap marker: marks the end of the animation
    tl.add("pageReady");
    // ------------tl_end----------------

    tl.call(resetPage, [next], "pageReady");

    return new Promise(resolve => {
      tl.call(resolve, null, "pageReady");
    });
  }

  function leaveItemToDetailTransition(current, next, trigger) {
    const clicked = trigger.closest("[data-pagetransition-trigger]");
    if (!clicked) return runPageLeaveAnimation(current, next);

    // -----------VARIABLES--------------
    const thumbnail = clicked.querySelector("[data-pagetransition-target]");
    const nextBody = next.ownerDocument.body;

    flipState = Flip.getState(thumbnail);
    flippedThumbnail = thumbnail;

    // ------------var_end---------------

    const tl = gsap.timeline({
      onComplete: () => { current.remove() }
    });

    if (reducedMotion) {
      // Immediate swap behavior if user prefers reduced motion
      return tl.set(current, { autoAlpha: 0 });
    }

    // -----------TIMELINE---------------
    tl.to(current, {
      autoAlpha: 0,
      duration: .6
    }, 0);

    // ------------tl_end----------------

    return tl;
  }

  function enterDetailFromItemTransition(next) {
    if (!flipState || !flippedThumbnail) return runPageEnterAnimation(next);

    console.log(next);

    // -----------VARIABLES--------------
    const nextHero = next.querySelector("section"); // or nextBody, nextMain,... depending on what you want to target
    const nextBody = next.ownerDocument.body;
    nextBody.style.removeProperty('background-color');
    const nextBodyColor = getComputedStyle(nextBody).backgroundColor;
    nextBody.style.backgroundColor = savedBodyColor;

    const revealElements = nextHero.querySelectorAll("[data-transition-reveal]");
    // ------------var_end---------------

    next.style.backgroundColor = 'transparent';

    const tl = gsap.timeline();

    if (reducedMotion) {
      // Immediate swap behavior if user prefers reduced motion
      tl.set(next, { autoAlpha: 1 });
      tl.add("pageReady")
      tl.call(resetPage, [next], "pageReady");
      return new Promise(resolve => tl.call(resolve, null, "pageReady"));
    }

    const placeholder = next.querySelector("[data-pagetransition-target]");
    placeholder.parentNode.insertBefore(flippedThumbnail, placeholder);
    placeholder.remove();

    // -----------TIMELINE---------------
    //gsap marker: marks the start of the animation
    tl.add("startEnter", .6);

    tl.add(Flip.from(flipState, {
    }), "startEnter");

    tl.fromTo(nextBody, {
      backgroundColor: savedBodyColor,
    }, {
      backgroundColor: nextBodyColor,
    }, "startEnter");

    tl.fromTo(revealElements, {
      autoAlpha: 0,
      yPercent: 25
    }, {
      autoAlpha: 1,
      yPercent: 0,
      stagger: .1
    }, "startEnter+=0.2");

    //gsap marker: marks the end of the animation
    tl.add("pageReady");
    // ------------tl_end----------------


    tl.call(resetPage, [next], "pageReady");
    tl.call(() => {
      flippedThumbnail = null;
      flipState = null;
      savedBodyColor = null;
      gsap.set(nextBody, { clearProps: "backgroundColor" });
      next.style.removeProperty('background-color');
    })

    return new Promise(resolve => {
      tl.call(resolve, null, "pageReady");
    });
  }
  // -----------------------------------------
  // BARBA HOOKS + INIT
  // -----------------------------------------

  barba.hooks.beforeEnter(data => {
    // Position new container on top
    //const navBottom = document.querySelector('.navbar_component')?.getBoundingClientRect().bottom || 0;
    gsap.set(data.next.container, {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
    });

    if (lenis) {
      lenis.stop();
    }

    initBeforeEnterFunctions(data.next.container);
    applyThemeFrom(data.next.container);
  });

  barba.hooks.afterLeave(() => {
    if (hasScrollTrigger) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  });

  barba.hooks.enter(data => {
    initBarbaNavUpdate(data);
  })

  barba.hooks.afterEnter(data => {
    // Run page functions
    initAfterEnterFunctions(data.next.container);

    // Settle
    if (lenis) {
      lenis.resize();
      lenis.start();
    }

    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
  });

  barba.init({
    debug: true, // Set to 'false' in production
    timeout: 7000,
    preventRunning: true,
    transitions: [
      {
        name: "item to detail page",
        sync: true,
        from: { namespace: ["page-b"] },
        to: { namespace: ["page-c"] },
        custom: ({ trigger }) => trigger.hasAttribute("data-pagetransition-trigger"),

        beforeLeave(data) {
          savedBodyColor = getComputedStyle(data.current.container).backgroundColor;
          document.body.style.backgroundColor = savedBodyColor;
        },

        // Current page leaves
        async leave(data) {
          return leaveItemToDetailTransition(data.current.container, data.next.container, data.trigger);
        },

        // New page enters
        async enter(data) {
          return enterDetailFromItemTransition(data.next.container);
        }
      },
      {
        name: "default",
        sync: true,

        // First load
        async once(data) {
          initOnceFunctions();

          return runPageOnceAnimation(data.next.container);
        },

        // Current page leaves
        async leave(data) {
          return runPageLeaveAnimation(data.current.container, data.next.container);
        },

        // New page enters
        async enter(data) {
          return runPageEnterAnimation(data.next.container);
        }
      }
    ],
  });



  // -----------------------------------------
  // GENERIC + HELPERS
  // -----------------------------------------

  const themeConfig = {
    light: {
      nav: "dark",
      transition: "light"
    },
    dark: {
      nav: "light",
      transition: "dark"
    },
    red: {
      nav: "dark",
      transition: "light"
    }
  };

  function applyThemeFrom(container) {
    const pageTheme = container?.dataset?.pageTheme || "light";
    const config = themeConfig[pageTheme] || themeConfig.light;

    document.body.dataset.pageTheme = pageTheme;
    const transitionEl = document.querySelector('[data-theme-transition]');
    if (transitionEl) {
      transitionEl.dataset.themeTransition = config.transition;
    }

    const nav = document.querySelector('[data-theme-nav]');
    if (nav) {
      nav.dataset.themeNav = config.nav;
    }
  }

  function initLenis() {
    if (lenis) return; // already created
    if (!hasLenis) return;

    lenis = new Lenis({
      lerp: 0.165,
      wheelMultiplier: 1.25,
    });

    if (hasScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  function resetPage(container) {
    window.scrollTo(0, 0);
    gsap.set(container, { clearProps: "position,top,left,right" });

    if (lenis) {
      lenis.resize();
      lenis.start();
    }
  }

  function debounceOnWidthChange(fn, ms) {
    let last = innerWidth,
      timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (innerWidth !== last) {
          last = innerWidth;
          fn.apply(this, args);
        }
      }, ms);
    };
  }

  function initBarbaNavUpdate(data) {
    var tpl = document.createElement('template');
    tpl.innerHTML = data.next.html.trim();
    var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
    var currentNodes = document.querySelectorAll('nav [data-barba-update]');

    currentNodes.forEach(function (curr, index) {
      var next = nextNodes[index];
      if (!next) return;

      // Aria-current sync
      var newStatus = next.getAttribute('aria-current');
      if (newStatus !== null) {
        curr.setAttribute('aria-current', newStatus);
      } else {
        curr.removeAttribute('aria-current');
      }

      // Class list sync
      var newClassList = next.getAttribute('class') || '';
      curr.setAttribute('class', newClassList);
    });
  }


  // -----------------------------------------
  // YOUR FUNCTIONS GO BELOW HERE
  // -----------------------------------------


}

function pageTransitions() {
  initPageTransitions();
}

export default pageTransitions;