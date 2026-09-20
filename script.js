(function () {
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("nav");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = Array.from(document.querySelectorAll(".nav-list a"));
  const supportsObserver = "IntersectionObserver" in window;

  /* Header: add a border/shadow once the page is scrolled */
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile navigation */
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) setNav(false);
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setNav(false);
  });

  /* Scroll reveal */
  const revealElements = document.querySelectorAll(".reveal");
  if (supportsObserver) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* Highlight the nav link for the section currently in view */
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (supportsObserver && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === id));
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* Screenshot strips: arrow buttons scroll the strip; hide them when nothing overflows */
  const strips = [];
  document.querySelectorAll(".project").forEach((project) => {
    const strip = project.querySelector(".shots");
    const stripNav = project.querySelector(".strip-nav");
    if (!strip || !stripNav) return;
    strips.push({ strip, stripNav });
    project.querySelectorAll(".strip-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.dir) || 1;
        strip.scrollBy({ left: direction * Math.max(240, strip.clientWidth * 0.7), behavior: "smooth" });
      });
    });
  });

  const updateStripNav = () => {
    strips.forEach(({ strip, stripNav }) => {
      stripNav.hidden = strip.scrollWidth <= strip.clientWidth + 1;
    });
  };
  updateStripNav();
  window.addEventListener("load", updateStripNav);
  window.addEventListener("resize", updateStripNav);

  /* Lightbox */
  const lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const preview = lightbox.querySelector("img");
    const caption = lightbox.querySelector("figcaption");

    document.querySelectorAll(".shot").forEach((shot) => {
      shot.addEventListener("click", () => {
        const source = shot.querySelector("img");
        preview.src = source.currentSrc || source.src;
        preview.alt = source.alt;
        caption.textContent = shot.dataset.caption || source.alt;
        lightbox.showModal();
      });
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", () => preview.removeAttribute("src"));
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
