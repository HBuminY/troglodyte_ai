'use client';

import { DataListDisplay } from "@/components/dashboard/data-list-display";
import { useState, useEffect } from 'react';
import { getGreenhousesAction, getDatacentersAction } from "./actions";

export default function DashboardPage() {
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [greenhouses, setGreenhouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dcData, ghData] = await Promise.all([
          getDatacentersAction(),
          getGreenhousesAction()
        ]);
        setDatacenters(dcData || []);
        setGreenhouses(ghData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="flex-1 w-full p-8 h-[calc(100vh-64px)] overflow-hidden">
      <section className="flex flex-row gap-8 h-full overflow-auto pb-4">
        <div className="min-w-[600px] flex-1 h-full overflow-auto">
          <DataListDisplay title="Data Centers" data={datacenters} />
        </div>
        <div className="min-w-[600px] flex-1 h-full overflow-auto">
          <DataListDisplay title="Greenhouses" data={greenhouses} />
        </div>
      </section>
    </div>
  );
}
