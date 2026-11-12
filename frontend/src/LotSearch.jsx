import { useEffect, useMemo, useRef, useState } from 'react'
import './LotSearch.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const displayName = (lot) => `${lot.product_name} — ${lot.lot_code} (ID ${lot.lot_id})`

export default function LotSearch({ onLookup, loading }) {
  const [lots, setLots] = useState([])
  const [catalogError, setCatalogError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hint, setHint] = useState('')
  const searchRef = useRef(null)
  const blurTimer = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE}/api/lots`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Catalog request failed')
        return response.json()
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Unexpected catalog response')
        setLots(data)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Lot catalog error:', error)
          setCatalogError('Lot suggestions are unavailable. You can still enter a numeric Lot ID.')
        }
      })
    return () => { controller.abort(); clearTimeout(blurTimer.current) }
  }, [])

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term || selectedId !== null) return lots.slice(0, 8)
    return lots.filter((lot) =>
      `${lot.lot_id} ${lot.lot_code} ${lot.product_name}`.toLowerCase().includes(term)
    ).slice(0, 8)
  }, [lots, query, selectedId])

  const choose = (lot) => {
    clearTimeout(blurTimer.current)
    setQuery(displayName(lot))
    setSelectedId(lot.lot_id)
    setOpen(false)
    setHint('')
    setActiveIndex(-1)
    onLookup(lot.lot_id)
  }

  const submit = (event) => {
    event.preventDefault()
    if (loading) return
    if (selectedId !== null) {
      onLookup(selectedId)
      return
    }
    const term = query.trim()
    if (/^\d+$/.test(term)) {
      setOpen(false)
      setHint('')
      onLookup(term)
    } else if (matches.length === 1) {
      choose(matches[0])
    } else {
      setHint('Select a matching lot below, or enter its numeric ID.')
      setOpen(true)
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    } else if (event.key === 'ArrowDown' && matches.length) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1))
    } else if (event.key === 'ArrowUp' && matches.length) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter' && open && activeIndex >= 0 && matches[activeIndex]) {
      event.preventDefault()
      choose(matches[activeIndex])
    }
  }

  return (
    <div className="lot-search">
      <form className="search-form lot-search-form" onSubmit={submit}>
        <div className="lot-search-input-wrap" ref={searchRef}>
          <input
            type="text"
            role="combobox"
            aria-label="Search lots by product name, lot code, or ID"
            aria-autocomplete="list"
            aria-expanded={open && matches.length > 0}
            aria-controls="spread-lot-options"
            aria-activedescendant={open && activeIndex >= 0 ? `spread-lot-option-${activeIndex}` : undefined}
            autoComplete="off"
            placeholder="Search product name, lot code, or ID (e.g. tomatoes, 201)"
            value={query}
            onFocus={() => { clearTimeout(blurTimer.current); setOpen(true) }}
            onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120) }}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedId(null)
              setOpen(true)
              setActiveIndex(-1)
              setHint('')
            }}
            onKeyDown={onKeyDown}
          />
          {open && matches.length > 0 && (
            <div id="spread-lot-options" role="listbox" className="lot-options">
              {matches.map((lot, index) => (
                <button
                  type="button"
                  role="option"
                  id={`spread-lot-option-${index}`}
                  aria-selected={index === activeIndex}
                  className={`lot-option ${index === activeIndex ? 'lot-option-active' : ''}`}
                  key={lot.lot_id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(lot)}
                >
                  <strong>{lot.product_name}</strong>
                  <small>Lot {lot.lot_id} · {lot.lot_code}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </form>
      {hint && <p className="lot-search-hint" role="status">{hint}</p>}
      {catalogError && <p className="lot-search-hint" role="status">{catalogError}</p>}
    </div>
  )
}
