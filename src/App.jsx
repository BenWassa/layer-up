import { useState, useEffect } from 'react';
import {
  ACTIVITY_LEVELS,
  DURATIONS,
  generateDemoLogs,
  normalizeOutfit,
} from './constants';
import {
  getRecommendation,
  getPhase,
  getPhaseLabel,
  calculateOffset,
} from './logic';
import { loadAppState, saveAppState } from './storage';
import { BottomNav } from './components/BottomNav';
import { LogSheet } from './components/LogSheet';
import { HistoryView } from './views/HistoryView';
import { HomeErrorView, HomeView } from './views/HomeView';
import { InsightsView } from './views/InsightsView';
import { SettingsView } from './views/SettingsView';
import './styles.css';

const APP_VERSION = __APP_VERSION__;

export default function LayerUp() {
  const [tab, setTab] = useState('home');
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState('light');
  const [duration, setDuration] = useState('medium');
  const [confirmClear, setConfirmClear] = useState(false);
  const [logs, setLogs] = useState([]);
  const [unit, setUnit] = useState('C');
  const [showLog, setShowLog] = useState(false);
  const [logComfort, setLogComfort] = useState(null);
  const [logNotes, setLogNotes] = useState('');
  const [logOutfit, setLogOutfit] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const saved = await loadAppState();
      if (cancelled) return;
      setLogs((saved.logs || []).map(log => ({ ...log, outfit: normalizeOutfit(log.outfit) })));
      setUnit(saved.unit || 'C');
      setBootstrapped(true);
    }
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    saveAppState({ logs, unit });
  }, [logs, unit, bootstrapped]);

  useEffect(() => {
    let cancelled = false;
    async function fetchWeather() {
      setError(null);
      setLoadingWeather(true);

      const defaultLoc = { lat: 43.65, lng: -79.38 };
      let lat = defaultLoc.lat;
      let lng = defaultLoc.lng;

      if (navigator?.geolocation) {
        try {
          const getPos = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 60000 });
          });
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
          const pos = await Promise.race([getPos, timeout]);
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (geoErr) {
          console.warn('Geolocation failed or timed out:', geoErr);
        }
      }

      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,uv_index,weather_code&timezone=auto`;
        const res = await fetch(weatherUrl);
        const data = await res.json();
        const c = data.current;

        let locationName = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lng.toFixed(2)}&count=1`);
          const geoData = await geoRes.json();
          if (geoData.results?.[0]) locationName = `${geoData.results[0].name}, ${geoData.results[0].country_code}`;
        } catch {
          // keep fallback coords
        }

        if (!cancelled) {
          setWeather({
            temp: Math.round(c.temperature_2m),
            feelsLike: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m,
            windSpeed: Math.round(c.wind_speed_10m),
            precipitation: c.precipitation,
            uvIndex: c.uv_index,
            weatherCode: c.weather_code,
            location: locationName,
          });
          setLoadingWeather(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not fetch weather data. Please check network and retry.');
          setLoadingWeather(false);
        }
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  const toF = c => Math.round(c * 9 / 5 + 32);
  const displayTemp = c => (unit === 'F' ? `${toF(c)}°F` : `${c}°C`);
  const displayOffset = celsiusVal => {
    const val = unit === 'F' ? celsiusVal * 1.8 : celsiusVal;
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}°`;
  };

  const recommendation = weather ? getRecommendation(weather, activity, duration, logs) : null;

  const openLog = () => {
    if (recommendation) setLogOutfit(normalizeOutfit(recommendation.outfit));
    setLogComfort(null);
    setLogNotes('');
    setShowLog(true);
  };

  const submitLog = () => {
    if (!logComfort || !weather || !logOutfit) return;
    const entry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      weather: { ...weather },
      activity,
      duration,
      outfit: normalizeOutfit(logOutfit),
      comfort: logComfort,
      notes: logNotes,
    };
    setLogs(prev => [...prev, entry]);
    setShowLog(false);
  };

  const phase = getPhase(logs.length);
  const cycleLogLayer = (category, optionCount) => {
    setLogOutfit(prev => {
      const normalized = normalizeOutfit(prev);
      return { ...normalized, [category]: (normalized[category] + 1) % optionCount };
    });
  };
  const clearLogs = () => {
    if (confirmClear) {
      setLogs([]);
      setConfirmClear(false);
      return;
    }
    setConfirmClear(true);
    setTimeout(() => setConfirmClear(false), 3000);
  };

  if (!bootstrapped || loadingWeather) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">Loading LayerUp…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {tab === 'home' && weather ? (
        <HomeView
          weather={weather}
          unit={unit}
          phase={phase}
          logs={logs}
          activity={activity}
          duration={duration}
          activityOptions={ACTIVITY_LEVELS}
          durationOptions={DURATIONS}
          recommendation={recommendation}
          displayTemp={displayTemp}
          onActivityChange={setActivity}
          onDurationChange={setDuration}
          onOpenLog={openLog}
          getPhaseLabel={getPhaseLabel}
          toF={toF}
        />
      ) : null}

      {tab === 'home' && error ? <HomeErrorView error={error} /> : null}

      {tab === 'history' ? <HistoryView logs={logs} displayTemp={displayTemp} /> : null}

      {tab === 'insights' ? (
        <InsightsView
          logs={logs}
          phase={phase}
          calculateOffset={calculateOffset}
          displayOffset={displayOffset}
        />
      ) : null}

      {tab === 'settings' ? (
        <SettingsView
          unit={unit}
          activity={activity}
          activityOptions={ACTIVITY_LEVELS}
          onUnitChange={setUnit}
          onActivityChange={setActivity}
          onLoadDemoLogs={() => setLogs(prev => [...prev, ...generateDemoLogs(25)])}
          confirmClear={confirmClear}
          onClearLogs={clearLogs}
          appVersion={APP_VERSION}
        />
      ) : null}

      <LogSheet
        show={showLog}
        recommendation={recommendation}
        activity={activity}
        duration={duration}
        activityOptions={ACTIVITY_LEVELS}
        durationOptions={DURATIONS}
        onActivityChange={setActivity}
        onDurationChange={setDuration}
        logOutfit={logOutfit}
        onCycleLayer={cycleLogLayer}
        logComfort={logComfort}
        onComfortChange={setLogComfort}
        logNotes={logNotes}
        onNotesChange={setLogNotes}
        onClose={() => setShowLog(false)}
        onSubmit={submitLog}
      />

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
