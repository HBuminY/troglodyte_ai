"use server";

import { getGreenhouses } from "@/lib/db/greenhouses";
import { getDatacenters } from "@/lib/db/datacenters";
import { 
  getDCsToGHsMatrix, 
  pairDCsToGHs,
  calculateDCCarbonFootprint,
  calculateGreenhouseCarbonOffset
} from "@/lib/optimize_engine/relational_mapping";
import { Datacenter, Greenhouse } from "@prisma/client";

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
    
    const pairs = await pairDCsToGHs(matrixResponse, datacenters, greenhouses);

    // Enrich data on the server to avoid multiple client-side server action calls
    const enrichedDatacenters = datacenters.map(dc => ({ ...dc, carbonFootprintMt: calculateDCCarbonFootprint(dc) }));
    const enrichedGreenhouses = greenhouses.map(gh => ({ ...gh, carbonOffsetMt: calculateGreenhouseCarbonOffset(gh) }));
    const results = pairs.map(p => ({ ...p, carbonFootprint: calculateDCCarbonFootprint(p.datacenter), carbonOffset: calculateGreenhouseCarbonOffset(p.greenhouse) }));

    return { results, matrixResponse, datacenters: enrichedDatacenters, greenhouses: enrichedGreenhouses };
  } catch (error) {
    console.error("Failed to fetch DCs to GHs matrix:", error);
    return { matrixResponse: null, datacenters: [], greenhouses: [], results: [] };
  }
}

export async function calculateDCCarbonFootprintAction(dc: Datacenter) {
  return calculateDCCarbonFootprint(dc);
}

export async function calculateGreenhouseCarbonOffsetAction(gh: Greenhouse) {
  return calculateGreenhouseCarbonOffset(gh);
}
