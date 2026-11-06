const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

function closeMenu(returnFocus = false) {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  navigation.classList.remove("is-open");
  if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open menu" : "Close menu");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("a")) closeMenu();
});

document.addEventListener("click", (event) => {
  if (menuToggle.getAttribute("aria-expanded") !== "true") return;
  if (event.target instanceof Element && !event.target.closest(".site-header")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") closeMenu(true);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

const capabilityAccordion = document.querySelector(".capability-accordion");

function activateCapability(selectedToggle) {
  capabilityAccordion.querySelectorAll(".capability-card").forEach((card) => {
    const toggle = card.querySelector(".capability-toggle");
    const panel = card.querySelector(".capability-panel");
    const isSelected = selectedToggle !== null && toggle === selectedToggle;

    card.classList.toggle("is-open", isSelected);
    toggle.setAttribute("aria-expanded", String(isSelected));
    panel.hidden = !isSelected;
  });
}

capabilityAccordion.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const selectedToggle = event.target.closest(".capability-toggle");
  if (!selectedToggle) return;
  const isExpanded = selectedToggle.getAttribute("aria-expanded") === "true";
  activateCapability(isExpanded ? null : selectedToggle);
});

capabilityAccordion.addEventListener("pointerover", (event) => {
  if (!(event.target instanceof Element)) return;
  const card = event.target.closest(".capability-card");
  if (card && event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
  const toggle = card?.querySelector(".capability-toggle");
  if (toggle && event.pointerType === "mouse") activateCapability(toggle);
});

capabilityAccordion.addEventListener("focusin", (event) => {
  if (!(event.target instanceof Element)) return;
  const toggle = event.target.closest(".capability-toggle");
  if (toggle) activateCapability(toggle);
});

capabilityAccordion.addEventListener("keydown", (event) => {
  if (!(event.target instanceof Element)) return;
  const toggles = [...capabilityAccordion.querySelectorAll(".capability-toggle")];
  const currentIndex = toggles.indexOf(event.target.closest(".capability-toggle"));
  if (currentIndex < 0) return;

  const verticalLayout = window.matchMedia("(max-width: 760px)").matches;
  const nextKeys = verticalLayout ? ["ArrowDown"] : ["ArrowRight"];
  const previousKeys = verticalLayout ? ["ArrowUp"] : ["ArrowLeft"];
  let nextIndex;

  if (nextKeys.includes(event.key)) nextIndex = (currentIndex + 1) % toggles.length;
  else if (previousKeys.includes(event.key)) nextIndex = (currentIndex - 1 + toggles.length) % toggles.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = toggles.length - 1;
  else return;

  event.preventDefault();
  toggles[nextIndex].focus();
});

const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const trackedSections = navigationLinks
  .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
  .filter((entry) => entry.section);

function updateActiveNavigation() {
  const headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
  const activationPoint = Math.max(headerBottom + 24, window.innerHeight * 0.35);
  let activeSection = trackedSections[0]?.section;

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    activeSection = trackedSections[trackedSections.length - 1]?.section;
  } else {
    trackedSections.forEach(({ section }) => {
      if (section.getBoundingClientRect().top <= activationPoint) activeSection = section;
    });
  }

  trackedSections.forEach(({ link, section }) => {
    if (section === activeSection) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

const scrollProgress = document.querySelector(".scroll-progress");
const navigationEntry = performance.getEntriesByType("navigation")[0];
const isPageRefresh = navigationEntry?.type === "reload";

if (isPageRefresh && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function updateScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
  scrollProgress.style.setProperty("--scroll-progress", String(progress));
}

window.addEventListener("pageshow", () => {
  if (!isPageRefresh) return;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.style.removeProperty("scroll-behavior");
  updateScrollProgress();
  updateActiveNavigation();
});

window.addEventListener("scroll", () => {
  document.querySelector(".site-header").classList.toggle("is-scrolled", window.scrollY > 12);
  updateScrollProgress();
  updateActiveNavigation();
}, { passive: true });
window.addEventListener("resize", () => {
  updateScrollProgress();
  updateActiveNavigation();
});
updateScrollProgress();
updateActiveNavigation();

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealTargets = document.querySelectorAll(
    ".intro-band-inner, .about-content, .capabilities-heading, .capability-accordion, .experience-heading, .experience-item, .impact, .impact-item, .projects-heading, .project-card, .contact-inner"
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((target) => {
    target.dataset.reveal = "";
    revealObserver.observe(target);
  });
  document.documentElement.classList.add("has-motion");
}
