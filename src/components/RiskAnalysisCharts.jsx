import React, { useState } from 'react';

/* ───────────────────────────────────────────────────────────────────
   Price Time-Series with Shock Highlights
   ─────────────────────────────────────────────────────────────────── */
export const ShockTimeSeriesChart = ({
    prices, dates, zShocks, pctShocks, label, accentColor = '#00E5FF',
    width = 860, height = 300,
}) => {
    const [hover, setHover] = useState(null);
    if (!prices || !prices.length) return null;
    const minP = Math.min(...prices) * 0.96, maxP = Math.max(...prices) * 1.04;
    const range = maxP - minP || 1, n = prices.length;
    const pad = { top: 28, right: 25, bottom: 45, left: 58 };
    const cw = width - pad.left - pad.right, ch = height - pad.top - pad.bottom;
    const gx = (i) => pad.left + (i / (n - 1)) * cw;
    const gy = (p) => pad.top + ch - ((p - minP) / range) * ch;
    const line = prices.map((p, i) => `${gx(i)},${gy(p)}`).join(' ');
    const yLabels = Array.from({ length: 6 }, (_, i) => { const v = minP + (range * i / 5); return { value: v.toFixed(2), y: gy(v) }; });
    const mu = prices.reduce((s, v) => s + v, 0) / n;
    const sigma = Math.sqrt(prices.reduce((s, v) => s + (v - mu) ** 2, 0) / n);
    return (
        <div className="ra-chart-wrap" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="ra-chart-svg">
                <defs>
                    <linearGradient id={`raGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={accentColor} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <rect x={pad.left} y={gy(mu + 2 * sigma)} width={cw} height={Math.abs(gy(mu - 2 * sigma) - gy(mu + 2 * sigma))} fill="rgba(255,152,0,0.06)" />
                {yLabels.map((l, i) => (<g key={i}><line x1={pad.left} y1={l.y} x2={width - pad.right} y2={l.y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" /><text x={pad.left - 6} y={l.y + 4} fill="rgba(255,255,255,0.45)" fontSize="9" textAnchor="end">₹{l.value}</text></g>))}
                <line x1={pad.left} y1={gy(mu)} x2={width - pad.right} y2={gy(mu)} stroke="#FFD700" strokeDasharray="6,4" strokeWidth="1" />
                <text x={width - pad.right + 3} y={gy(mu) + 3} fill="#FFD700" fontSize="8">μ</text>
                <path d={`M ${pad.left},${height - pad.bottom} L ${line} L ${gx(n - 1)},${height - pad.bottom} Z`} fill={`url(#raGrad-${label})`} />
                <polyline fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={line} />
                {zShocks && zShocks.map((s, i) => {
                    if (s.severity === 'normal') return null;
                    const color = s.severity === 'severe' ? '#F44336' : '#FF9800';
                    return (<g key={`z${i}`}><circle cx={gx(s.index)} cy={gy(s.price)} r="7" fill="none" stroke={color} strokeWidth="2" opacity="0.9" /><circle cx={gx(s.index)} cy={gy(s.price)} r="3" fill={color} /></g>);
                })}
                {pctShocks && pctShocks.map((s, i) => {
                    if (!s.isShock) return null;
                    const color = s.direction === 'spike' ? '#00E676' : '#F44336';
                    return (<polygon key={`p${i}`} points={s.direction === 'spike' ? `${gx(s.index)},${gy(s.price) - 14} ${gx(s.index) - 5},${gy(s.price) - 6} ${gx(s.index) + 5},${gy(s.price) - 6}` : `${gx(s.index)},${gy(s.price) + 14} ${gx(s.index) - 5},${gy(s.price) + 6} ${gx(s.index) + 5},${gy(s.price) + 6}`} fill={color} opacity="0.8" />);
                })}
                {prices.map((p, i) => (<circle key={i} cx={gx(i)} cy={gy(p)} r={hover === i ? '5' : '2'} fill={accentColor} style={{ cursor: 'pointer', transition: 'r 0.15s' }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />))}
                {dates && dates.filter((_, i) => i % Math.max(1, Math.floor(n / 7)) === 0).map((d, idx) => {
                    const origIdx = dates.indexOf(d);
                    return (<text key={idx} x={gx(origIdx)} y={height - 10} fill="rgba(255,255,255,0.45)" fontSize="8" textAnchor="middle">{d}</text>);
                })}
                <g transform={`translate(${pad.left + 5}, ${pad.top + 2})`}>
                    <circle cx="4" cy="4" r="4" fill={accentColor} /><text x="12" y="8" fill="white" fontSize="9">{label}</text>
                    <circle cx="110" cy="4" r="4" fill="none" stroke="#F44336" strokeWidth="2" /><text x="118" y="8" fill="rgba(255,255,255,0.6)" fontSize="8">Z-Shock</text>
                    <polygon points="170,0 165,8 175,8" fill="#00E676" opacity="0.8" /><text x="180" y="8" fill="rgba(255,255,255,0.6)" fontSize="8">%Shock</text>
                </g>
            </svg>
            {hover !== null && (<div className="ra-tooltip" style={{ position: 'absolute', left: Math.min(gx(hover) + 10, width - 180), top: 10, background: 'rgba(13,17,55,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 14px', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>{dates?.[hover]}</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>₹{prices[hover]?.toFixed(2)}</div>
                {zShocks?.[hover] && (<div style={{ color: zShocks[hover].severity !== 'normal' ? '#F44336' : 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Z = {zShocks[hover].zScore.toFixed(2)} ({zShocks[hover].severity})</div>)}
            </div>)}
        </div>
    );
};

/* ───────────────────────────────────────────────────────────────────
   Z-Score Distribution Bar Chart
   ─────────────────────────────────────────────────────────────────── */
export const ZScoreBarChart = ({ zShocks, label, width = 860, height = 200 }) => {
    const [hover, setHover] = useState(null);
    if (!zShocks || !zShocks.length) return null;
    const maxZ = Math.max(3.5, Math.max(...zShocks.map(s => Math.abs(s.zScore)))) * 1.1;
    const pad = { top: 20, right: 20, bottom: 35, left: 50 };
    const cw = width - pad.left - pad.right, ch = height - pad.top - pad.bottom;
    const zeroY = pad.top + ch / 2, barW = Math.max(1.5, cw / zShocks.length - 1);
    const gx = (i) => pad.left + (i / zShocks.length) * cw;
    const getH = (z) => (Math.abs(z) / maxZ) * (ch / 2);
    return (
        <div className="ra-chart-wrap">
            <svg viewBox={`0 0 ${width} ${height}`} className="ra-chart-svg">
                {[2, -2, 3, -3].map(z => {
                    const y = zeroY - (z / maxZ) * (ch / 2);
                    const color = Math.abs(z) === 3 ? '#F44336' : '#FF9800';
                    return (<g key={z}><line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke={color} strokeDasharray="4,3" strokeWidth="1" opacity="0.5" /><text x={pad.left - 4} y={y + 3} fill={color} fontSize="8" textAnchor="end">{z > 0 ? '+' : ''}{z}σ</text></g>);
                })}
                <line x1={pad.left} y1={zeroY} x2={width - pad.right} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                {zShocks.map((s, i) => {
                    const h = getH(s.zScore), isUp = s.zScore >= 0;
                    const color = s.severity === 'severe' ? '#F44336' : s.severity === 'moderate' ? '#FF9800' : 'rgba(0,229,255,0.5)';
                    return (<rect key={i} x={gx(i)} y={isUp ? zeroY - h : zeroY} width={barW} height={h} fill={color} rx="1" opacity={hover === i ? 1 : 0.7} style={{ cursor: 'pointer', transition: 'opacity 0.15s' }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />);
                })}
            </svg>
        </div>
    );
};

/* ───────────────────────────────────────────────────────────────────
   Risk Gauge (semicircle)
   ─────────────────────────────────────────────────────────────────── */
export const RiskGauge = ({ value, maxVal = 25, label, color, size = 160 }) => {
    const clamped = Math.min(value, maxVal), pct = clamped / maxVal;
    const cx = size / 2, cy = size / 2 + 10, r = size / 2 - 18;
    const needleAngle = 180 + pct * 180, rad = (needleAngle * Math.PI) / 180;
    const nx = cx + (r - 8) * Math.cos(rad), ny = cy + (r - 8) * Math.sin(rad);
    const arcPath = (start, end) => {
        const s = (start * Math.PI) / 180, e = (end * Math.PI) / 180;
        const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
        const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
        return `M ${x1} ${y1} A ${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${x2} ${y2}`;
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <svg viewBox={`0 0 ${size} ${size * 0.62}`} width={size} height={size * 0.62}>
                <path d={arcPath(-180, 0)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
                <path d={arcPath(-180, -144)} fill="none" stroke="#4CAF50" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
                <path d={arcPath(-144, -108)} fill="none" stroke="#FFC107" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
                <path d={arcPath(-108, -72)} fill="none" stroke="#FF9800" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
                <path d={arcPath(-72, -36)} fill="none" stroke="#F44336" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
                <path d={arcPath(-36, 0)} fill="none" stroke="#D50000" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.6s ease', filter: `drop-shadow(0 0 4px ${color})` }} />
                <circle cx={cx} cy={cy} r="4" fill={color} />
                <text x={18} y={cy + 16} fill="rgba(255,255,255,0.35)" fontSize="7">0</text>
                <text x={size - 18} y={cy + 16} fill="rgba(255,255,255,0.35)" fontSize="7" textAnchor="end">{maxVal}</text>
            </svg>
            <div style={{ marginTop: '-8px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value.toFixed(2)}%</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            </div>
        </div>
    );
};

/* ───────────────────────────────────────────────────────────────────
   Rolling CV Timeline
   ─────────────────────────────────────────────────────────────────── */
export const RollingCVChart = ({ rolling1, rolling2, label1, label2, width = 860, height = 220 }) => {
    const [hover, setHover] = useState(null);
    if (!rolling1?.length) return null;
    const allCV = [...rolling1.map(r => r.cv), ...(rolling2?.map(r => r.cv) || [])];
    const maxCV = Math.max(...allCV) * 1.15 || 10, n = rolling1.length;
    const pad = { top: 22, right: 20, bottom: 38, left: 50 };
    const cw = width - pad.left - pad.right, ch = height - pad.top - pad.bottom;
    const gx = (i) => pad.left + (i / (n - 1)) * cw;
    const gy = (v) => pad.top + ch - (v / maxCV) * ch;
    const line1 = rolling1.map((r, i) => `${gx(i)},${gy(r.cv)}`).join(' ');
    const line2 = rolling2 ? rolling2.slice(0, n).map((r, i) => `${gx(i)},${gy(r.cv)}`).join(' ') : '';
    return (
        <div className="ra-chart-wrap" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="ra-chart-svg">
                <rect x={pad.left} y={gy(15)} width={cw} height={gy(10) - gy(15)} fill="rgba(255,152,0,0.06)" />
                <rect x={pad.left} y={gy(maxCV)} width={cw} height={gy(15) - gy(maxCV)} fill="rgba(244,67,54,0.06)" />
                {[5, 10, 15].filter(v => v < maxCV).map(v => (<g key={v}><line x1={pad.left} y1={gy(v)} x2={width - pad.right} y2={gy(v)} stroke="rgba(255,255,255,0.07)" strokeDasharray="3,3" /><text x={pad.left - 5} y={gy(v) + 3} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end">{v}%</text></g>))}
                <polyline fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={line1} />
                {line2 && <polyline fill="none" stroke="#FF6D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={line2} />}
                <g transform={`translate(${pad.left + 5}, ${pad.top + 2})`}>
                    <rect x="0" y="0" width="8" height="8" fill="#00E5FF" rx="2" /><text x="12" y="8" fill="white" fontSize="9">{label1}</text>
                    {label2 && <><rect x="110" y="0" width="8" height="8" fill="#FF6D00" rx="2" /><text x="122" y="8" fill="white" fontSize="9">{label2}</text></>}
                </g>
                {rolling1.filter((_, i) => i % Math.max(1, Math.floor(n / 6)) === 0).map((r, idx) => {
                    const origIdx = rolling1.indexOf(r);
                    return (<text key={idx} x={gx(origIdx)} y={height - 8} fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle">{r.date}</text>);
                })}
            </svg>
        </div>
    );
};

/* ───────────────────────────────────────────────────────────────────
   Comparative Risk Bars
   ─────────────────────────────────────────────────────────────────── */
export const ComparativeRiskBars = ({ report1, report2, width = 420, height = 300 }) => {
    if (!report1) return null;
    const metrics = [
        { key: 'cv', label: 'CV (%)', v1: report1.cv, v2: report2?.cv || 0 },
        { key: 'volRisk', label: 'Volatility Risk', v1: report1.volRisk.normalisedRisk, v2: report2?.volRisk.normalisedRisk || 0 },
        { key: 'dsRisk', label: 'Downside Risk', v1: report1.dsRisk.downsideRisk, v2: report2?.dsRisk.downsideRisk || 0 },
        { key: 'pctShocks', label: '% Shocks', v1: report1.shockSummary.pctShockCount, v2: report2?.shockSummary.pctShockCount || 0 },
        { key: 'zModerate', label: 'Z Moderate', v1: report1.shockSummary.moderateZ, v2: report2?.shockSummary.moderateZ || 0 },
        { key: 'zSevere', label: 'Z Severe', v1: report1.shockSummary.severeZ, v2: report2?.shockSummary.severeZ || 0 },
    ];
    const maxVal = Math.max(...metrics.map(m => Math.max(m.v1, m.v2)), 1);
    const pad = { top: 20, right: 20, bottom: 40, left: 90 };
    const cw = width - pad.left - pad.right, ch = height - pad.top - pad.bottom;
    const groupH = ch / metrics.length, barH = groupH * 0.28;
    return (
        <div className="ra-chart-wrap">
            <svg viewBox={`0 0 ${width} ${height}`} className="ra-chart-svg">
                {metrics.map((m, i) => {
                    const y = pad.top + i * groupH;
                    const w1 = maxVal > 0 ? (m.v1 / maxVal) * cw : 0;
                    const w2 = maxVal > 0 ? (m.v2 / maxVal) * cw : 0;
                    return (<g key={m.key}>
                        <text x={pad.left - 6} y={y + groupH / 2 + 3} fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="end">{m.label}</text>
                        <rect x={pad.left} y={y + groupH / 2 - barH - 2} width={w1} height={barH} fill="#00E5FF" rx="3" opacity="0.8" />
                        <text x={pad.left + w1 + 4} y={y + groupH / 2 - barH / 2 + 2} fill="#00E5FF" fontSize="9" fontWeight="600">{m.v1 % 1 === 0 ? m.v1 : m.v1.toFixed(2)}</text>
                        <rect x={pad.left} y={y + groupH / 2 + 2} width={w2} height={barH} fill="#FF6D00" rx="3" opacity="0.8" />
                        <text x={pad.left + w2 + 4} y={y + groupH / 2 + barH / 2 + 6} fill="#FF6D00" fontSize="9" fontWeight="600">{m.v2 % 1 === 0 ? m.v2 : m.v2.toFixed(2)}</text>
                        {i < metrics.length - 1 && (<line x1={pad.left} y1={y + groupH} x2={width - pad.right} y2={y + groupH} stroke="rgba(255,255,255,0.05)" />)}
                    </g>);
                })}
                <g transform={`translate(${pad.left}, ${height - 14})`}>
                    <rect x="0" y="0" width="8" height="8" fill="#00E5FF" rx="2" /><text x="12" y="8" fill="white" fontSize="8">{report1.label}</text>
                    {report2 && <><rect x="120" y="0" width="8" height="8" fill="#FF6D00" rx="2" /><text x="132" y="8" fill="white" fontSize="8">{report2.label}</text></>}
                </g>
            </svg>
        </div>
    );
};
