import { useEffect, useState } from 'react'
import OutbreakMap from './OutbreakMap'
import LabRecallDetails from './LabRecallDetails'
import LotSearch from './LotSearch'
import './App.css'

const navigation = [
  { label: 'Dashboard', target: 'dashboard' },
  { label: 'Traceback', target: 'traceback' },
  { label: 'Illness Cases', target: 'cases' },
  { label: 'Outbreak Map', target: 'map' },
  { label: 'Locations', target: 'map' },
]

function App() {
  const [lotData, setLotData] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [trackedLots, setTrackedLots] = useState(null)
  const [summary, setSummary] = useState(null)
  const [cases, setCases] = useState([])
  const [caseError, setCaseError] = useState('')
  const [shipments, setShipments] = useState([])

  useEffect(() => {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

  fetch(`${apiBase}/api/stats/lots`)
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load tracked lots')
      return response.json()
    })
    .then((data) => setTrackedLots(data.tracked_lots))
    .catch((error) => console.error('Tracked lots error:', error))
}, [])

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
    fetch(`${apiBase}/api/summary`)
      .then((r) => { if (!r.ok) throw new Error('Summary failed'); return r.json() })
      .then(setSummary)
      .catch((error) => console.error('Summary error:', error))

    fetch(`${apiBase}/api/illness-reports`)
      .then((r) => { if (!r.ok) throw new Error('Cases failed'); return r.json() })
      .then(setCases)
      .catch((error) => { console.error(error); setCaseError('Unable to load illness cases.') })
  }, [])

  const searchLot = async (selectedId) => {
    const id = String(selectedId).trim()
    if (!id) return
    setLoading(true)
    setSearchError('')
    setLotData(null)
    setShipments([])

    const currentPath = window.location.pathname
    const jupyterBase = currentPath.split('/proxy/4173')[0]
    const apiBase = import.meta.env.VITE_API_BASE
      ? import.meta.env.VITE_API_BASE
      : currentPath.includes('/proxy/4173')
        ? `${jupyterBase}/proxy/8080`
        : 'http://localhost:8080'

    try {
      const response = await fetch(`${apiBase}/api/lots/${encodeURIComponent(id)}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Lot ID ${id} was not found.`)
        }
        throw new Error('Unable to retrieve lot information.')
      }
      setLotData(await response.json())
      try {
        const shipmentsResponse = await fetch(`${apiBase}/api/lots/${encodeURIComponent(id)}/shipments`)
        if (shipmentsResponse.ok) setShipments(await shipmentsResponse.json())
        else console.error('Shipment history could not be loaded')
      } catch (shipmentError) {
        console.error('Shipment history error:', shipmentError)
      }
    } catch (error) {
      console.error('Lot search failed:', error)
      setSearchError(error.message || 'Unable to retrieve lot information.')
    } finally {
      setLoading(false)
    }
  }

  const navigate = (item) => {
    setActiveNav(item.label)
    document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">
   <header className="top-header">
  <div className="top-brand">
    <div className="brand-icon" aria-hidden="true">✣</div>
    <div>
      <div className="brand-name">S.P.R.E.A.D.</div>
      <div className="brand-subtitle">
  System for Processing, Routing, Equipment, Allocation, and Distribution
</div>
    </div>
  </div>
</header>

      <main className="main-content" id="dashboard">
        <div className="page-heading">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Monitor foodborne illness cases and trace them back through the supply chain.</p>
          </div>
          <span className="data-badge">Live Supabase data · Synthetic demonstration</span>
        </div>

        <section className="stats-grid" aria-label="Dashboard statistics">
          <div className="stat-card">
            <h2>Reported Cases</h2>
            <p className="stat-number">{summary?.reported_cases ?? '—'}</p>
            <span className="stat-caption">Reported illness records</span>
          </div>
          <div className="stat-card">
             <h2>Tracked Lots</h2>
            <p className="stat-number">{summary?.tracked_lots ?? trackedLots ?? '—'}</p>
            <span className="stat-caption mint">Database lot records</span>
          </div>
          <div className="stat-card">
            <h2>Locations</h2>
            <p className="stat-number">{summary?.locations ?? '—'}</p>
            <span className="stat-caption">Recorded facilities and locations</span>
          </div>
        </section>

        <section className="panel traceback-panel" id="traceback">
          <h2>Product Traceback</h2>
          <p className="panel-description">Search for a food lot to view product and supply chain information.</p>
          <LotSearch onLookup={searchLot} loading={loading} />

          <div className="supply-chain" aria-label="Supply chain stages">
            <div className="chain-step"><span>Production</span><strong>{lotData?.production_location ?? 'Search for a lot'}</strong></div>
            <div className="chain-step"><span>Shipment legs</span><strong>{lotData ? shipments.length : '—'}</strong></div>
            <div className="chain-step"><span>Destinations</span><strong>{shipments.length ? [...new Set(shipments.map((s) => s.destination))].join(', ') : 'Not available'}</strong></div>
            <div className="chain-step retailer"><span>Latest delivery</span><strong>{shipments.length ? [...shipments].sort((a,b) => (b.arrival_date ?? '').localeCompare(a.arrival_date ?? ''))[0].arrival_date ?? 'Unknown' : 'Not available'}</strong></div>
          </div>

          {searchError && <p className="search-error" role="alert">{searchError}</p>}
          {lotData && (
            <div className="shipment-history">
              <h3>Shipment History</h3>
              {shipments.length === 0 ? <p>No shipments recorded for this lot.</p> : (
                <div className="table-scroll">
                  <table className="cases-table">
                    <thead><tr><th>Shipment</th><th>Origin</th><th>Destination</th><th>Arrival</th><th>Quantity</th></tr></thead>
                    <tbody>{shipments.map((s) => (
                      <tr key={s.shipment_id}>
                        <td>{s.shipment_id}</td><td>{s.origin}</td><td>{s.destination}</td>
                        <td>{s.arrival_date ?? 'Pending'}</td><td>{s.quantity_shipped} {s.quantity_unit}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {lotData && (
            <div className="lot-results">
              <h3>Lot Information</h3>
              <div className="result-grid">
                <div><span>Lot ID</span><strong>{lotData.lot_id ?? '—'}</strong></div>
                <div><span>Lot Code</span><strong>{lotData.lot_code ?? '—'}</strong></div>
                <div><span>Product</span><strong>{lotData.product_name ?? '—'}</strong></div>
                <div><span>Production Location</span><strong>{lotData.production_location ?? '—'}</strong></div>
                <div><span>Production Date</span><strong>{lotData.production_date ?? '—'}</strong></div>
                <div><span>Expiration Date</span><strong>{lotData.expiration_date ?? '—'}</strong></div>
              </div>
            </div>
          )}
          {lotData && <LabRecallDetails key={lotData.lot_id} lotId={lotData.lot_id} />}
        </section>

        <div className="lower-grid">
          <section className="panel cases-panel" id="cases">
            <h2>Illness Cases</h2>
            <div className="cases-table-wrapper">
              <table className="cases-table">
                <thead>
                  <tr><th>Case ID</th><th>Location</th><th>Lot Code</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {cases.length ? cases.map((item) => (
                    <tr key={`${item.illness_id}-${item.exposure_id ?? 'none'}`}>
                      <td>{item.illness_id}</td>
                      <td>{item.location_name ?? 'Unknown'}</td>
                      <td>{item.lot_code ?? 'Unidentified'}</td>
                      <td>{item.status}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="no-cases">{caseError || 'No cases found.'}</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel map-panel" id="map">
            <div className="map-heading">
              <h2>Outbreak Map</h2>
              <span>Shipment routes & reported exposures</span>
            </div>
            <div className="map-container">
              <OutbreakMap lotId={lotData?.lot_id ?? null} shipments={shipments} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App