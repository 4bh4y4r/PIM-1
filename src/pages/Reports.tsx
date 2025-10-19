import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import SummaryStats from "@/components/reports/SummaryStats";
import DemographicStats from "@/components/reports/DemographicStats";
import ContactCompleteness from "@/components/reports/ContactCompleteness";
import RecentActivity from "@/components/reports/RecentActivity";
import { Button } from "@/components/ui/button";

interface StatsData {
  totalPersons: number;
  recentPersons: number;
  activePersons: number;
  incompletePersons: number;
}

interface DemographicsData {
  gender?: Record<string, number>;
  ageGroups?: Record<string, number>;
  cities?: Record<string, number>;
}

const Reports = () => {
  const [selected, setSelected] = useState({
    summary: true,
    demographics: true,
    contact: true,
    activity: false,
  });
  const [stats, setStats] = useState<StatsData | null>(null);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';

        const [statsRes, demoRes] = await Promise.all([
          fetch(`${base}/api/search/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${base}/api/search/demographics`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (statsRes.ok) {
          const json = await statsRes.json();
          setStats(json.stats || null);
        }
        if (demoRes.ok) {
          const json = await demoRes.json();
          setDemographics(json.demographics || null);
        }
      } catch {}
    };
    fetchAll();
  }, []);

  const buildCSV = () => {
    const rows: string[][] = [];
    if (selected.summary && stats) {
      rows.push(["Section","Metric","Value"]);
      rows.push(["Summary","Total Records", String(stats.totalPersons || 0)]);
      rows.push(["Summary","New This Month", String(stats.recentPersons || 0)]);
      rows.push(["Summary","Active Records", String(stats.activePersons || 0)]);
      rows.push(["Summary","Incomplete Records", String(stats.incompletePersons || 0)]);
    }
    if (selected.demographics && demographics) {
      rows.push(["Section","Metric","Value"]);
      if (demographics.gender) {
        for (const [k,v] of Object.entries(demographics.gender)) rows.push(["Demographics: Gender", k, String(v)]);
      }
      if (demographics.ageGroups) {
        for (const [k,v] of Object.entries(demographics.ageGroups)) rows.push(["Demographics: Age Group", k, String(v)]);
      }
      if (demographics.cities) {
        for (const [k,v] of Object.entries(demographics.cities)) rows.push(["Demographics: City", k, String(v)]);
      }
    }
    if (rows.length === 0) rows.push(["No data selected", "", ""]);
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports-summary.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const parts: string[] = [];
    parts.push('<html><head><title>Reports Summary</title><style>body{font-family:Arial;padding:16px;} h2{margin-top:24px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} </style></head><body>');
    parts.push('<h1>Reports Summary</h1>');
    if (selected.summary && stats) {
      parts.push('<h2>Summary</h2><table><tr><th>Metric</th><th>Value</th></tr>');
      parts.push(`<tr><td>Total Records</td><td>${stats.totalPersons || 0}</td></tr>`);
      parts.push(`<tr><td>New This Month</td><td>${stats.recentPersons || 0}</td></tr>`);
      parts.push(`<tr><td>Active Records</td><td>${stats.activePersons || 0}</td></tr>`);
      parts.push(`<tr><td>Incomplete Records</td><td>${stats.incompletePersons || 0}</td></tr>`);
      parts.push('</table>');
    }
    if (selected.demographics && demographics) {
      parts.push('<h2>Demographics</h2>');
      if (demographics.gender) {
        parts.push('<h3>By Gender</h3><table><tr><th>Gender</th><th>Count</th></tr>');
        for (const [k,v] of Object.entries(demographics.gender)) parts.push(`<tr><td>${k}</td><td>${v}</td></tr>`);
        parts.push('</table>');
      }
      if (demographics.ageGroups) {
        parts.push('<h3>By Age Group</h3><table><tr><th>Group</th><th>Count</th></tr>');
        for (const [k,v] of Object.entries(demographics.ageGroups)) parts.push(`<tr><td>${k}</td><td>${v}</td></tr>`);
        parts.push('</table>');
      }
      if (demographics.cities) {
        parts.push('<h3>By City</h3><table><tr><th>City</th><th>Count</th></tr>');
        for (const [k,v] of Object.entries(demographics.cities)) parts.push(`<tr><td>${k}</td><td>${v}</td></tr>`);
        parts.push('</table>');
      }
    }
    parts.push('</body></html>');
    win.document.write(parts.join(''));
    win.document.close();
    win.focus();
    win.print();
  };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Reports</h1>
          <p className="text-muted-foreground">Overview of system statistics and data insights.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.summary} onChange={(e)=>setSelected({...selected, summary: e.target.checked})} /> Summary
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.demographics} onChange={(e)=>setSelected({...selected, demographics: e.target.checked})} /> Demographics
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.contact} onChange={(e)=>setSelected({...selected, contact: e.target.checked})} /> Contact Completeness
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.activity} onChange={(e)=>setSelected({...selected, activity: e.target.checked})} /> Recent Activity
            </label>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={buildCSV}>Export CSV</Button>
              <Button onClick={exportPDF}>Export PDF</Button>
            </div>
          </div>
        </div>

        <SummaryStats />
        <DemographicStats />
        <ContactCompleteness />
        <RecentActivity />
      </main>
    </div>
  );
};

export default Reports;