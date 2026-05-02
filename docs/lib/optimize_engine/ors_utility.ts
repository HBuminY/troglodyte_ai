import Openrouteservice from "openrouteservice-js";

const matrixClient = new (Openrouteservice as any).Matrix({ api_key: process.env.ORS_API });

/**
 * Calculates a distance/duration matrix for the given locations.
 * @param locations Array of [longitude, latitude] coordinates
 * @param profile Route profile (e.g., 'driving-car', 'cycling-regular')
 */
export async function getDistanceMatrix(locations: number[][], profile: string = "driving-car") {
  try {
    const response = await matrixClient.calculate({
      locations: locations,
      profile: profile,
      sources: ['all'],
      destinations: ['all'],
      metrics: ['distance', 'duration']
    });
    return response;
  } catch (err: any) {
    console.error("An error occurred: " + err.status);
    throw err;
  }
}