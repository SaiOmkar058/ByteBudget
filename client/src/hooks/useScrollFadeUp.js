import { useEffect, useRef, useState } from 'react';

export const useScrollFadeUp = () => {
  const ref = useRef(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.15,        // 15% visible
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isVisible };
};
