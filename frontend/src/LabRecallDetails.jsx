import { useEffect, useState } from 'react'

function apiBaseUrl() {
  const currentPath = window.location.pathname
  const jupyterBase = currentPath.split('/proxy/4173')[0]
  return import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : currentPath.includes('/proxy/4173')
      ? `${jupyterBase}/proxy/8080`
      : 'http://localhost:8080'
}

function statusClass(value) {
  const status = (value ?? '').toLowerCase()
  if (status === 'positive' || status === 'active') return 'lr-alert'
  if (status === 'negative' || status === 'completed' || status === 'closed') return 'lr-neutral'
  return 'lr-pending'
}

function LabRecallDetails({ lotId }) {
  const [tests, setTests] = useState([])
  const [recalls, setRecalls] = useState([])
  const [testError, setTestError] = useState('')
  const [recallError, setRecallError] = useState('')
  const [testLoading, setTestLoading] = useState(true)
  const [recallLoading, setRecallLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const base = apiBaseUrl()

    async function load(endpoint, setter, errorSetter, loadingSetter) {
      try {
        const response = await fetch(`${base}/api/lots/${encodeURIComponent(lotId)}/${endpoint}`, { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const items = await response.json()
        if (!Array.isArray(items)) throw new Error('Unexpected API response')
        setter(items)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(`Unable to load ${endpoint}:`, error)
          errorSetter('Unable to load records. Check the backend and try again.')
        }
      } finally {
        if (!controller.signal.aborted) loadingSetter(false)
      }
    }

    load('lab-tests', setTests, setTestError, setTestLoading)
    load('recalls', setRecalls, setRecallError, setRecallLoading)
    return () => controller.abort()
  }, [lotId])

  return (
    <section className="lab-recall-details" aria-label="Laboratory and recall details">
      <h3>Laboratory &amp; Recall Details</h3>
      <p className="lr-note">Synthetic demonstration data. A positive sample does not establish that a specific reported illness was caused by this lot.</p>
      <div className="lr-grid">
        <div className="lr-panel">
          <h4>Laboratory Tests</h4>
          {testLoading ? <p>Loading tests…</p>
            : testError ? <p className="lr-error" role="alert">{testError}</p>
            : tests.length === 0 ? <p>No laboratory tests recorded for this lot.</p>
            : tests.map((test) => (
              <article key={test.test_id} className="lr-item">
                <div className="lr-item-heading"><strong>Test #{test.test_id}</strong><span className={`lr-status ${statusClass(test.result)}`}>{test.result}</span></div>
                <p className="lr-prominent">{test.pathogen_name}</p>
                <dl className="lr-facts">
                  <div><dt>Test date</dt><dd>{test.test_date ?? 'Unknown'}</dd></div>
                  <div><dt>Sample</dt><dd>{test.sample_type ?? 'Unknown'}</dd></div>
                  <div><dt>Testing location</dt><dd>{test.testing_location ?? 'Not recorded'}</dd></div>
                </dl>
                {test.notes && <p className="lr-detail">{test.notes}</p>}
              </article>
            ))}
        </div>
        <div className="lr-panel">
          <h4>Recalls</h4>
          {recallLoading ? <p>Loading recalls…</p>
            : recallError ? <p className="lr-error" role="alert">{recallError}</p>
            : recalls.length === 0 ? <p>No recall records associated with this lot.</p>
            : recalls.map((recall) => (
              <article key={recall.recall_id} className="lr-item">
                <div className="lr-item-heading"><strong>Recall #{recall.recall_id}</strong><span className={`lr-status ${statusClass(recall.status)}`}>{recall.status ?? 'Unknown'}</span></div>
                <dl className="lr-facts">
                  <div><dt>Recall date</dt><dd>{recall.recall_date ?? 'Unknown'}</dd></div>
                  <div><dt>Quantity affected</dt><dd>{recall.quantity_affected == null ? 'Not recorded' : `${recall.quantity_affected} ${recall.quantity_unit ?? ''}`}</dd></div>
                </dl>
                {recall.reason && <p className="lr-detail">{recall.reason}</p>}
              </article>
            ))}
        </div>
      </div>
    </section>
  )
}

export default LabRecallDetails
