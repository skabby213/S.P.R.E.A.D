import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function OutbreakMap() {
  const [locations, setLocations] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
    fetch(`${apiBase}/api/outbreak-locations`)
      .then((response) => { if (!response.ok) throw new Error('Location request failed'); return response.json() })
      .then(setLocations)
      .catch((e) => { console.error(e); setError('Unable to load locations') })
  }, [])

  return (
    <div className="map-wrapper" style={{ height: '100%' }}>
      {error && <p role="alert">{error}</p>}
      <MapContainer center={[35.8456, -86.3903]} zoom={9} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc) => (
          <CircleMarker key={loc.location_id} center={[Number(loc.latitude), Number(loc.longitude)]} radius={8}>
            <Popup><strong>{loc.location_name}</strong><p>Reported exposure cases: {loc.reported_cases}</p><small>Suspected exposure location; not a confirmed contamination source.</small></Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default OutbreakMap
