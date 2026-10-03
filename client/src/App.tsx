import { useState, type FormEvent } from 'react'
import './App.css'

type Recommendation = {
  orderId: number
  requestedAt: string
  selectedItems: { id: number; name: string; price: number; category: string; reason: string }[]
  totalCost: number
  remainingBudget: number
  reasoning: string
}

function App() {
  const [orderId, setOrderId] = useState('123')
  const [preferences, setPreferences] = useState('spicy')
  const [budget, setBudget] = useState('250')
  const [includeDrink, setIncludeDrink] = useState(true)
  const [requestedAt, setRequestedAt] = useState('')
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setRecommendation(null)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(orderId),
          preferences: preferences.split(',').map((value) => value.trim()).filter(Boolean),
          budget: Number(budget),
          includeDrink,
          requestedAt: requestedAt ? new Date(requestedAt).toISOString() : null,
        }),
      })

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.detail ?? body.title ?? 'Could not get recommendations.')
      }
      setRecommendation(body as Recommendation)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reach the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="recommendation-app">
      <h1>Food recommendations</h1>
      <p>Tell us about the order and get meal suggestions from the AI assistant.</p>
      <form className="recommendation-form" onSubmit={handleSubmit}>
        <label>Order ID<input type="number" min="1" required value={orderId} onChange={(event) => setOrderId(event.target.value)} /></label>
        <label>Preferences <span>(comma separated)</span><input value={preferences} onChange={(event) => setPreferences(event.target.value)} placeholder="spicy, vegetarian" /></label>
        <label>Budget (MDL)<input type="number" min="0.01" step="0.01" required value={budget} onChange={(event) => setBudget(event.target.value)} /></label>
        <label>Requested time (optional)<input type="datetime-local" value={requestedAt} onChange={(event) => setRequestedAt(event.target.value)} /></label>
        <label className="drink-option"><input type="checkbox" checked={includeDrink} onChange={(event) => setIncludeDrink(event.target.checked)} /> Include a drink</label>
        <button type="submit" disabled={loading}>{loading ? 'Getting recommendations…' : 'Recommend a meal'}</button>
      </form>

      {error && <p className="recommendation-error" role="alert">{error}</p>}
      {recommendation && (
        <section className="recommendation-result" aria-live="polite">
          <h2>Recommendation for order #{recommendation.orderId}</h2>
          <p>{recommendation.reasoning}</p>
          {recommendation.selectedItems.length === 0 ? <p>No items fit this budget.</p> : (
            <ul>{recommendation.selectedItems.map((item) => (
              <li key={item.id}><strong>{item.name}</strong> — {item.price.toFixed(2)} MDL <span>({item.category})</span><p>{item.reason}</p></li>
            ))}</ul>
          )}
          <p><strong>Total:</strong> {recommendation.totalCost.toFixed(2)} MDL · <strong>Remaining:</strong> {recommendation.remainingBudget.toFixed(2)} MDL</p>
          <small>Requested at: {new Date(recommendation.requestedAt).toLocaleString()}</small>
        </section>
      )}
    </main>
  )
}

export default App
