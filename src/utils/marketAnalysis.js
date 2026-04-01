/**
 * Market Analysis Utilities for Egg Market Spatial Price Dispersion
 * and Market Integration Assessment
 */

export function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export function variance(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
}

export function stdDev(arr) {
  return Math.sqrt(variance(arr));
}

export function coefficientOfVariation(arr) {
  const m = mean(arr);
  if (m === 0) return 0;
  return (stdDev(arr) / m) * 100;
}

export function correlationCoefficient(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX) * Math.sqrt(denY);
  return den === 0 ? 0 : num / den;
}

export function linearRegressionPair(xArr, yArr) {
  const n = Math.min(xArr.length, yArr.length);
  if (n < 2) return { alpha: 0, beta: 0, rSquared: 0, residuals: [] };
  const mx = mean(xArr.slice(0, n));
  const my = mean(yArr.slice(0, n));
  let ssXY = 0, ssXX = 0;
  for (let i = 0; i < n; i++) {
    ssXY += (xArr[i] - mx) * (yArr[i] - my);
    ssXX += (xArr[i] - mx) ** 2;
  }
  const beta = ssXX === 0 ? 0 : ssXY / ssXX;
  const alpha = my - beta * mx;
  const residuals = [];
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const pred = alpha + beta * xArr[i];
    const res = yArr[i] - pred;
    residuals.push(res);
    ssRes += res * res;
    ssTot += (yArr[i] - my) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { alpha, beta, rSquared, residuals };
}

export function priceDispersion(prices1, prices2) {
  const n = Math.min(prices1.length, prices2.length);
  const diffs = [];
  for (let i = 0; i < n; i++) {
    diffs.push(Math.abs(prices1[i] - prices2[i]));
  }
  return diffs;
}

export function fullMarketAnalysis(state1, state2) {
  const p1 = state1.prices;
  const p2 = state2.prices;
  const n = Math.min(p1.length, p2.length);
  const stats1 = {
    label: state1.label,
    mean: mean(p1), variance: variance(p1), stdDev: stdDev(p1),
    cv: coefficientOfVariation(p1), n: p1.length,
  };
  const stats2 = {
    label: state2.label,
    mean: mean(p2), variance: variance(p2), stdDev: stdDev(p2),
    cv: coefficientOfVariation(p2), n: p2.length,
  };
  const dispersion = priceDispersion(p1.slice(0, n), p2.slice(0, n));
  const dispersionStats = {
    values: dispersion, mean: mean(dispersion), variance: variance(dispersion),
    stdDev: stdDev(dispersion), cv: coefficientOfVariation(dispersion),
    max: Math.max(...dispersion), min: Math.min(...dispersion),
  };
  const r = correlationCoefficient(p1.slice(0, n), p2.slice(0, n));
  const regression = linearRegressionPair(p1.slice(0, n), p2.slice(0, n));
  let integrationLevel = 'Low';
  let integrationColor = '#F44336';
  if (Math.abs(r) >= 0.8) { integrationLevel = 'Strong'; integrationColor = '#4CAF50'; }
  else if (Math.abs(r) >= 0.5) { integrationLevel = 'Moderate'; integrationColor = '#FF9800'; }
  return {
    state1Stats: stats1, state2Stats: stats2, dispersion: dispersionStats,
    correlation: r,
    regression: {
      alpha: regression.alpha, beta: regression.beta, rSquared: regression.rSquared,
      equation: `P₂ = ${regression.alpha.toFixed(3)} + ${regression.beta.toFixed(3)} × P₁`,
    },
    integration: {
      level: integrationLevel, color: integrationColor,
      description: Math.abs(r) >= 0.8 ? 'Strong market integration.' : Math.abs(r) >= 0.5 ? 'Moderate integration.' : 'Weak integration.',
    },
    dates: state1.dates.slice(0, n), n,
  };
}

export const STATE_CATEGORIES = {
  producers: [
    { id: 'namakkal', label: 'Namakkal (TN)', description: 'Major producer', type: 'PC' },
    { id: 'barwala', label: 'Barwala (HR)', description: 'North India hub', type: 'PC' },
    { id: 'chittoor', label: 'Chittoor (AP)', description: 'Large producer', type: 'PC' },
    { id: 'hospet', label: 'Hospet (KA)', description: 'Karnataka hub', type: 'PC' },
    { id: 'hyderabad', label: 'Hyderabad (TS)', description: 'Telangana center', type: 'PC' },
    { id: 'e_godavari', label: 'E.Godavari (AP)', description: 'AP production', type: 'PC' },
    { id: 'ajmer', label: 'Ajmer (RJ)', description: 'Rajasthan hub', type: 'PC' },
  ],
  consumers: [
    { id: 'delhi', label: 'Delhi (CC)', description: 'Largest market', type: 'CC' },
    { id: 'mumbai', label: 'Mumbai (CC)', description: 'West India hub', type: 'CC' },
    { id: 'chennai', label: 'Chennai (CC)', description: 'South India hub', type: 'CC' },
    { id: 'kolkata', label: 'Kolkata (CC)', description: 'East India hub', type: 'CC' },
    { id: 'bengaluru', label: 'Bengaluru (CC)', description: 'Tech city market', type: 'CC' },
    { id: 'pune', label: 'Pune (CC)', description: 'Maharashtra hub', type: 'CC' },
    { id: 'ludhiana', label: 'Ludhiana (PB)', description: 'Punjab market', type: 'CC' },
  ],
};

export const STATE_TO_CITY = {
  namakkal: 'Namakkal', barwala: 'Barwala', chittoor: 'Chittoor',
  hospet: 'Hospet', hyderabad: 'Hyderabad', e_godavari: 'E.Godavari',
  ajmer: 'Ajmer', delhi: 'Delhi', mumbai: 'Mumbai', chennai: 'Chennai',
  kolkata: 'Kolkata', bengaluru: 'Bengaluru', pune: 'Pune', ludhiana: 'Ludhiana',
};
