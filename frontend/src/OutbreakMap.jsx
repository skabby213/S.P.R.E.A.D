import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

// Legend refers only to lab evidence associated with possible or identified lots.
const LAB_COLORS = {
  Positive: '#dc2626',
  Negative: '#15803d',
  Inconclusive: '#ca8a04',
  Pending: '#ea580c',
  Mixed: '#9333ea',
  Unknown: '#2563eb',
}
const LAB_LABELS = ['Positive', 'Negative', 'Inconclusive', 'Pending', 'Mixed', 'Unknown']
const labColor = (status) => LAB_COLORS[status] || LAB_COLORS.Unknown

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
          {mode === 'cases' && locations.filter((loc) =>
            loc.latitude != null && loc.longitude != null &&
            Number.isFinite(Number(loc.latitude)) && Number.isFinite(Number(loc.longitude))
          ).map((loc) => (
            <CircleMarker key={loc.location_id}
              center={[Number(loc.latitude), Number(loc.longitude)]}
              radius={8} pathOptions={{ color: labColor(loc.lab_status), fillColor: labColor(loc.lab_status), fillOpacity: 0.4, weight: 2.5 }}>
              <Tooltip>{loc.location_name} — {loc.lab_status || 'Unknown'} lab evidence</Tooltip>
              <Popup>
                <strong>{loc.location_name}</strong>
                <p>Reported exposures: {loc.reported_cases}</p>
                <p>Candidate/identified lots: {loc.candidate_lots ?? 'Not available'}</p>
                <p>Associated lab evidence: <strong>{loc.lab_status || 'Unknown'}</strong></p>
                {Array.isArray(loc.lab_statuses) && loc.lab_statuses.length > 1 &&
                  <p>Findings: {loc.lab_statuses.join(', ')}</p>}
                <small>Associated test results concern candidate or identified lots; they do not prove contamination at this location or causation of illness. Negative applies only to tests performed.</small>
              </Popup>
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
      {mode === 'cases' && (
        <div aria-label="Associated laboratory result legend" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <strong style={{ fontSize: 12, color: '#34465c' }}>Associated laboratory results</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', alignItems: 'center' }}>
            {LAB_LABELS.map((label) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34465c' }}>
                <span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: LAB_COLORS[label], display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
          <small style={{ color: '#52647a' }}>
            Colors reflect lab results on candidate/identified lots, not confirmed contamination at the exposure location. Mixed means differing or unknown findings are associated with that location.
          </small>
        </div>
      )}
      {mode === 'routes' && (
        <small style={{ color: '#52647a' }}>
          Red = selected lot’s documented distribution legs (not confirmed pathogen spread). Lines are straight-line connections.
        </small>
      )}
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
