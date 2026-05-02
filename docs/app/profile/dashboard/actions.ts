"use server";

import { getGreenhouses } from "@/lib/db/greenhouses";
import { getDatacenters } from "@/lib/db/datacenters";
import { getDCsToGHsMatrix, pairDCsToGHs } from "@/lib/optimize_engine/relational_mapping";

export async function getDatacentersAction() {
  try {
    return await getDatacenters();
  } catch (error) {
    console.error("Failed to fetch datacenters:", error);
    return [];
  }
}

export async function getGreenhousesAction() {
  try {
    return await getGreenhouses();
  } catch (error) {
    console.error("Failed to fetch greenhouses:", error);
    return [];
  }
}


export async function getOptimizedDCsToGHsMatrixAction() {
  try {
    const { matrixResponse, datacenters, greenhouses } = await getDCsToGHsMatrix();
    
    const results = await pairDCsToGHs(matrixResponse, datacenters, greenhouses);
    return { results, matrixResponse, datacenters, greenhouses };
  } catch (error) {
    console.error("Failed to fetch DCs to GHs matrix:", error);
    return { matrixResponse: null, datacenters: [], greenhouses: [], results: [] };
  }
}