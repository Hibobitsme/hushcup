import { href, type Route } from '../router';
import { BarsIcon, HomeIcon, MoonIcon, PlusIcon } from './icons';

export function TabBar({ route }: { route: Route }) {
  const cur = (r: Route) => (route === r ? ('page' as const) : undefined);
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-inner">
        <a className="tab" href={href('today')} aria-current={cur('today')}>
          <HomeIcon />
          <span>Today</span>
        </a>
        <a className="tab" href={href('sleep')} aria-current={cur('sleep')}>
          <MoonIcon />
          <span>Sleep</span>
        </a>
        <div>
          <a className="tab-add" href={href('log')} aria-label="Log a drink">
            <PlusIcon />
          </a>
        </div>
        <a className="tab" href={href('streaks')} aria-current={cur('streaks')}>
          <BarsIcon />
          <span>Streaks</span>
        </a>
      </div>
    </nav>
  );
}
