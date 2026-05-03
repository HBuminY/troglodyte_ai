'use client';

import React, { useState } from "react";
import { calculateEstimatedDCCost } from "@/app/profile/dashboard/actions";
import { ChevronUp, ChevronDown, Server, Leaf, DollarSign } from "lucide-react";

interface NeonDataTableProps {
  data: any[];
  title?: string;
  isDC?: boolean;
  currency?: any;
  color?: 'cyan' | 'green' | 'blue' | 'purple' | 'pink';
}

const colorMap = {
  cyan:   { accent: '#00ffcc', muted: 'rgba(0,255,204,0.15)', border: 'rgba(0,255,204,0.2)',  header: 'rgba(0,255,204,0.05)'  },
  green:  { accent: '#00ff88', muted: 'rgba(0,255,136,0.15)', border: 'rgba(0,255,136,0.2)',  header: 'rgba(0,255,136,0.05)'  },
  blue:   { accent: '#00c8ff', muted: 'rgba(0,200,255,0.15)', border: 'rgba(0,200,255,0.2)',  header: 'rgba(0,200,255,0.05)'  },
  purple: { accent: '#b300ff', muted: 'rgba(179,0,255,0.15)', border: 'rgba(179,0,255,0.2)', header: 'rgba(179,0,255,0.05)'  },
  pink:   { accent: '#ff00aa', muted: 'rgba(255,0,170,0.15)', border: 'rgba(255,0,170,0.2)',  header: 'rgba(255,0,170,0.05)'  },
};

const excludedFields = ["id", "createdAt", "updatedAt"];
const priority = ["name", "carbonFootprintMt", "carbonOffsetMt"];

const formatValue = (val: any): string => {
  if (val === null || val === undefined) return '—';
  if (val instanceof Date) return val.toLocaleDateString();
  if (typeof val === 'object') return JSON.stringify(val);
  if (typeof val === 'number') {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val);
  }
  return String(val);
};

const formatHeader = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
     .replace(/^./, s => s.toUpperCase());

export function NeonDataTable({ data, title, isDC, currency, color = 'cyan' }: NeonDataTableProps) {
  const c = colorMap[color];
  const [costs, setCosts] = useState<Record<number, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; visible: boolean }>({
    text: '', x: 0, y: 0, visible: false,
  });

  if (!data || data.length === 0) {
    return (
      <div className="neon-card p-8 text-center">
        <p className="font-mono-tech text-xs opacity-40">NO DATA AVAILABLE</p>
      </div>
    );
  }

  let headers = Object.keys(data[0]).filter(k => !excludedFields.includes(k));
  headers.sort((a, b) => {
    const ia = priority.indexOf(a), ib = priority.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1; if (ib !== -1) return 1; return 0;
  });

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number')
          return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      })
    : data;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="space-y-3" style={{ '--c-accent': c.accent } as React.CSSProperties}>
      {/* Header */}
      {title && (
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md" style={{ background: c.header, border: `1px solid ${c.border}` }}>
            {isDC ? <Server size={13} style={{ color: c.accent }} /> : <Leaf size={13} style={{ color: c.accent }} />}
          </div>
          <h2 className="font-orbitron text-sm font-bold tracking-widest" style={{ color: c.accent, textShadow: `0 0 10px ${c.accent}` }}>
            {title}
          </h2>
          <span className="font-mono-tech text-[10px] opacity-30">[ {data.length} records ]</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.muted}` }}>
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '420px' }}>
          <table className="w-full border-collapse">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0a0f16' }}>
              <tr>
                <th style={{
                  padding: '10px 14px', color: c.accent, fontFamily: "'Orbitron', sans-serif",
                  fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                  borderBottom: `1px solid ${c.border}`, background: c.header, textAlign: 'left',
                  whiteSpace: 'nowrap', width: '40px',
                }}>#</th>
                {headers.map(h => (
                  <th key={h}
                    onClick={() => handleSort(h)}
                    style={{
                      padding: '10px 14px', color: c.accent, fontFamily: "'Orbitron', sans-serif",
                      fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                      borderBottom: `1px solid ${c.border}`, background: c.header, textAlign: 'left',
                      whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
                    }}>
                    <span className="flex items-center gap-1">
                      {formatHeader(h)}
                      {sortKey === h
                        ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)
                        : <ChevronUp size={10} style={{ opacity: 0.2 }} />}
                    </span>
                  </th>
                ))}
                {isDC && <th style={{
                  padding: '10px 14px', color: c.accent, fontFamily: "'Orbitron', sans-serif",
                  fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                  borderBottom: `1px solid ${c.border}`, background: c.header, textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}>Est. Annual Cost</th>}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onMouseEnter={async () => {
                    setHoveredRow(rowIndex);
                    if (isDC && !costs[rowIndex]) {
                      try {
                        const res = await calculateEstimatedDCCost(row, currency?.buying ? parseFloat(currency.buying) : 45.14);
                        setCosts(prev => ({ ...prev, [rowIndex]: `${formatValue(res.annualCostTRY)} TRY` }));
                      } catch { }
                    }
                  }}
                  onMouseMove={e => {
                    const val = row[headers[0]];
                    let text = typeof val === 'object' ? JSON.stringify(val) : String(formatValue(val) ?? '');
                    if (isDC && costs[rowIndex]) text += ` — ${costs[rowIndex]}`;
                    setTooltip({ text, x: e.clientX, y: e.clientY, visible: true });
                  }}
                  onMouseLeave={() => { setHoveredRow(null); setTooltip(t => ({ ...t, visible: false })); }}
                  style={{
                    background: hoveredRow === rowIndex ? c.muted.replace('0.15', '0.06') : 'transparent',
                    transition: 'background 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <td style={{
                    padding: '9px 14px', borderBottom: `1px solid ${c.border.replace('0.2', '0.06')}`,
                    fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem',
                    color: `${c.accent}44`,
                  }}>{rowIndex + 1}</td>
                  {headers.map(header => {
                    const value = row[header];
                    const isCarbonField = header === 'carbonFootprintMt' || header === 'carbonOffsetMt';
                    const num = typeof value === 'number' ? value : null;
                    let cellColor = hoveredRow === rowIndex ? c.accent : 'rgba(180,220,220,0.8)';
                    if (isCarbonField && num !== null) {
                      cellColor = header === 'carbonFootprintMt'
                        ? (num > 1 ? '#ff00aa' : num > 0.3 ? '#ff9900' : '#00ff88')
                        : (num > 0.5 ? '#00ff88' : '#00c8ff');
                    }
                    return (
                      <td key={`${rowIndex}-${header}`} style={{
                        padding: '9px 14px', borderBottom: `1px solid ${c.border.replace('0.2', '0.06')}`,
                        fontFamily: "'Share Tech Mono', monospace", fontSize: '0.75rem',
                        color: cellColor, transition: 'color 0.2s ease', whiteSpace: 'nowrap',
                      }}>
                        {isCarbonField && num !== null ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cellColor, boxShadow: `0 0 4px ${cellColor}` }} />
                            {formatValue(value)}
                          </span>
                        ) : formatValue(value)}
                      </td>
                    );
                  })}
                  {isDC && (
                    <td style={{
                      padding: '9px 14px', borderBottom: `1px solid ${c.border.replace('0.2', '0.06')}`,
                      fontFamily: "'Share Tech Mono', monospace", fontSize: '0.72rem',
                      color: costs[rowIndex] ? '#ff9900' : 'rgba(255,255,255,0.15)', whiteSpace: 'nowrap',
                    }}>
                      {costs[rowIndex] ? (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} style={{ color: '#ff9900' }} />
                          {costs[rowIndex]}
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-30 italic">hover to calc</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip.visible && (
        <div className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-lg text-[10px] font-mono-tech"
          style={{
            left: tooltip.x + 16, top: tooltip.y + 16,
            background: 'rgba(8,12,22,0.95)', backdropFilter: 'blur(20px)',
            border: `1px solid ${c.border}`, boxShadow: `0 0 15px ${c.muted}`,
            color: c.accent, maxWidth: '320px',
          }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
