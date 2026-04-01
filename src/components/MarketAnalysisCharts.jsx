import React, { useState } from 'react';

/**
 * Dual Time-Series Chart — overlays two state price lines
 */
export const DualTimeSeriesChart = ({ dates, prices1, prices2, label1, label2, width = 860, height = 320 }) => {
    const [hover, setHover] = useState(null);
    if (!prices1.length || !prices2.length) return null;
    const all = [...prices1, ...prices2];
    const minP = Math.min(...all) * 0.96;
    const maxP = Math.max(...all) * 1.04;
    const range = maxP - minP || 1;
    const n = Math.min(prices1.length, prices2.length);
    const pad = { top: 30, right: 30, bottom: 50, left: 60 };
    const cw = width - pad.left - pad.right;
    const ch = height - pad.top - pad.bottom;
    const getX = (i) => pad.left + (i / (n - 1)) * cw;
    const getY = (p) => pad.top + ch - ((p - minP) / range) * ch;
    const line1 = prices1.slice(0, n).map((p, i) => `${getX(i)},${getY(p)}`).join(' ');
    const line2 = prices2.slice(0, n).map((p, i) => `${getX(i)},${getY(p)}`).join(' ');
    const yLabels = Array.from({ length: 6 }, (_, i) => { const v = minP + (range * i / 5); return { value: v.toFixed(2), y: getY(v) }; });
    const xStep = Math.max(1, Math.floor(n / 6));
    const xLabels = [];
    for (let i = 0; i < n; i += xStep) { xLabels.push({ label: dates[i] || `Day ${i + 1}`, x: getX(i) }); }
    return (
        <div className="ma-chart-wrapper" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="ma-chart-svg">
                <defs>
                    <linearGradient id="maGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="maGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6D00" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#FF6D00" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {yLabels.map((l, i) => (<g key={i}><line x1={pad.left} y1={l.y} x2={width - pad.right} y2={l.y} stroke="rgba(255,255,255,0.07)" strokeDasharray="4,4" /><text x={pad.left - 8} y={l.y + 4} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="end">₹{l.value}</text></g>))}
                {xLabels.map((l, i) => (<text key={i} x={l.x} y={height - 12} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">{l.label}</text>))}
                <path d={`M ${pad.left},${height - pad.bottom} L ${line1} L ${getX(n - 1)},${height - pad.bottom} Z`} fill="url(#maGrad1)" />
                <path d={`M ${pad.left},${height - pad.bottom} L ${line2} L ${getX(n - 1)},${height - pad.bottom} Z`} fill="url(#maGrad2)" />
                <polyline fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={line1} />
                <polyline fill="none" stroke="#FF6D00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={line2} />
                {prices1.slice(0, n).map((p, i) => (<circle key={`a${i}`} cx={getX(i)} cy={getY(p)} r={hover?.i === i ? '6' : '3'} fill="#00E5FF" style={{ cursor: 'pointer', transition: 'r 0.2s' }} onMouseEnter={(e) => setHover({ i, x: e.clientX, y: e.clientY, p1: p, p2: prices2[i], d: dates[i] })} onMouseMove={(e) => setHover(h => ({ ...h, x: e.clientX, y: e.clientY }))} onMouseLeave={() => setHover(null)} />))}
                {prices2.slice(0, n).map((p, i) => (<circle key={`b${i}`} cx={getX(i)} cy={getY(p)} r={hover?.i === i ? '6' : '3'} fill="#FF6D00" style={{ cursor: 'pointer', transition: 'r 0.2s' }} onMouseEnter={(e) => setHover({ i, x: e.clientX, y: e.clientY, p1: prices1[i], p2: p, d: dates[i] })} onMouseMove={(e) => setHover(h => ({ ...h, x: e.clientX, y: e.clientY }))} onMouseLeave={() => setHover(null)} />))}
                <g transform={`translate(${pad.left + 10}, ${pad.top + 5})`}>
                    <rect x="0" y="0" width="10" height="10" fill="#00E5FF" rx="2" /><text x="14" y="9" fill="white" fontSize="10">{label1}</text>
                    <rect x="130" y="0" width="10" height="10" fill="#FF6D00" rx="2" /><text x="144" y="9" fill="white" fontSize="10">{label2}</text>
                </g>
            </svg>
            {hover && (<div className="ma-tooltip" style={{ position: 'fixed', left: hover.x + 15, top: hover.y - 60, background: 'rgba(13,17,55,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px 16px', pointerEvents: 'none', zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '4px' }}>{hover.d}</div>
                <div style={{ display: 'flex', gap: '18px' }}><span style={{ color: '#00E5FF', fontWeight: 700 }}>₹{hover.p1?.toFixed(2)}</span><span style={{ color: '#FF6D00', fontWeight: 700 }}>₹{hover.p2?.toFixed(2)}</span></div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '4px' }}>Δ = ₹{Math.abs((hover.p1 || 0) - (hover.p2 || 0)).toFixed(2)}</div>
            </div>)}
        </div>
    );
};

/**
 * Variance Comparison Bar Chart
 */
export const VarianceComparisonChart = ({ stats1, stats2, width = 420, height = 280 }) => {
    const [hover, setHover] = useState(null);
    const metrics = [
        { key: 'mean', label: 'Mean (μ)', v1: stats1.mean, v2: stats2.mean, unit: '₹' },
        { key: 'variance', label: 'Var (σ²)', v1: stats1.variance, v2: stats2.variance, unit: '' },
        { key: 'stdDev', label: 'Std Dev (σ)', v1: stats1.stdDev, v2: stats2.stdDev, unit: '₹' },
        { key: 'cv', label: 'CV (%)', v1: stats1.cv, v2: stats2.cv, unit: '%' },
    ];
    const maxVal = Math.max(...metrics.map(m => Math.max(m.v1, m.v2)));
    const pad = { top: 30, right: 20, bottom: 50, left: 70 };
    const cw = width - pad.left - pad.right;
    const ch = height - pad.top - pad.bottom;
    const groupH = ch / metrics.length;
    const barH = groupH * 0.3;
    return (
        <div className="ma-chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="ma-chart-svg">
                {metrics.map((m, i) => {
                    const y = pad.top + i * groupH;
                    const w1 = maxVal > 0 ? (m.v1 / maxVal) * cw : 0;
                    const w2 = maxVal > 0 ? (m.v2 / maxVal) * cw : 0;
                    return (<g key={m.key}>
                        <text x={pad.left - 8} y={y + groupH / 2 + 4} fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="end">{m.label}</text>
                        <rect x={pad.left} y={y + groupH / 2 - barH - 2} width={w1} height={barH} fill="#00E5FF" rx="4" opacity={hover === `${m.key}-1` ? 1 : 0.8} style={{ transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={() => setHover(`${m.key}-1`)} onMouseLeave={() => setHover(null)} />
                        <text x={pad.left + w1 + 6} y={y + groupH / 2 - barH / 2 + 2} fill="#00E5FF" fontSize="10" fontWeight="600">{m.unit === '₹' ? `₹${m.v1.toFixed(2)}` : m.v1.toFixed(2)}{m.unit === '%' ? '%' : ''}</text>
                        <rect x={pad.left} y={y + groupH / 2 + 2} width={w2} height={barH} fill="#FF6D00" rx="4" opacity={hover === `${m.key}-2` ? 1 : 0.8} style={{ transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={() => setHover(`${m.key}-2`)} onMouseLeave={() => setHover(null)} />
                        <text x={pad.left + w2 + 6} y={y + groupH / 2 + barH / 2 + 6} fill="#FF6D00" fontSize="10" fontWeight="600">{m.unit === '₹' ? `₹${m.v2.toFixed(2)}` : m.v2.toFixed(2)}{m.unit === '%' ? '%' : ''}</text>
                        {i < metrics.length - 1 && (<line x1={pad.left} y1={y + groupH} x2={width - pad.right} y2={y + groupH} stroke="rgba(255,255,255,0.06)" />)}
                    </g>);
                })}
                <g transform={`translate(${pad.left}, ${height - 18})`}>
                    <rect x="0" y="0" width="10" height="10" fill="#00E5FF" rx="2" /><text x="14" y="9" fill="white" fontSize="9">{stats1.label}</text>
                    <rect x="130" y="0" width="10" height="10" fill="#FF6D00" rx="2" /><text x="144" y="9" fill="white" fontSize="9">{stats2.label}</text>
                </g>
            </svg>
        </div>
    );
};

/**
 * Dispersion Timeline — bar chart of |P₁ − P₂| over time
 */
export const DispersionTimeline = ({ dispersion, dates, width = 860, height = 220 }) => {
    const [hover, setHover] = useState(null);
    if (!dispersion || dispersion.length === 0) return null;
    const maxD = Math.max(...dispersion) * 1.1 || 1;
    const pad = { top: 25, right: 20, bottom: 45, left: 55 };
    const cw = width - pad.left - pad.right;
    const ch = height - pad.top - pad.bottom;
    const barW = Math.max(2, (cw / dispersion.length) - 2);
    const getX = (i) => pad.left + (i / dispersion.length) * cw;
    const getH = (v) => (v / maxD) * ch;
    const meanD = dispersion.reduce((s, v) => s + v, 0) / dispersion.length;
    return (
        <div className="ma-chart-wrapper" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="ma-chart-svg">
                <line x1={pad.left} y1={pad.top + ch - getH(meanD)} x2={width - pad.right} y2={pad.top + ch - getH(meanD)} stroke="#FFD700" strokeDasharray="6,4" strokeWidth="1.5" />
                <text x={width - pad.right + 4} y={pad.top + ch - getH(meanD) + 4} fill="#FFD700" fontSize="9">μ={meanD.toFixed(2)}</text>
                {dispersion.map((d, i) => {
                    const barHeight = getH(d);
                    const x = getX(i);
                    const intensity = d / maxD;
                    const color = `hsl(${120 - intensity * 120}, 80%, 55%)`;
                    return (<g key={i}><rect x={x} y={pad.top + ch - barHeight} width={barW} height={barHeight} fill={color} rx="2" opacity={hover === i ? 1 : 0.75} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} /></g>);
                })}
                {dates && dates.filter((_, i) => i % Math.max(1, Math.floor(dates.length / 7)) === 0).map((d, i) => {
                    const idx = dates.indexOf(d);
                    return (<text key={i} x={getX(idx) + barW / 2} y={height - 10} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="middle">{d}</text>);
                })}
                <text x={10} y={pad.top + ch / 2} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" transform={`rotate(-90, 10, ${pad.top + ch / 2})`}>|P₁ − P₂|</text>
            </svg>
            {hover !== null && (<div className="ma-tooltip" style={{ position: 'absolute', left: getX(hover) + barW + 5, top: 20, background: 'rgba(13,17,55,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 14px', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>{dates?.[hover]}</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>Δ ₹{dispersion[hover]?.toFixed(2)}</div>
            </div>)}
        </div>
    );
};

/**
 * Scatter Plot with Regression Line
 */
export const ScatterRegressionPlot = ({ prices1, prices2, regression, label1, label2, width = 400, height = 350 }) => {
    const [hover, setHover] = useState(null);
    if (!prices1.length || !prices2.length) return null;
    const n = Math.min(prices1.length, prices2.length);
    const allX = prices1.slice(0, n);
    const allY = prices2.slice(0, n);
    const minX = Math.min(...allX) * 0.96, maxX = Math.max(...allX) * 1.04;
    const minY = Math.min(...allY) * 0.96, maxY = Math.max(...allY) * 1.04;
    const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
    const pad = { top: 30, right: 20, bottom: 50, left: 55 };
    const cw = width - pad.left - pad.right, ch = height - pad.top - pad.bottom;
    const gx = (v) => pad.left + ((v - minX) / rangeX) * cw;
    const gy = (v) => pad.top + ch - ((v - minY) / rangeY) * ch;
    const rx1 = minX, ry1 = regression.alpha + regression.beta * rx1;
    const rx2 = maxX, ry2 = regression.alpha + regression.beta * rx2;
    return (
        <div className="ma-chart-wrapper" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="ma-chart-svg">
                {Array.from({ length: 5 }, (_, i) => { const v = minY + (rangeY * (i + 1) / 5); return <line key={i} x1={pad.left} y1={gy(v)} x2={width - pad.right} y2={gy(v)} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />; })}
                <line x1={gx(rx1)} y1={gy(Math.max(minY, Math.min(maxY, ry1)))} x2={gx(rx2)} y2={gy(Math.max(minY, Math.min(maxY, ry2)))} stroke="#FFD700" strokeWidth="2" strokeDasharray="6,3" />
                {allX.map((x, i) => (<circle key={i} cx={gx(x)} cy={gy(allY[i])} r={hover === i ? '7' : '5'} fill="rgba(0,229,255,0.8)" stroke="#00E5FF" strokeWidth="1.5" style={{ cursor: 'pointer', transition: 'r 0.2s' }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />))}
                <text x={pad.left + cw / 2} y={height - 8} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">{label1} Price (₹)</text>
                <text x={12} y={pad.top + ch / 2} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle" transform={`rotate(-90, 12, ${pad.top + ch / 2})`}>{label2} Price (₹)</text>
                <text x={width - pad.right - 5} y={pad.top + 15} fill="#FFD700" fontSize="9" textAnchor="end">{regression.equation}</text>
                <text x={width - pad.right - 5} y={pad.top + 28} fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="end">R² = {regression.rSquared.toFixed(4)}</text>
            </svg>
            {hover !== null && (<div className="ma-tooltip" style={{ position: 'absolute', right: 10, top: 50, background: 'rgba(13,17,55,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 14px', pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                <div style={{ color: '#00E5FF', fontSize: '12px' }}>{label1}: ₹{allX[hover]?.toFixed(2)}</div>
                <div style={{ color: '#FF6D00', fontSize: '12px' }}>{label2}: ₹{allY[hover]?.toFixed(2)}</div>
            </div>)}
        </div>
    );
};

/**
 * Animated Correlation Gauge
 */
export const CorrelationGauge = ({ r, size = 180 }) => {
    const normalizedR = Math.max(-1, Math.min(1, r));
    const absR = Math.abs(normalizedR);
    let color = '#F44336', label = 'Weak';
    if (absR >= 0.8) { color = '#4CAF50'; label = 'Strong'; }
    else if (absR >= 0.5) { color = '#FF9800'; label = 'Moderate'; }
    const cx = size / 2, cy = size / 2 + 10, radius = size / 2 - 20;
    const describeArc = (start, end) => {
        const s = (start * Math.PI) / 180, e = (end * Math.PI) / 180;
        const x1 = cx + radius * Math.cos(s), y1 = cy + radius * Math.sin(s);
        const x2 = cx + radius * Math.cos(e), y2 = cy + radius * Math.sin(e);
        const large = end - start > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
    };
    const needleAngle = ((normalizedR + 1) / 2) * 180 + 180;
    const needleRad = (needleAngle * Math.PI) / 180;
    const nx = cx + (radius - 10) * Math.cos(needleRad);
    const ny = cy + (radius - 10) * Math.sin(needleRad);
    return (
        <div className="correlation-gauge" style={{ textAlign: 'center' }}>
            <svg viewBox={`0 0 ${size} ${size * 0.65}`} width={size} height={size * 0.65}>
                <path d={describeArc(-180, 0)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
                <path d={describeArc(-180, -120)} fill="none" stroke="#F44336" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
                <path d={describeArc(-120, -60)} fill="none" stroke="#FF9800" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
                <path d={describeArc(-60, 0)} fill="none" stroke="#4CAF50" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="3" strokeLinecap="round" style={{ transition: 'all 0.8s ease', filter: `drop-shadow(0 0 4px ${color})` }} />
                <circle cx={cx} cy={cy} r="5" fill={color} />
                <text x={20} y={cy + 18} fill="rgba(255,255,255,0.4)" fontSize="8">-1</text>
                <text x={cx} y={cy - radius - 5} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">0</text>
                <text x={size - 20} y={cy + 18} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end">+1</text>
            </svg>
            <div style={{ marginTop: '-10px' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{normalizedR.toFixed(4)}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label} Correlation</div>
            </div>
        </div>
    );
};
