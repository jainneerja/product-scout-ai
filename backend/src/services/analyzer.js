import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const amazonPath = path.resolve(__dirname, '../../../data/amazon_mock.json');
const alibabaPath = path.resolve(__dirname, '../../../data/alibaba_mock.json');

const categoryBoostMap = {
  earrings: 8,
  'phone cases': 9,
  'skincare tools': 7,
  'fitness accessories': 10,
  'kitchen gadgets': 8
};

const loadJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const normalize = (value, min, max) => {
  if (max === min) return 100;
  return ((value - min) / (max - min)) * 100;
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const bsrBucket = (score) => {
  if (score >= 75) return '#1 - #500';
  if (score >= 40) return '#500 - #5000';
  return '#5000+';
};

const demandLevelFromScore = (score) => {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
};

const competitionFromReviews = (reviews, maxReviews) => {
  const ratio = reviews / maxReviews;
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'medium';
  return 'low';
};

const competitionScore = (level) => {
  if (level === 'low') return 100;
  if (level === 'medium') return 60;
  return 25;
};

const marginClass = (marginPercent) => {
  if (marginPercent > 60) return 'High profit';
  if (marginPercent >= 30) return 'Medium profit';
  return 'Low profit';
};

const marginScore = (marginPercent) => clamp(marginPercent, 0, 100);

const bsrScoreFromBucket = (bucket) => {
  if (bucket === '#1 - #500') return 100;
  if (bucket === '#500 - #5000') return 65;
  return 25;
};

const matchSupplier = (product, suppliers) => {
  const ranked = suppliers.map((supplier) => {
    let score = 0;
    if (product.category === supplier.category) score += 50;
    if (product.material === supplier.material) score += 30;
    if (product.style === supplier.style) score += 20;
    if (product.name.toLowerCase().includes(supplier.product_type.split(' ')[0])) score += 10;
    return { supplier, score };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.supplier;
};

const trendingExplanation = (product, demandLevel, competitionLevel) =>
  `${product.name} shows ${demandLevel} demand due to ${product.reviews.toLocaleString()} reviews and a ${product.rating} rating. ` +
  `Competition is ${competitionLevel}, creating ${competitionLevel === 'low' ? 'a favorable' : 'a moderate'} entry window for differentiated branding.`;

export const analyzeCategory = (categoryInput) => {
  const category = (categoryInput || '').toLowerCase().trim();

  const amazonData = loadJson(amazonPath);
  const alibabaData = loadJson(alibabaPath);

  const products = amazonData.filter((p) => p.category === category);

  if (!products.length) {
    return {
      category,
      top_products: [],
      supplier_matches: [],
      profitability: {
        estimated_margin: '$0.00',
        margin_percentage: '0.00%',
        classification: 'Low profit'
      },
      market_insight: {
        demand_level: 'low',
        competition_level: 'low',
        why_this_is_trending: 'No matching products found in the mock catalog for this category.'
      },
      opportunity_score: 0
    };
  }

  const reviews = products.map((p) => p.reviews);
  const ratings = products.map((p) => p.rating);
  const minReviews = Math.min(...reviews);
  const maxReviews = Math.max(...reviews);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  const enriched = products.map((product) => {
    const reviewScore = normalize(product.reviews, minReviews, maxReviews);
    const ratingScore = normalize(product.rating, minRating, maxRating);
    const categoryBoost = categoryBoostMap[product.category] || 5;

    const demandVelocityScore = clamp(
      reviewScore * 0.6 + ratingScore * 0.3 + categoryBoost * 10 * 0.1,
      0,
      100
    );

    const estimatedBsr = bsrBucket(demandVelocityScore);
    const competitionLevel = competitionFromReviews(product.reviews, maxReviews);

    return {
      ...product,
      demandVelocityScore,
      estimatedBsr,
      competitionLevel,
      demandLevel: demandLevelFromScore(demandVelocityScore)
    };
  });

  enriched.sort((a, b) => b.demandVelocityScore - a.demandVelocityScore);
  const topProducts = enriched.slice(0, 3);

  const supplierMatchesRaw = topProducts.map((product) => {
    const supplier = matchSupplier(product, alibabaData);
    return {
      product,
      supplier
    };
  });

  const margins = supplierMatchesRaw
    .filter((entry) => entry.supplier)
    .map((entry) => entry.product.price - entry.supplier.cost);

  const avgMargin = margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
  const avgRetail = topProducts.reduce((sum, p) => sum + p.price, 0) / topProducts.length;
  const marginPercent = avgRetail ? (avgMargin / avgRetail) * 100 : 0;

  const avgDemand = topProducts.reduce((sum, p) => sum + p.demandVelocityScore, 0) / topProducts.length;
  const compScore =
    topProducts.reduce((sum, p) => sum + competitionScore(p.competitionLevel), 0) / topProducts.length;
  const avgBsrScore =
    topProducts.reduce((sum, p) => sum + bsrScoreFromBucket(p.estimatedBsr), 0) / topProducts.length;

  const opportunityScore = clamp(
    avgDemand * 0.4 + compScore * 0.25 + marginScore(marginPercent) * 0.25 + avgBsrScore * 0.1,
    0,
    100
  );

  const demandLevel = demandLevelFromScore(avgDemand);
  const overallCompLevel =
    compScore >= 80 ? 'low' : compScore >= 45 ? 'medium' : 'high';

  return {
    category,
    top_products: topProducts.map((product) => ({
      name: product.name,
      rating: product.rating.toFixed(1),
      reviews: product.reviews.toString(),
      estimated_bsr: product.estimatedBsr,
      demand_velocity_score: Number(product.demandVelocityScore.toFixed(1)),
      insight: `${product.demandLevel.toUpperCase()} demand with ${product.competitionLevel} competition.`
    })),
    supplier_matches: supplierMatchesRaw
      .filter((entry) => entry.supplier)
      .map((entry) => ({
        product: entry.product.name,
        supplier: entry.supplier.supplier,
        cost: `$${entry.supplier.cost.toFixed(2)}`,
        moq: entry.supplier.moq.toString()
      })),
    profitability: {
      estimated_margin: `$${avgMargin.toFixed(2)}`,
      margin_percentage: `${marginPercent.toFixed(2)}%`,
      classification: marginClass(marginPercent)
    },
    market_insight: {
      demand_level: demandLevel,
      competition_level: overallCompLevel,
      why_this_is_trending: trendingExplanation(topProducts[0], demandLevel, overallCompLevel)
    },
    opportunity_score: Number(opportunityScore.toFixed(1))
  };
};
