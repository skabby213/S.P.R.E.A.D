
import { useState } from 'react'
import OutbreakMap from './OutbreakMap'
import './App.css'

function App() {
  const [lotId, setLotId] = useState('')
  const [lotData, setLotData] = useState(null)

  // Search for a lot using the C++ backend
  const searchLot = async () => {
    const currentPath = window.location.pathname

    const jupyterBase = currentPath.split('/proxy/4173')[0]

    // Use Docker's API URL when configured.
    // Otherwise, use the JupyterHub proxy or localhost.
    const apiBase = import.meta.env.VITE_API_BASE
      ? import.meta.env.VITE_API_BASE
      : currentPath.includes('/proxy/4173')
        ? `${jupyterBase}/proxy/8080`
        : 'http://localhost:8080'
  
    try {
      const response = await fetch(
        `${apiBase}/api/lots/${encodeURIComponent(lotId)}`
      )

      if (!response.ok) {
        throw new Error('Unable to retrieve lot information')
      }

      const data = await response.json()
      setLotData(data)
    } catch (error) {
      console.error('Lot search failed:', error)
      setLotData(null)
      alert('Unable to retrieve lot information. Check that the backend is running.')
    }
  }

  return (
    <div className="app">

      {/* Application Header */}
      <header>
        <h1>S.P.R.E.A.D.</h1>
        <p>Food Supply Traceback System</p>
      </header>

      <main>

        {/* Dashboard Overview */}
       
        <section className="dashboard-overview">
          <h2>Dashboard Overview</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Reported Cases</h3>
              <p className="stat-number">—</p>
            </div>

            <div className="stat-card">
              <h3>Tracked Lots</h3>
              <p className="stat-number">—</p>
            </div>

            <div className="stat-card">
              <h3>Locations</h3>
              <p className="stat-number">—</p>
            </div>
          </div>
        </section>

        {/* Product Traceback */}
        <section className="product-section">
          <h2>Product Traceback</h2>

          <p>
            Search for a food lot to view product and supply chain information.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              searchLot()
            }}
          >
            <input
              type="text"
              placeholder="Enter Lot ID"
              aria-label="Lot ID"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              required
            />

            <button type="submit">
              Search
            </button>
          </form>
        </section>

        {/* Traceback Results */}
        <section className="traceback-section">
          <h2>Traceback Results</h2>

          {lotData ? (
            <div className="result-card">
              <h3>Lot Information</h3>

              <div className="result-row">
                <span>Lot ID</span>
                <strong>{lotData.lot_id}</strong>
              </div>

              <div className="result-row">
                <span>Lot Code</span>
                <strong>{lotData.lot_code}</strong>
              </div>

              <div className="result-row">
                <span>Status</span>
                <strong>{lotData.status}</strong>
              </div>
            </div>
          ) : (
            <div className="empty-results">
              No lot selected. Enter a Lot ID above to begin.
            </div>
          )}
        </section> {/* Illness Cases */}

<section className="cases-section">
  <h2>Illness Cases</h2>

  <div className="cases-table-wrapper">
    <table className="cases-table">
      <thead>
        <tr>
          <th>Case ID</th>
          <th>Location</th>
          <th>Lot Code</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td colSpan="4" className="no-cases">
            No case data available.
          </td>
        </tr>
      </tbody>
    </table>
 
        </div>
      </section>
        {/* Outbreak Map */}
      <section className="map-section">
        <h2>Outbreak Map</h2>

        <p>
          Geographic visualization of foodborne illness cases.
          Case locations will appear when database integration is complete.
        </p>

        <OutbreakMap />
      </section>
      </main>
    </div>
  )
}

export default App

