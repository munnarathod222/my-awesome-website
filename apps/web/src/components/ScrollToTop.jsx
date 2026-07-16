import { useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // Reset scroll position on the main content panel (since it handles the scrolling)
        const mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.scrollTop = 0;
        }
        
        // Reset body style overrides to prevent stuck scrolling / clicks from unmounted modals
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
    }, [pathname]);

    return null;
}

export default ScrollToTop;