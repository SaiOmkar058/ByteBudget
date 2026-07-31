import React from 'react';

/**
 * BudgetGauge — 50/30/20 Rule Circular Ring Visualizer
 *
 * Renders three concentric SVG rings for Needs (50%), Wants (30%),
 * and Savings (20%). Handles divide-by-zero if totalIncome === 0.
 */

const RULES = [
  { key: 'needs',   label: 'Needs',    target: 0.50, color: '#ef4444', track: 'rgba(239,68,68,0.12)',  icon: '🏠' },
  { key: 'wants',   label: 'Wants',    target: 0.30, color: '#f59e0b', track: 'rgba(245,158,11,0.12)', icon: '🎬' },
  { key: 'savings', label: 'Savings',  target: 0.20, color: '#10b981', track: 'rgba(16,185,129,0.12)', icon: '💰' },
];

function Ring({ cx, cy, r, strokeWidth, trackColor, fillColor, percent, label, animate }) {
  const circumference = 2 * Math.PI * r;
  const fillOffset = circumference * (1 - Math.min(percent / 100, 1));
  return (
    <g>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      {/* Fill */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={fillColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={fillOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </g>
  );
}

const BudgetGauge = ({ transactions = [] }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthTxns
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // ── Divide-by-zero guard ────────────────────────────────────────
  // If no income is recorded this month, show expense breakdown only
  const hasIncome = totalIncome > 0;

  const needsSpent = monthTxns
    .filter((t) => t.type === 'expense' && t.budgetCategory === 'Need')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const wantsSpent = monthTxns
    .filter((t) => t.type === 'expense' && t.budgetCategory === 'Want')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const savingsSpent = monthTxns
    .filter((t) => t.type === 'expense' && t.budgetCategory === 'Savings/Investment')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = monthTxns
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const base = hasIncome ? totalIncome : (totalExpenses > 0 ? totalExpenses : 1);

  const spentMap = {
    needs:   needsSpent,
    wants:   wantsSpent,
    savings: savingsSpent,
  };

  const targetMap = {
    needs:   base * 0.50,
    wants:   base * 0.30,
    savings: base * 0.20,
  };

  const percentMap = {
    needs:   hasIncome ? (needsSpent / targetMap.needs) * 100 : 0,
    wants:   hasIncome ? (wantsSpent / targetMap.wants) * 100 : 0,
    savings: hasIncome ? (savingsSpent / targetMap.savings) * 100 : 0,
  };

  // SVG ring config
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const rings = [
    { r: 88, strokeWidth: 16 },
    { r: 66, strokeWidth: 16 },
    { r: 44, strokeWidth: 16 },
  ];

  return (
    <div className="budget-gauge-card">
      <div className="budget-gauge-header">
        <h3 className="budget-gauge-title">50 · 30 · 20 Budget Rule</h3>
        {!hasIncome && (
          <span className="budget-gauge-no-income-badge">No income logged this month</span>
        )}
      </div>

      <div className="budget-gauge-body">
        {/* SVG Rings */}
        <div className="budget-gauge-svg-wrap">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {RULES.map((rule, i) => (
              <Ring
                key={rule.key}
                cx={cx}
                cy={cy}
                r={rings[i].r}
                strokeWidth={rings[i].strokeWidth}
                trackColor={rule.track}
                fillColor={rule.color}
                percent={percentMap[rule.key]}
              />
            ))}
            {/* Center label */}
            <text x={cx} y={cy - 10} textAnchor="middle" className="gauge-center-label">
              {hasIncome ? `₹${totalIncome.toLocaleString('en-IN')}` : '—'}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" className="gauge-center-sub">
              {hasIncome ? 'This Month' : 'No Income'}
            </text>
          </svg>
        </div>

        {/* Breakdown list */}
        <div className="budget-gauge-breakdown">
          {RULES.map((rule) => {
            const pct = Math.min(percentMap[rule.key], 999);
            const spent = spentMap[rule.key];
            const target = targetMap[rule.key];
            const isOver = pct > 100;
            return (
              <div key={rule.key} className="gauge-row">
                <div className="gauge-row-left">
                  <span className="gauge-dot" style={{ background: rule.color }} />
                  <div>
                    <p className="gauge-row-label">{rule.icon} {rule.label}</p>
                    <p className="gauge-row-sub">
                      ₹{spent.toLocaleString('en-IN')} / ₹{Math.round(target).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="gauge-row-right">
                  <span
                    className="gauge-pct-badge"
                    style={{
                      background: isOver ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                      color: isOver ? '#ef4444' : '#10b981',
                    }}
                  >
                    {hasIncome ? `${pct.toFixed(0)}%` : '—'}
                  </span>
                  {isOver && hasIncome && (
                    <span className="gauge-over-tag">Over!</span>
                  )}
                </div>
              </div>
            );
          })}

          {!hasIncome && (
            <p className="gauge-tip">
              💡 Log income for this month to see your 50/30/20 budget breakdown.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetGauge;
