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

  /* Live project browser windows: tabs and scroll hint */
  document.querySelectorAll("[data-browser]").forEach((browser) => {
    const tabs = Array.from(browser.querySelectorAll(".browser-tab"));
    const panes = Array.from(browser.querySelectorAll(".browser-pane"));
    const urlLink = browser.querySelector(".browser-url");
    const urlLabel = urlLink && urlLink.querySelector("span");
    const openLink = browser.querySelector("[data-open]");
    if (!tabs.length || !panes.length) return;

    const displayUrl = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

    const activate = (index, focus) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      panes.forEach((pane, i) => {
        pane.hidden = i !== index;
      });
      const pane = panes[index];
      const url = pane.dataset.url || "#";
      if (urlLink) urlLink.href = url;
      if (urlLabel) urlLabel.textContent = displayUrl(url);
      if (openLink) openLink.href = url;
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(i, false));
      tab.addEventListener("keydown", (event) => {
        const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        activate((i + step + tabs.length) % tabs.length, true);
      });
    });

    /* Hide the "scroll to explore" hint once the pane is scrolled, or if it never overflows */
    panes.forEach((pane) => {
      const scroller = pane.querySelector(".browser-scroll");
      if (!scroller) return;
      scroller.addEventListener("scroll", () => pane.classList.add("is-scrolled"), { once: true, passive: true });
      const check = () => pane.classList.toggle("no-overflow", scroller.scrollHeight <= scroller.clientHeight + 4);
      const image = scroller.querySelector("img");
      if (image) {
        if (image.complete) check();
        else image.addEventListener("load", check, { once: true });
      }
      window.addEventListener("resize", check);
    });

    activate(0, false);
  });

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
