import 'firebase/analytics';

let _analytics: firebase.analytics.Analytics;

export const createAnalytics = (app: firebase.app.App): void => {
  _analytics = app.analytics();
};

export const getAnalytics = () => _analytics;
