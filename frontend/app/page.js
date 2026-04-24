'use client';

import { useState } from 'react';
import Dashboard from '../components/Dashboard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [category, setCategory] = useState('earrings');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });

      if (!response.ok) {
        throw new Error('Analysis request failed.');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="hero">
        <h1>AI Product Scout</h1>
        <p>Find profitable product opportunities with AI-simulated market intelligence.</p>
      </header>

      <section className="searchCard card">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter category (e.g. earrings)"
        />
        <button onClick={onAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </section>

      {error ? <p className="error">{error}</p> : null}
      {data ? <Dashboard data={data} /> : null}
    </main>
  );
}
