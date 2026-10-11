import { useEffect, useState } from 'react';

export type Route = 'today' | 'sleep' | 'log' | 'streaks' | 'checkin' | 'settings';

const ROUTES: Route[] = ['today', 'sleep', 'log', 'streaks', 'checkin', 'settings'];

function read(): Route {
  const r = location.hash.replace(/^#\/?/, '') as Route;
  return ROUTES.includes(r) ? r : 'today';
}

/** Hash changes since the app loaded, so "close" knows whether going back stays in the app. */
let inAppSteps = 0;

export function href(r: Route) {
  return `#/${r}`;
}

export function go(r: Route) {
  location.hash = `/${r}`;
}

/** Leave a full-screen route: go back if we got here inside the app, else to `fallback`. */
export function back(fallback: Route) {
  if (inAppSteps > 0) history.back();
  else go(fallback);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      inAppSteps++;
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
