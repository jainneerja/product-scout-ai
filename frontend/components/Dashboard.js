const scoreTone = (score) => {
  if (score >= 75) return 'good';
  if (score >= 45) return 'warn';
  return 'bad';
};

export default function Dashboard({ data }) {
  return (
    <div className="dashboard">
      <section className={`card opportunity ${scoreTone(data.opportunity_score)}`}>
        <h2>⭐ Opportunity Score</h2>
        <p className="bigScore">{data.opportunity_score}</p>
      </section>

      <section className="card">
        <h2>🔥 Trending Products</h2>
        <div className="list">
          {data.top_products.map((product) => (
            <article key={product.name} className="item">
              <div>
                <h3>{product.name}</h3>
                <p>Rating: {product.rating} • Reviews: {product.reviews}</p>
                <p>{product.insight}</p>
              </div>
              <div className="badges">
                <span className="badge">BSR {product.estimated_bsr}</span>
                <span className="badge blue">Velocity {product.demand_velocity_score}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>🏭 Supplier Matches</h2>
        <div className="list">
          {data.supplier_matches.map((match) => (
            <article key={`${match.product}-${match.supplier}`} className="item compact">
              <h3>{match.product}</h3>
              <p>{match.supplier}</p>
              <p>Cost: {match.cost} • MOQ: {match.moq}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card split">
        <div>
          <h2>💰 Profitability</h2>
          <p>Estimated Margin: {data.profitability.estimated_margin}</p>
          <p>Margin %: {data.profitability.margin_percentage}</p>
          <span className="badge">{data.profitability.classification}</span>
        </div>
        <div>
          <h2>📊 Market Insight</h2>
          <p>Demand: {data.market_insight.demand_level}</p>
          <p>Competition: {data.market_insight.competition_level}</p>
          <p>{data.market_insight.why_this_is_trending}</p>
        </div>
      </section>
    </div>
  );
}
