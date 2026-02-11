function lenisSetup() {
  // Initialize Lenis
  const lenis = new Lenis({
    autoRaf: true,
  });

  // Scroll-To Anchor Lenis
  function initScrollToAnchorLenis() {
    document.querySelectorAll("[data-anchor-target]").forEach(element => {
      element.addEventListener("click", function () {
        const targetScrollToAnchorLenis = this.getAttribute("data-anchor-target");

        lenis.scrollTo(targetScrollToAnchorLenis, {
          easing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
          duration: 1.6,
          offset: -80 // Option to create an offset when there is a fixed navigation for example
        });
      });
    });
  }
  initScrollToAnchorLenis();
}


export default lenisSetup;