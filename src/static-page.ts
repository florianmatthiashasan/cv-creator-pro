import "./index.css";
import { initReveal, splitBlurWords } from "./lib/reveal";

// Header is transparent over the hero glow and turns solid once the page scrolls.
const header = document.querySelector<HTMLElement>("[data-site-header]");
const solidHeaderClasses = ["bg-background/80", "shadow-[0_1px_0_rgb(0_0_0/0.06)]", "backdrop-blur-xl"];
const syncHeader = () => {
  if (!header) return;
  const solid = window.scrollY > 12;
  solidHeaderClasses.forEach((name) => header.classList.toggle(name, solid));
};
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

// Stagger cards that share a grid so they arrive one after another.
document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
  if (element.style.getPropertyValue("--reveal-delay")) return;
  const siblings = Array.from(element.parentElement?.children ?? []).filter((child) => child.hasAttribute("data-reveal"));
  const index = siblings.indexOf(element);
  if (index > 0) element.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);
});

splitBlurWords();
initReveal();
