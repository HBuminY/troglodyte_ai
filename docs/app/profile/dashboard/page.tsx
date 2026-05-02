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
    <div className="flex-1 w-full flex flex-col gap-12 p-8">
      <section>
        <DataListDisplay title="Data Centers" data={datacenters} />
      </section>
      <section>
        <DataListDisplay title="Greenhouses" data={greenhouses} />
      </section>
    </div>
  );
}
