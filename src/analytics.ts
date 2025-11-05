// Google Analytics gtag types
interface GtagConfig {
  page_path?: string;
  event_category?: string;
  event_label?: string;
}

type GtagCommand = 'config' | 'event' | 'js' | 'set';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: GtagCommand,
      targetId: string | Date,
      config?: GtagConfig
    ) => void;
  }
}

/**
 * @brief Initialises Google Analytics with the provided measurement ID
 */
export const initGA = (_measurementId: string): void => {
  // GA is already initialised via the script tag in index.html
  // This function is kept for API consistency
};

/**
 * @brief Tracks a page view in Google Analytics
 */
export const trackPageView = (path: string): void => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: path
    });
  }
};

/**
 * @brief Tracks a custom event in Google Analytics
 */
export const trackEvent = (category: string, action: string, label?: string): void => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
}; 