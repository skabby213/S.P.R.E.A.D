import { useState } from 'react'
import './App.css'

function App() {  
  const [lotId, setLotId] = useState('')
  const [lotData, setLotData] = useState(null)
  const searchLot = async () => {
  const currentPath = window.location.pathname

  const jupyterBase = currentPath.split('/proxy/4173')[0]

  const apiBase = currentPath.includes('/proxy/4173')
    ? `${jupyterBase}/proxy/8080`
    : 'http://localhost:8080'

  const response = await fetch(
    `${apiBase}/api/lots/${encodeURIComponent(lotId)}`
  )

  const data = await response.json()
  setLotData(data)
}
  return (
    <div className="app">
      <header>
        <h1>S.P.R.E.A.D.</h1>
        <p>Food Supply Traceback System</p>
      </header>

      
<main>
  <section className="dashboard-overview">
    <h2>Dashboard Overview</h2>
    <p className="sample-note">
      Sample data — database integration pending
    </p>

    <div className="stats-grid">
      <div className="stat-card">
        <h3>Reported Cases</h3>
        <p className="stat-number">24</p>
      </div>

      <div className="stat-card">
        <h3>Tracked Lots</h3>
        <p className="stat-number">8</p>
      </div>

      <div className="stat-card">
        <h3>Locations</h3>
        <p className="stat-number">5</p>
      </div>
    </div>
  </section>

  <h2>Product Traceback</h2>


        <p>
          Search for a food lot to view product and supply chain information.
        </p>

        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              searchLot()
            }}
          >
            <input
              type="text"
              placeholder="Enter Lot ID"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
            />

            <button type="submit">
              Search
            </button>
          </form>
        </div>

       
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
</section>

      </main>
    </div>
  )
}

export default App