import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe existing elements
    const observeAll = () => {
      el.querySelectorAll('.scroll-reveal:not(.visible)').forEach(child => io.observe(child));
    };
    observeAll();

    // Watch for new elements added dynamically (e.g. after API load)
    const mo = new MutationObserver(() => observeAll());
    mo.observe(el, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  return ref;
}
