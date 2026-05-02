"use server";

import { getGreenhouses } from "@/lib/db/greenhouses";
import { getDatacenters } from "@/lib/db/datacenters";

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
