
import { getDatacenters } from "../db/datacenters";
import { getGreenhouses } from "../db/greenhouses";
import { getDistanceMatrix } from "./ors_utility";
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