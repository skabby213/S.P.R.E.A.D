import { useState } from 'react'
import './App.css'

function App() {  
  const [lotId, setLotId] = useState('')
  const [lotData, setLotData] = useState(null)
  const searchLot = async () => {
  const currentPath = window.location.pathname

  const jupyterBase = currentPath.split('/proxy/4173')[0]

  // VITE_API_BASE is optional (set at build time, e.g. in Docker).
  // Without it, behavior is unchanged: JupyterHub proxy path, else localhost.
  const apiBase = import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : currentPath.includes('/proxy/4173')
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
          <button type="button" onClick={searchLot}>
            Search
          </button>
        </div>

        <h2>Traceback Results</h2>
        {lotData ? (
          <div>
            <p>Lot ID: {lotData.lot_id}</p>
            <p>Lot Code: {lotData.lot_code}</p>
            <p>Status: {lotData.status}</p>
          </div>
        ) : (
          <p>No lot selected.</p>
        )}
      </main>
    </div>
  )
}

export default App