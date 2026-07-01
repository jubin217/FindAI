import { useEffect } from 'react';

/**
 * A custom React hook that runs IntersectionObserver on elements
 * with animation classes and appends the 'animated' trigger class when visible.
 * @param dependencies Optional list of state dependencies to trigger re-observation
 */
export function useScrollAnimation(dependencies: any[] = []) {
  useEffect(() => {
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px 0px -60px 0px', // trigger 60px before element enters fully
      threshold: 0.1 // trigger when 10% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll(
      '.scroll-animate, .slide-in-left, .scale-up'
    );

    // Viewport check helper to animate visible elements immediately
    const isElementInViewport = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth)
      );
    };

    elementsToAnimate.forEach((element) => {
      if (isElementInViewport(element)) {
        element.classList.add('animated');
      }
      observer.observe(element);
    });

    return () => {
      elementsToAnimate.forEach((element) => {
        observer.unobserve(element);
      });
      observer.disconnect();
    };
  }, dependencies);
}
