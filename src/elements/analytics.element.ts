import { inject } from '@vercel/analytics';

export class AnalyticsWrapper extends HTMLElement {
  constructor() {
    super();
    this.injectAnalytics();
  }

  async injectAnalytics() {
    try {
      await inject(); // Initialize Vercel Analytics
      console.log('Vercel Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Vercel Analytics:', error);
    }
  }
}

customElements.define('analytics-wrapper', AnalyticsWrapper);