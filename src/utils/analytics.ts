/**
 * Analytics configuration for the application
 */

// Google Analytics Measurement ID (G-XXXXXXXXXX format for GA4)
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-JJ9JL2VK5H';

// Function to track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Function to track events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Type definition for window.gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js', 
      targetId: string | Date, 
      config?: Record<string, string | number | boolean | null | undefined>
    ) => void;
    dataLayer: Array<Record<string, string | number | boolean | null | undefined>>;
  }
} 