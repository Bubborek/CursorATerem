import { useEffect, useRef } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return ref;
};

export const ScrollAnimationWrapper = ({ children, className = '', animationType = 'fade-in' }) => {
  const ref = useScrollAnimation();

  return (
    <div ref={ref} className={`${animationType} ${className}`}>
      {children}
    </div>
  );
};
