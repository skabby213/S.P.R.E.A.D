import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

function FitRoutes({ routes }) {
  const map = useMap()
  useEffect(() => {
    const points = routes.flatMap((r) => r.positions)
    if (points.length) map.fitBounds(points, { padding: [28, 28], maxZoom: 12 })
  }, [map, routes])
  return null
}

export default function OutbreakMap({ lotId = null, shipments = [] }) {
  const [mode, setMode] = useState('cases')
  const [locations, setLocations] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/outbreak-locations`)
      .then((r) => { if (!r.ok) throw new Error('Locations request failed'); return r.json() })
      .then(setLocations)
      .catch((e) => { console.error(e); setError('Could not load illness locations.') })
  }, [])

  // Backend returns locations' actual stored coordinates for each shipment leg.
  const routes = useMemo(() => shipments.flatMap((s) => {
    const numbers = [s.origin_latitude, s.origin_longitude, s.destination_latitude, s.destination_longitude].map(Number)
    if (numbers.some((n) => !Number.isFinite(n)) ||
        s.origin_latitude == null || s.origin_longitude == null ||
        s.destination_latitude == null || s.destination_longitude == null) return []
    return [{ ...s, positions: [[numbers[0], numbers[1]], [numbers[2], numbers[3]]] }]
  }), [shipments])

  return (
    <div className="map-wrapper">
      <div className="map-toolbar" role="group" aria-label="Map display mode">
        <button type="button" aria-pressed={mode === 'cases'} onClick={() => setMode('cases')}
          style={buttonStyle(mode === 'cases')}>Illness reports</button>
        <button type="button" aria-pressed={mode === 'routes'} onClick={() => setMode('routes')}
          style={buttonStyle(mode === 'routes')}>Shipment routes</button>
      </div>
      {error && mode === 'cases' && <p role="alert">{error}</p>}
      {mode === 'routes' && !lotId && <p style={{ margin: 0, fontSize: 12 }}>Search for a lot to display its documented shipment routes.</p>}
      {mode === 'routes' && lotId && !routes.length && <p style={{ margin: 0, fontSize: 12 }}>No shipments with mapped coordinates for this lot.</p>}
      <div className="map-viewport">
        <MapContainer center={[35.8456, -86.3903]} zoom={9} scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mode === 'cases' && locations.filter((loc) => loc.latitude != null && loc.longitude != null).map((loc) => (
            <CircleMarker key={loc.location_id}
              center={[Number(loc.latitude), Number(loc.longitude)]}
              radius={8} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.45 }}>
              <Popup><strong>{loc.location_name}</strong><p>Reported exposures: {loc.reported_cases}</p>
                <small>Reported exposure location, not a confirmed contamination source.</small></Popup>
            </CircleMarker>
          ))}
          {mode === 'routes' && <>
            <FitRoutes routes={routes} />
            {routes.map((route) => (
              <Polyline key={route.shipment_id} positions={route.positions}
                pathOptions={{ color: '#dc2626', weight: 4, opacity: 0.85 }}>
                <Tooltip sticky>Shipment #{route.shipment_id}: {route.origin} → {route.destination}</Tooltip>
                <Popup><strong>Shipment #{route.shipment_id}</strong>
                  <p>{route.origin} → {route.destination}</p>
                  <p>Arrival: {route.arrival_date || 'Pending'}<br />Quantity: {route.quantity_shipped} {route.quantity_unit}</p>
                  <small>Documented shipment route; straight line between recorded facilities. Not proof of pathogen transmission or the actual driving route.</small>
                </Popup>
              </Polyline>
            ))}
            {routes.flatMap((r) => [
              { id: `${r.shipment_id}-from`, name: r.origin, pos: r.positions[0] },
              { id: `${r.shipment_id}-to`, name: r.destination, pos: r.positions[1] }
            ]).map((point) => (
              <CircleMarker key={point.id} center={point.pos} radius={5}
                pathOptions={{ color: '#991b1b', fillColor: '#fff', fillOpacity: 1 }}>
                <Tooltip>{point.name}</Tooltip>
              </CircleMarker>
            ))}
          </>}
        </MapContainer>
      </div>
      <small style={{ color: '#52647a' }}>
        {mode === 'routes'
          ? 'Red = selected lot’s documented distribution legs (not confirmed pathogen spread). Lines are straight-line connections.'
          : 'Blue circles = reported exposure locations; these do not establish contamination sources.'}
      </small>
    </div>
  )
}

function buttonStyle(active) {
  return {
    padding: '7px 12px', borderRadius: 7, cursor: 'pointer', fontWeight: 600,
    border: active ? '1px solid #117e76' : '1px solid #cbd5e1',
    background: active ? '#117e76' : '#fff', color: active ? '#fff' : '#172238'
  }
}
