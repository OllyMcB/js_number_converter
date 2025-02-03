// Declare the gtag function type
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * @brief Initialises Google Analytics with the provided measurement ID
 */
export const initGA = (measurementId: string): void => {
  // GA is already initialised via the script tag in index.html
  // This function is kept for API consistency
};

/**
 * @brief Tracks a page view in Google Analytics
 */
export const trackPageView = (path: string): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: path
    });
  }
};

/**
 * @brief Tracks a custom event in Google Analytics
 */
export const trackEvent = (category: string, action: string, label?: string): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
}; 