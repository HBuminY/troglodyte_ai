'use client';

import dynamic from 'next/dynamic';
import { NeonDataTable } from "@/components/dashboard/neon-data-table";
import { useState, useEffect, useCallback } from 'react';
import {
  getGreenhousesAction,
  getDatacentersAction,
  getOptimizedDCsToGHsMatrixAction,
  callModelAction,
} from "./actions";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Server, Leaf, Zap, TrendingDown, Activity, Cpu, Globe, ArrowRight,
  RefreshCw, AlertCircle, CheckCircle2, BarChart2, Radio, Layers
} from 'lucide-react';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center neon-card">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'var(--neon-cyan)', borderTopColor:'transparent'}}/>
        <span className="font-orbitron text-xs neon-text-cyan tracking-widest">LOADING MAP...</span>
      </div>
    </div>
  ),
});

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const NeonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="neon-card px-3 py-2 text-xs font-mono-tech">
        <p className="neon-text-cyan mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; delay?: number;
}) {
  const colors: Record<string, { border: string; text: string; glow: string; bg: string }> = {
    cyan:   { border: 'rgba(0,255,204,0.35)', text: '#00ffcc', glow: 'rgba(0,255,204,0.15)', bg: 'rgba(0,255,204,0.04)' },
    purple: { border: 'rgba(179,0,255,0.35)', text: '#b300ff', glow: 'rgba(179,0,255,0.15)', bg: 'rgba(179,0,255,0.04)' },
    green:  { border: 'rgba(0,255,136,0.35)', text: '#00ff88', glow: 'rgba(0,255,136,0.15)', bg: 'rgba(0,255,136,0.04)' },
    blue:   { border: 'rgba(0,200,255,0.35)', text: '#00c8ff', glow: 'rgba(0,200,255,0.15)', bg: 'rgba(0,200,255,0.04)' },
    pink:   { border: 'rgba(255,0,170,0.35)', text: '#ff00aa', glow: 'rgba(255,0,170,0.15)', bg: 'rgba(255,0,170,0.04)' },
  };
  const c = colors[color] || colors.cyan;
  return (
    <div className="corner-deco rounded-xl p-4 flex flex-col gap-2 animate-float-up"
      style={{
        background: `rgba(8,12,22,0.9)`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 20px ${c.glow}, 0 4px 40px rgba(0,0,0,0.4)`,
        backdropFilter: 'blur(20px)',
        animationDelay: `${delay}ms`,
      }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-orbitron tracking-widest uppercase" style={{ color: c.text, opacity: 0.7 }}>{label}</span>
        <div className="p-1.5 rounded-md" style={{ background: c.bg }}>
          <Icon size={14} style={{ color: c.text }} />
        </div>
      </div>
      <p className="text-2xl font-orbitron font-bold" style={{ color: c.text, textShadow: `0 0 14px ${c.text}` }}>
        {value}
      </p>
      {sub && <p className="text-[10px] font-mono-tech opacity-50">{sub}</p>}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardClient({ children, currency }: { children: React.ReactNode; currency?: any }) {
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [greenhouses, setGreenhouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedLocations, setDisplayedLocations] = useState<Record<string, { lat: number; lng: number; color?: 'blue' | 'green' }>>({});
  const [isClient, setIsClient] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [modelResult, setModelResult] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dc' | 'gh'>('dc');

  useEffect(() => {
    setIsClient(true);
    async function fetchData() {
      try {
        const [dcData, ghData] = await Promise.all([getDatacentersAction(), getGreenhousesAction()]);
        setDatacenters(dcData || []);
        setGreenhouses(ghData || []);
        const locations: Record<string, { lat: number; lng: number; color?: 'blue' | 'green' }> = {};
        dcData?.forEach((dc: any) => { locations[dc.name] = { lat: dc.latitude, lng: dc.longitude, color: 'blue' }; });
        ghData?.forEach((gh: any) => { locations[gh.name] = { lat: gh.latitude, lng: gh.longitude, color: 'green' }; });
        setDisplayedLocations(locations);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePairing = useCallback(async () => {
    setIsOptimizing(true);
    setModelResult(null);
    try {
      const result = await getOptimizedDCsToGHsMatrixAction();
      setDatacenters(result.datacenters);
      setGreenhouses(result.greenhouses);
      setOptimizationResult(result);
      const modelData = await callModelAction(result.greenhouses, result.datacenters);
      if (modelData) setModelResult(modelData);
    } catch (error) {
      console.error("Failed to get optimized pairing:", error);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  // ─── Derived chart data ───────────────────────────────────────────────────
  const dcChartData = datacenters.slice(0, 8).map((dc: any) => ({
    name: dc.name?.split(' ')[0] || 'DC',
    footprint: dc.carbonFootprintMt ? +dc.carbonFootprintMt.toFixed(3) : 0,
    pue: dc.pue || 0,
    renewable: dc.renewableEnergyPercentage || 0,
    power: dc.avgElectricConsumptionKw || 0,
  }));

  const ghChartData = greenhouses.slice(0, 8).map((gh: any) => ({
    name: gh.name?.split(' ')[0] || 'GH',
    offset: gh.carbonOffsetMt ? +gh.carbonOffsetMt.toFixed(3) : 0,
    area: gh.areaM2 || 0,
  }));

  const radarData = optimizationResult?.results?.slice(0, 6).map((pair: any) => ({
    subject: pair.datacenter.name?.split(' ')[0] || 'DC',
    footprint: +pair.carbonFootprint.toFixed(3),
    offset: +pair.carbonOffset.toFixed(3),
    net: +(pair.carbonFootprint - pair.carbonOffset).toFixed(3),
  })) || [];

  const totalFootprint = datacenters.reduce((s: number, dc: any) => s + (dc.carbonFootprintMt || 0), 0);
  const totalOffset = greenhouses.reduce((s: number, gh: any) => s + (gh.carbonOffsetMt || 0), 0);
  const netImpact = totalFootprint - totalOffset;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 border-2 border-t-transparent rounded-full animate-spin absolute" style={{borderColor:'var(--neon-cyan)', borderTopColor:'transparent'}}/>
            <div className="w-10 h-10 border-2 border-b-transparent rounded-full animate-spin absolute top-3 left-3" style={{borderColor:'var(--neon-purple)', borderBottomColor:'transparent', animationDirection:'reverse'}}/>
          </div>
          <p className="font-orbitron text-sm neon-text-cyan tracking-widest animate-pulse-neon">INITIALIZING SYSTEMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pb-16 space-y-6 max-w-[1600px] mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between pt-4 animate-float-up">
        <div>
          <p className="font-mono-tech text-xs opacity-40 tracking-widest uppercase mb-1">// troglodyte.ai mission control</p>
          <h1 className="font-orbitron text-2xl font-bold gradient-title">CARBON NEXUS DASHBOARD</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="status-online">SYSTEMS NOMINAL</span>
          <div className="font-mono-tech text-xs opacity-30">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* ── Currency Widget (injected server component) ── */}
      <div className="animate-float-up" style={{ animationDelay: '50ms' }}>
        {children}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Server}     label="Data Centers"    value={datacenters.length}        sub="active nodes"          color="cyan"   delay={100} />
        <StatCard icon={Leaf}       label="Greenhouses"     value={greenhouses.length}         sub="heat recovery sites"   color="green"  delay={150} />
        <StatCard icon={Activity}   label="Total Footprint" value={`${totalFootprint.toFixed(2)} Mt`} sub="CO₂e / year"   color="pink"   delay={200} />
        <StatCard icon={TrendingDown} label="Carbon Offset" value={`${totalOffset.toFixed(2)} Mt`}   sub="CO₂e avoided"  color="purple" delay={250} />
      </div>

      {/* ── Net Impact Banner ── */}
      {(totalFootprint > 0 || totalOffset > 0) && (
        <div className="neon-card p-4 flex items-center gap-6 animate-float-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: 'var(--neon-cyan)' }} />
            <span className="font-orbitron text-xs tracking-widest neon-text-cyan uppercase">Net CO₂ Impact</span>
          </div>
          <div className="h-2 flex-1 rounded-full overflow-hidden bg-white/5">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (totalOffset / Math.max(totalFootprint, 0.001)) * 100)}%`,
                background: 'linear-gradient(90deg, var(--neon-purple), var(--neon-cyan))',
                boxShadow: '0 0 10px var(--neon-cyan)',
              }} />
          </div>
          <span className="font-mono-tech text-sm" style={{ color: netImpact < 0 ? 'var(--neon-green)' : 'var(--neon-pink)' }}>
            {netImpact >= 0 ? '+' : ''}{netImpact.toFixed(2)} Mt
          </span>
          <span className="text-[10px] font-mono-tech opacity-40">
            {((totalOffset / Math.max(totalFootprint, 0.001)) * 100).toFixed(1)}% offset
          </span>
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DC Carbon Footprint Bar */}
        <div className="neon-card p-5 animate-slide-in-left">
          <div className="section-header">
            <span className="font-orbitron text-xs neon-text-cyan tracking-widest uppercase">DC Carbon Footprint (Mt CO₂e)</span>
            <BarChart2 size={13} style={{ color: 'var(--neon-cyan)', marginLeft: 'auto', opacity: 0.5 }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dcChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(0,255,204,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
              <YAxis tick={{ fill: 'rgba(0,255,204,0.3)', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
              <Tooltip content={<NeonTooltip />} />
              <Bar dataKey="footprint" name="Footprint" radius={[3, 3, 0, 0]}>
                {dcChartData.map((_, i) => (
                  <Cell key={i} fill={`rgba(255,0,170,${0.5 + (i % 4) * 0.12})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GH Carbon Offset Area */}
        <div className="neon-card p-5 animate-slide-in-right">
          <div className="section-header">
            <span className="font-orbitron text-xs neon-text-green tracking-widest uppercase">Greenhouse Offset (Mt CO₂e)</span>
            <Leaf size={13} style={{ color: 'var(--neon-green)', marginLeft: 'auto', opacity: 0.5 }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ghChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="offsetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--neon-green)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--neon-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(0,255,136,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
              <YAxis tick={{ fill: 'rgba(0,255,136,0.3)', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
              <Tooltip content={<NeonTooltip />} />
              <Area type="monotone" dataKey="offset" name="Offset" stroke="var(--neon-green)" strokeWidth={2} fill="url(#offsetGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DC Renewable % Bar */}
      {dcChartData.length > 0 && (
        <div className="neon-card-purple p-5 animate-float-up" style={{ animationDelay: '350ms' }}>
          <div className="section-header">
            <span className="font-orbitron text-xs neon-text-purple tracking-widest uppercase">Renewable Energy % per DC</span>
            <Radio size={13} style={{ color: 'var(--neon-purple)', marginLeft: 'auto', opacity: 0.5 }} />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dcChartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(179,0,255,0.4)', fontSize: 9, fontFamily: 'Share Tech Mono' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(179,0,255,0.6)', fontSize: 9, fontFamily: 'Share Tech Mono' }} width={55} />
              <Tooltip content={<NeonTooltip />} />
              <Bar dataKey="renewable" name="Renewable %" radius={[0, 4, 4, 0]}>
                {dcChartData.map((d, i) => (
                  <Cell key={i} fill={d.renewable > 60 ? 'var(--neon-green)' : d.renewable > 30 ? 'var(--neon-cyan)' : 'var(--neon-pink)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Map ── */}
      <div className="animate-float-up" style={{ animationDelay: '400ms' }}>
        <div className="section-header mb-3">
          <span className="font-orbitron text-xs neon-text-blue tracking-widest uppercase">Geographic Deployment Map</span>
          <Globe size={13} style={{ color: 'var(--neon-blue)', marginLeft: 'auto', opacity: 0.5 }} />
        </div>
        <div className="neon-map-container">
          {isClient && (
            <LocationPicker
              onLocationSelect={() => false}
              locations={displayedLocations}
            />
          )}
        </div>
        <div className="flex gap-6 mt-2 px-1">
          <span className="flex items-center gap-2 text-[10px] font-mono-tech opacity-50">
            <span className="w-3 h-3 rounded-full" style={{ background: '#2d7eff', boxShadow: '0 0 5px #2d7eff' }} /> Data Centers
          </span>
          <span className="flex items-center gap-2 text-[10px] font-mono-tech opacity-50">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--neon-green)', boxShadow: '0 0 5px var(--neon-green)' }} /> Greenhouses
          </span>
        </div>
      </div>

      {/* ── Optimize CTA ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-float-up" style={{ animationDelay: '450ms' }}>
        <button
          className="neon-button flex items-center gap-2"
          onClick={handlePairing}
          disabled={isOptimizing || datacenters.length === 0 || greenhouses.length === 0}
        >
          {isOptimizing ? (
            <><RefreshCw size={13} className="animate-spin" /> CALCULATING OPTIMAL ROUTES...</>
          ) : (
            <><Cpu size={13} /> RUN HUNGARIAN OPTIMIZATION<ArrowRight size={13} /></>
          )}
        </button>
        {optimizationResult && (
          <span className="flex items-center gap-2 text-xs font-mono-tech" style={{ color: 'var(--neon-green)' }}>
            <CheckCircle2 size={13} /> {optimizationResult.results?.length} pairs computed
          </span>
        )}
      </div>

      {/* ── Optimization Results ── */}
      {optimizationResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-float-up">
          {/* Pair list */}
          <div className="neon-card-green p-5">
            <div className="section-header mb-3">
              <span className="font-orbitron text-xs neon-text-green tracking-widest uppercase">Optimized DC → GH Pairings</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {optimizationResult.results.map((pair: any, idx: number) => {
                const net = pair.carbonFootprint - pair.carbonOffset;
                return (
                  <div key={idx} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-mono-tech"
                    style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.12)' }}>
                    <span style={{ color: 'var(--neon-blue)' }}>{pair.datacenter.name}</span>
                    <ArrowRight size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span style={{ color: 'var(--neon-green)' }}>{pair.greenhouse.name}</span>
                    <span className="ml-2 opacity-50">{(pair.distance / 1000).toFixed(1)}km</span>
                    <span style={{ color: net < 0 ? 'var(--neon-green)' : 'var(--neon-pink)' }}>
                      {net >= 0 ? '+' : ''}{net.toFixed(3)} Mt
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Radar chart */}
          {radarData.length > 0 && (
            <div className="neon-card p-5">
              <div className="section-header mb-3">
                <span className="font-orbitron text-xs neon-text-cyan tracking-widest uppercase">Carbon Balance Radar</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0,255,204,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(0,255,204,0.5)', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
                  <Radar name="Footprint" dataKey="footprint" stroke="var(--neon-pink)" fill="var(--neon-pink)" fillOpacity={0.15} />
                  <Radar name="Offset"    dataKey="offset"    stroke="var(--neon-green)" fill="var(--neon-green)" fillOpacity={0.15} />
                  <Tooltip content={<NeonTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Model Result ── */}
      {modelResult && (
        <div className="neon-card-purple p-5 animate-float-up">
          <div className="section-header mb-3">
            <span className="font-orbitron text-xs neon-text-purple tracking-widest uppercase">AI Model Recommendation Output</span>
            <Layers size={13} style={{ color: 'var(--neon-purple)', marginLeft: 'auto', opacity: 0.5 }} />
          </div>
          <pre className="font-mono-tech text-xs leading-relaxed overflow-auto max-h-48 p-3 rounded-lg"
            style={{ background: 'rgba(179,0,255,0.04)', border: '1px solid rgba(179,0,255,0.15)', color: 'rgba(200,150,255,0.9)' }}>
            {JSON.stringify(modelResult, null, 2)}
          </pre>
        </div>
      )}

      {/* ── Data Tables ── */}
      <div className="animate-float-up" style={{ animationDelay: '500ms' }}>
        {/* Tab Bar */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,204,0.1)' }}>
          {(['dc', 'gh'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 text-[10px] font-orbitron tracking-widest uppercase rounded-md transition-all duration-300"
              style={activeTab === tab ? {
                background: tab === 'dc' ? 'rgba(0,200,255,0.15)' : 'rgba(0,255,136,0.15)',
                color: tab === 'dc' ? 'var(--neon-blue)' : 'var(--neon-green)',
                boxShadow: `0 0 10px ${tab === 'dc' ? 'rgba(0,200,255,0.3)' : 'rgba(0,255,136,0.3)'}`,
              } : { color: 'rgba(255,255,255,0.3)' }}>
              {tab === 'dc' ? <><Server size={10} className="inline mr-1.5" />Data Centers</> : <><Leaf size={10} className="inline mr-1.5" />Greenhouses</>}
            </button>
          ))}
        </div>

        {activeTab === 'dc' && (
          <NeonDataTable title="DATA CENTERS" data={datacenters} currency={currency} isDC={true} color="blue" />
        )}
        {activeTab === 'gh' && (
          <NeonDataTable title="GREENHOUSES" data={greenhouses} color="green" />
        )}
      </div>
    </div>
  );
}