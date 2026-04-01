/**
 * Risk Analysis Utilities for Egg Market
 */

export const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

export const variance = (a) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length;
};

export const stdDev = (a) => Math.sqrt(variance(a));

export const cv = (a) => {
  const m = mean(a);
  return m ? (stdDev(a) / m) * 100 : 0;
};

export function classifyStability(cvValue) {
  if (cvValue <= 5) return { level: 'Very Stable', color: '#00E676', icon: '🟢' };
  if (cvValue <= 10) return { level: 'Stable', color: '#66BB6A', icon: '🟡' };
  if (cvValue <= 15) return { level: 'Moderately Stable', color: '#FFA726', icon: '🟠' };
  if (cvValue <= 25) return { level: 'Unstable', color: '#EF5350', icon: '🔴' };
  return { level: 'Highly Volatile', color: '#D50000', icon: '⛔' };
}

export function percentageChangeShocks(prices, dates, threshold = 10) {
  const results = [];
  for (let t = 1; t < prices.length; t++) {
    const prev = prices[t - 1];
    const curr = prices[t];
    const pctChange = prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
    const isShock = Math.abs(pctChange) >= threshold;
    results.push({
      index: t, date: dates?.[t] || `Day ${t}`, price: curr, prevPrice: prev,
      pctChange, isShock, direction: pctChange > 0 ? 'spike' : pctChange < 0 ? 'drop' : 'flat',
    });
  }
  return results;
}

export function zScoreShocks(prices, dates) {
  const mu = mean(prices);
  const sigma = stdDev(prices);
  if (sigma === 0) return prices.map((p, i) => ({ index: i, date: dates?.[i] ?? `Day ${i}`, price: p, zScore: 0, severity: 'normal' }));
  return prices.map((p, i) => {
    const z = (p - mu) / sigma;
    let severity = 'normal';
    if (Math.abs(z) > 3) severity = 'severe';
    else if (Math.abs(z) > 2) severity = 'moderate';
    return { index: i, date: dates?.[i] ?? `Day ${i}`, price: p, zScore: z, severity };
  });
}

export function volatilityRiskIndex(prices) {
  const mu = mean(prices);
  const sigma = stdDev(prices);
  const raw = mu !== 0 ? sigma / mu : 0;
  const normalised = Math.min(raw * 100, 100);
  let level = 'Low', color = '#4CAF50';
  if (normalised > 20) { level = 'Extreme'; color = '#D50000'; }
  else if (normalised > 15) { level = 'High'; color = '#F44336'; }
  else if (normalised > 10) { level = 'Medium'; color = '#FF9800'; }
  else if (normalised > 5) { level = 'Low-Med'; color = '#FFC107'; }
  return { rawRisk: raw, normalisedRisk: normalised, level, color };
}

export function downsideRiskIndex(prices) {
  const mu = mean(prices);
  const n = prices.length;
  if (n === 0) return { downsideDev: 0, downsideRisk: 0, level: 'N/A', color: '#999' };
  const sumSq = prices.reduce((s, p) => {
    const diff = p - mu;
    return diff < 0 ? s + diff * diff : s;
  }, 0);
  const dd = Math.sqrt(sumSq / n);
  const risk = mu !== 0 ? (dd / mu) * 100 : 0;
  let level = 'Low', color = '#4CAF50';
  if (risk > 15) { level = 'Critical'; color = '#D50000'; }
  else if (risk > 10) { level = 'High'; color = '#F44336'; }
  else if (risk > 5) { level = 'Medium'; color = '#FF9800'; }
  return { downsideDev: dd, downsideRisk: risk, level, color };
}

export function rollingCV(prices, dates, window = 14) {
  const result = [];
  for (let i = window - 1; i < prices.length; i++) {
    const slice = prices.slice(i - window + 1, i + 1);
    result.push({ date: dates?.[i] ?? `Day ${i}`, cv: cv(slice) });
  }
  return result;
}

export function fullRiskAnalysis(state1, state2, shockThreshold = 10) {
  const buildReport = (s) => {
    const mu = mean(s.prices);
    const sigma = stdDev(s.prices);
    const v = variance(s.prices);
    const cvVal = cv(s.prices);
    const stability = classifyStability(cvVal);
    const pctShocks = percentageChangeShocks(s.prices, s.dates, shockThreshold);
    const zShocks = zScoreShocks(s.prices, s.dates);
    const volRisk = volatilityRiskIndex(s.prices);
    const dsRisk = downsideRiskIndex(s.prices);
    const rolling = rollingCV(s.prices, s.dates, 14);
    const shockSummary = {
      pctShockCount: pctShocks.filter(s => s.isShock).length,
      moderateZ: zShocks.filter(s => s.severity === 'moderate').length,
      severeZ: zShocks.filter(s => s.severity === 'severe').length,
      total: pctShocks.filter(s => s.isShock).length + zShocks.filter(s => s.severity !== 'normal').length,
    };
    return { label: s.label, mean: mu, variance: v, stdDev: sigma, cv: cvVal, stability, pctShocks, zShocks, volRisk, dsRisk, rollingCV: rolling, shockSummary };
  };
  return { state1: buildReport(state1), state2: buildReport(state2), threshold: shockThreshold };
}
