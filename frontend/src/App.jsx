import { useEffect, useState } from 'react'
import OutbreakMap from './OutbreakMap'
import './App.css'

const navigation = [
  { label: 'Dashboard', target: 'dashboard' },
  { label: 'Traceback', target: 'traceback' },
  { label: 'Illness Cases', target: 'cases' },
  { label: 'Outbreak Map', target: 'map' },
  { label: 'Locations', target: 'map' },
]

function App() {
  const [lotId, setLotId] = useState('')
  const [lotData, setLotData] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [trackedLots, setTrackedLots] = useState(null)

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

  const searchLot = async () => {
    const id = lotId.trim()
    if (!id) return
    setLoading(true)
    setSearchError('')
    setLotData(null)

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
          <span className="data-badge">Live lot lookup · Other data pending</span>
        </div>

        <section className="stats-grid" aria-label="Dashboard statistics">
          <div className="stat-card">
            <h2>Reported Cases</h2>
            <p className="stat-number">—</p>
            <span className="stat-caption">Awaiting case data</span>
          </div>
          <div className="stat-card">
             <h2>Tracked Lots</h2>
            <p className="stat-number">{trackedLots ?? '—'}</p>
            <span className="stat-caption mint">Awaiting summary data</span>
          </div>
          <div className="stat-card">
            <h2>Locations</h2>
            <p className="stat-number">—</p>
            <span className="stat-caption">Awaiting location data</span>
          </div>
        </section>

        <section className="panel traceback-panel" id="traceback">
          <h2>Product Traceback</h2>
          <p className="panel-description">Search for a food lot to view product and supply chain information.</p>
          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault()
              searchLot()
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              placeholder="Enter numeric Lot ID, e.g. 101"
              aria-label="Lot ID"
              value={lotId}
              onChange={(event) => setLotId(event.target.value)}
              required
            />
            <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
          </form>

          <div className="supply-chain" aria-label="Supply chain stages">
            <div className="chain-step"><span>Farm</span><strong>Not available</strong></div>
            <div className="chain-step"><span>Processor</span><strong>Not available</strong></div>
            <div className="chain-step"><span>Distributor</span><strong>Not available</strong></div>
            <div className="chain-step retailer"><span>Retailer</span><strong>Not available</strong></div>
          </div>

          {searchError && <p className="search-error" role="alert">{searchError}</p>}
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
                  <tr><td colSpan={4} className="no-cases">No case data available.</td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel map-panel" id="map">
            <div className="map-heading">
              <h2>Outbreak Map</h2>
              <span>Cases by location</span>
            </div>
            <div className="map-container">
              <OutbreakMap />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App