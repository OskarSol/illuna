import { useState, useEffect, useCallback } from 'react'
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle,
  MapPin, Wind, Droplets, Thermometer, X, RefreshCw,
} from 'lucide-react'
import clsx from 'clsx'

interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  locationName: string
}

interface GeoResult {
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

interface StoredLocation {
  name: string
  lat: number
  lon: number
}

const LOCATION_KEY = 'weather_location'
const CACHE_KEY = 'weather_cache'
const CACHE_TTL = 10 * 60 * 1000

function getWeatherInfo(code: number) {
  if (code === 0) return { label: 'Klarer Himmel', Icon: Sun, color: 'text-yellow-400' }
  if (code <= 2) return { label: 'Leicht bewölkt', Icon: Cloud, color: 'text-slate-400' }
  if (code === 3) return { label: 'Bewölkt', Icon: Cloud, color: 'text-slate-500' }
  if (code <= 48) return { label: 'Neblig', Icon: Cloud, color: 'text-slate-400' }
  if (code <= 57) return { label: 'Nieselregen', Icon: CloudDrizzle, color: 'text-sky-400' }
  if (code <= 67) return { label: 'Regen', Icon: CloudRain, color: 'text-sky-500' }
  if (code <= 77) return { label: 'Schnee', Icon: CloudSnow, color: 'text-sky-200' }
  if (code <= 82) return { label: 'Regenschauer', Icon: CloudRain, color: 'text-sky-400' }
  if (code <= 86) return { label: 'Schneeschauer', Icon: CloudSnow, color: 'text-sky-300' }
  return { label: 'Gewitter', Icon: CloudLightning, color: 'text-amber-400' }
}

function readCache(): { data: WeatherData; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readLocation(): StoredLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<StoredLocation | null>(readLocation)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isSettingLocation, setIsSettingLocation] = useState(false)
  const [query, setQuery] = useState('')
  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async (loc: StoredLocation) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      )
      if (!res.ok) throw new Error()
      const json = await res.json()
      const c = json.current
      const data: WeatherData = {
        temperature: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        weatherCode: c.weather_code,
        locationName: loc.name,
      }
      setWeather(data)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
    } catch {
      setError('Wetter nicht verfügbar')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!location) return
    const cached = readCache()
    if (cached && cached.data.locationName === location.name && Date.now() - cached.timestamp < CACHE_TTL) {
      setWeather(cached.data)
      return
    }
    fetchWeather(location)
  }, [location, fetchWeather])

  const searchGeo = async () => {
    if (!query.trim()) return
    setGeoLoading(true)
    setGeoResults([])
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=de&format=json`
      )
      const json = await res.json()
      setGeoResults(json.results ?? [])
    } catch {
      setError('Suche fehlgeschlagen')
    } finally {
      setGeoLoading(false)
    }
  }

  const selectLocation = (r: GeoResult) => {
    const loc: StoredLocation = {
      name: r.admin1 ? `${r.name}, ${r.admin1}` : `${r.name}, ${r.country}`,
      lat: r.latitude,
      lon: r.longitude,
    }
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc))
    localStorage.removeItem(CACHE_KEY)
    setLocation(loc)
    setWeather(null)
    setIsSettingLocation(false)
    setGeoResults([])
    setQuery('')
  }

  const expanded = isHovered || isSettingLocation

  if (!location || isSettingLocation) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-4 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-4 h-4 text-sky-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Wetterort wählen</span>
            </div>
            {location && (
              <button
                onClick={() => { setIsSettingLocation(false); setGeoResults([]) }}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchGeo()}
              placeholder="Stadt eingeben…"
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-slate-300"
              autoFocus
            />
            <button
              onClick={searchGeo}
              disabled={geoLoading || !query.trim()}
              className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            >
              {geoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Suche'}
            </button>
          </div>

          {geoResults.length > 0 && (
            <div className="mt-2 rounded-xl border border-slate-100 overflow-hidden bg-white">
              {geoResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(r)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-sky-50 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span>
                    <span className="font-medium text-slate-700">{r.name}</span>
                    {r.admin1 && <span className="text-slate-400">, {r.admin1}</span>}
                    <span className="text-slate-300"> · {r.country}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {geoResults.length === 0 && query && !geoLoading && (
            <p className="text-xs text-slate-400 mt-2 text-center">Drücke Enter oder klicke Suche</p>
          )}
        </div>
      </div>
    )
  }

  const info = weather ? getWeatherInfo(weather.weatherCode) : null

  return (
    <div
      className="fixed bottom-20 sm:bottom-4 left-4 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={clsx(
          'bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 transition-all duration-300 overflow-hidden',
          expanded ? 'shadow-2xl' : ''
        )}
      >
        {/* Compact bar */}
        <div className="flex items-center gap-3 px-4 py-3 min-w-0">
          <div className="w-8 h-8 flex items-center justify-center">
            {isLoading ? (
              <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
            ) : info ? (
              <info.Icon className={clsx('w-6 h-6', info.color)} />
            ) : (
              <Cloud className="w-6 h-6 text-slate-200" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {weather && !isLoading ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-800 leading-none">{weather.temperature}°C</span>
                <span className="text-xs text-slate-400 truncate">{weather.locationName.split(',')[0]}</span>
              </div>
            ) : error ? (
              <span className="text-xs text-red-400">{error}</span>
            ) : (
              <span className="text-xs text-slate-300">Lädt…</span>
            )}
          </div>

          <button
            onClick={() => setIsSettingLocation(true)}
            title="Ort ändern"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-200 hover:text-sky-400 hover:bg-sky-50 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expanded details */}
        <div
          className={clsx(
            'transition-all duration-300 ease-in-out overflow-hidden',
            expanded && weather ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {weather && (
            <div className="px-4 pb-4">
              <div className="h-px bg-slate-100 mb-3" />
              <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                {info && <info.Icon className={clsx('w-3.5 h-3.5', info.color)} />}
                {info?.label}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Detail icon={Thermometer} label="Gefühlt" value={`${weather.feelsLike}°C`} color="text-orange-400" />
                <Detail icon={Droplets} label="Feuchte" value={`${weather.humidity}%`} color="text-sky-400" />
                <Detail icon={Wind} label="Wind" value={`${weather.windSpeed} km/h`} color="text-teal-400" />
              </div>
              <p className="text-[10px] text-slate-300 mt-3 text-right leading-tight">
                {weather.locationName}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Detail({
  icon: Icon, label, value, color,
}: {
  icon: typeof Sun
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl py-2 px-1">
      <Icon className={clsx('w-3.5 h-3.5', color)} />
      <span className="text-[10px] text-slate-400 leading-none">{label}</span>
      <span className="text-xs font-semibold text-slate-700 leading-none">{value}</span>
    </div>
  )
}
