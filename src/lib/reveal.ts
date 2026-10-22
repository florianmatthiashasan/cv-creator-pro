/**
 * Scroll reveal for elements marked with `data-reveal`.
 *
 * Elements are only hidden once this runs (the `reveal-ready` class gates the CSS), so content stays
 * visible for crawlers and when JS fails. The revealed state is a data attribute rather than a class,
 * because React would overwrite a class it does not know about on re-render.
 */
export const initReveal = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return () => undefined;

  document.documentElement.classList.add('reveal-ready');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-revealed', '');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  const observeAll = () => {
    document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((element) => io.observe(element));
  };

  observeAll();
  const mutations = new MutationObserver(observeAll);
  mutations.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mutations.disconnect();
  };
};

/** Splits the text of `[data-blur-words]` headings into word spans that blur in one after another (static pages only). */
export const splitBlurWords = () => {
  document.querySelectorAll<HTMLElement>('[data-blur-words]').forEach((heading) => {
    heading.setAttribute('aria-label', heading.textContent?.replace(/\s+/g, ' ').trim() ?? '');
    let index = 0;

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        (node.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.append(' ');
            return;
          }
          const word = document.createElement('span');
          word.className = 'blur-word';
          word.setAttribute('aria-hidden', 'true');
          word.style.setProperty('--i', String(index));
          word.textContent = part;
          index += 1;
          fragment.append(word);
        });
        node.parentNode?.replaceChild(fragment, node);
        return;
      }
      Array.from(node.childNodes).forEach(walk);
    };

    Array.from(heading.childNodes).forEach(walk);
  });
};
