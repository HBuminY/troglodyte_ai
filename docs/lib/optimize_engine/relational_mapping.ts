
import { getDatacenters } from "../db/datacenters";
import { getGreenhouses } from "../db/greenhouses";
import { getDistanceMatrix } from "./ors_utility";
import { Datacenter, Greenhouse } from "@prisma/client";

const GRID_CARBON_INTENSITY_KG_KWH = 0.475; // Average kg CO2e per kWh
const GAS_CARBON_INTENSITY_KG_KWH = 0.202;  // Average kg CO2e per kWh for natural gas

// Typical efficiency factors for the heating systems being replaced.
// Replacing a gas boiler (85% efficient) saves more primary energy than just the heat delivered.
const GAS_BOILER_EFFICIENCY = 0.85; 
const ELECTRIC_HEATER_COP = 1.0;

// Coefficient of Performance (COP) for Data Center cooling. 
// Represents how many units of heat are removed per unit of electricity used.
const DC_COOLING_COP = 3.0; 

const munkres = require("munkres-js");

/**
 * Fetches all DCs and GHs and returns a distance matrix between them.
 * The matrix rows represent Datacenters and columns represent Greenhouses.
 */
export async function getDCsToGHsMatrix() {
  const datacenters = await getDatacenters();
  const greenhouses = await getGreenhouses();

  if (datacenters.length === 0 || greenhouses.length === 0) {
    return { matrixResponse: null, datacenters, greenhouses };
  }

  // Combine locations: [DCs..., GHs...]
  const locations = [
    ...datacenters.map((dc) => [dc.longitude, dc.latitude]),
    ...greenhouses.map((gh) => [gh.longitude, gh.latitude]),
  ];

  const matrixResponse = await getDistanceMatrix(locations);
  return { matrixResponse, datacenters, greenhouses };
}

/**
 * Pairs datacenters to greenhouses based on the shortest distance using the Munkres (Hungarian) algorithm.
 */
export async function pairDCsToGHs(
  matrixResponse: any,
  datacenters: any[],
  greenhouses: any[]
): Promise<{ datacenter: any; greenhouse: any; distance: number }[]> {

  // Fallback to durations if distances metrics are missing from the response
  const matrix = matrixResponse?.distances || matrixResponse?.durations;

  if (!matrix) {
    return [];
  }

  const dcCount = datacenters.length;
  const ghCount = greenhouses.length;

  // Extract the sub-matrix where rows are DCs and columns are GHs
  // matrixResponse.distances contains all-to-all distances.
  // DCs are indices 0 to dcCount-1, GHs are indices dcCount to dcCount + ghCount - 1
  const costMatrix: number[][] = [];
  for (let i = 0; i < dcCount; i++) {
    const row: number[] = [];
    for (let j = 0; j < ghCount; j++) {
      row.push(matrix[i][dcCount + j]);
    }
    costMatrix.push(row);
  }

  const assignments = munkres(costMatrix);

  return assignments.map(([dcIdx, ghIdx]: [number, number]) => ({
    datacenter: datacenters[dcIdx],
    greenhouse: greenhouses[ghIdx],
    distance: costMatrix[dcIdx][ghIdx]
  }));
}

/**
 * Calculates the estimated annual carbon footprint of a data center in Metric Tons (Mt).
 * Formula: (Total Energy Consumption * Non-Renewable %) * Grid Intensity
 */
export function calculateDCCarbonFootprint(dc: Datacenter): number {
  // Total energy in kWh per year (assuming avg consumption is continuous)
  const totalEnergyKwhYear = dc.avgElectricConsumptionKw * dc.pue * 8760;
  
  // Only calculate footprint for the non-renewable portion
  const brownEnergyKwhYear = totalEnergyKwhYear * (1 - dc.renewableEnergyPercentage / 100);
  
  // Convert kg CO2e to Metric Tons
  return (brownEnergyKwhYear * GRID_CARBON_INTENSITY_KG_KWH) / 1000;
}

/**
 * Calculates the annual carbon offset (negative footprint) in Metric Tons (Mt) 
 * for a greenhouse using data center waste heat instead of its original energy source.
 */
export function calculateGreenhouseCarbonOffset(gh: Greenhouse): number {
  // Convert Joules to kWh (1 kWh = 3,600,000 Joules)
  const energySavedKwhYear = gh.heatSupportFromDatacenterJoules / 3600000;
  
  let intensity = 0;
  let efficiency = 1.0;

  switch (gh.heatingEnergySource) {
    case 'GAS':
      intensity = GAS_CARBON_INTENSITY_KG_KWH;
      efficiency = GAS_BOILER_EFFICIENCY;
      break;
    case 'ELECTRIC':
      intensity = GRID_CARBON_INTENSITY_KG_KWH;
      efficiency = ELECTRIC_HEATER_COP;
      break;
    default:
      intensity = 0; // If already using waste heat or other, no additional offset
  }

  // 1. Calculate Greenhouse carbon savings (avoided fuel/electricity)
  const fuelEnergyAvoidedKwh = energySavedKwhYear / efficiency;
  const fuelCarbonOffsetMt = (fuelEnergyAvoidedKwh * intensity) / 10;

  // 2. Calculate Data Center carbon savings (avoided cooling energy)
  // Redirecting heat to the GH reduces the load on the DC's rejection system.
  const coolingEnergyAvoidedKwh = energySavedKwhYear / DC_COOLING_COP;
  const coolingCarbonOffsetMt = (coolingEnergyAvoidedKwh * GRID_CARBON_INTENSITY_KG_KWH);

  return fuelCarbonOffsetMt + coolingCarbonOffsetMt;
}