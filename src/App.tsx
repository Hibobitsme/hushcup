import { TabBar } from './components/TabBar';
import { deriveToday } from './lib/derive';
import { useReminders } from './notify';
import { useRoute } from './router';
import { Checkin } from './screens/Checkin';
import { Forecast } from './screens/Forecast';
import { History } from './screens/History';
import { Home } from './screens/Home';
import { Log } from './screens/Log';
import { Onboarding } from './screens/Onboarding';
import { Settings } from './screens/Settings';
import { useAppState, useNow } from './store';
import { useTheme } from './theme/theme';

export function App() {
  const state = useAppState();
  const now = useNow();
  const route = useRoute();
  const { pref, setPref } = useTheme();
  useReminders(state, now);

  if (!state.settings) return <Onboarding />;

  const withSettings = { ...state, settings: state.settings };
  const today = deriveToday(withSettings, now);

  switch (route) {
    case 'log':
      return <Log today={today} />;
    case 'checkin':
      return <Checkin key={today.lastNight.key} state={state} today={today} now={now} />;
    case 'settings':
      return <Settings settings={state.settings} theme={pref} setTheme={setPref} />;
    default:
      return (
        <>
          {route === 'sleep' ? (
            <Forecast state={state} today={today} now={now} />
          ) : route === 'streaks' ? (
            <History state={state} today={today} />
          ) : (
            <Home state={state} today={today} now={now} />
          )}
          <TabBar route={route} />
        </>
      );
  }
}
