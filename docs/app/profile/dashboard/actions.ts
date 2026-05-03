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
import { getLatestCurrency } from "@/lib/evds";
import { createEvdsCache } from "@/lib/db/evdsCache";

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

export async function calculateEstimatedDCCost(dc: Datacenter, currencyRate: number = 45.14) {
  // Average electricity price in USD per kWh (example value)
  const AVG_ELECTRICITY_PRICE_USD_KWH = 0.12;

  // Total energy in kWh per year
  const totalEnergyKwhYear = dc.avgElectricConsumptionKw * dc.pue * 8760;

  // Calculate cost in USD
  const annualCostUSD = totalEnergyKwhYear * AVG_ELECTRICITY_PRICE_USD_KWH;

  // Convert to local currency (TRY) using the provided rate
  const annualCostTRY = annualCostUSD * currencyRate;

  return {
    annualCostUSD,
    annualCostTRY,
    totalEnergyKwhYear
  };

}

export async function callModelAction(greenhouses: any[], datacenters: any[]) {
  try {
    const modelUrl = process.env.MODEL_URL + "/recommend" || "http://localhost:5167/recommend";

    if (!modelUrl) {
      throw new Error("MODEL_URL is not defined in environment variables");
    }

    console.log(`[callModelAction] Fetching from: ${modelUrl}`);

    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        greenhouses,
        datacenters: datacenters,
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.text().catch(() => "No error body");
      console.error(`[callModelAction] Error ${response.status} at ${modelUrl}: ${errorDetail}`);
      throw new Error(`Model request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in callModelAction:", error);
    return null;
  }
}
