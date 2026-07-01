import { useEffect } from 'react';

/**
 * React hook to lock background body and html document scrolling
 * when modals, overlays, or drawers are open.
 */
export function useLockBodyScroll() {
  useEffect(() => {
    // Preserve initial page styles
    const originalOverflowHtml = document.documentElement.style.overflow;
    const originalOverflowBody = document.body.style.overflow;

    // Disables document level scrollbars
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Restore page scroll capability on unmount
    return () => {
      document.documentElement.style.overflow = originalOverflowHtml;
      document.body.style.overflow = originalOverflowBody;
    };
  }, []);
}
