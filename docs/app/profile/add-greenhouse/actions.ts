"use server";

import { createGreenhouse } from "@/lib/db/greenhouses";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = {
  error?: string;
  success?: boolean;
};

export async function createGreenhouseAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const name = formData.get("name")?.toString();
  const latitudeStr = formData.get("latitude")?.toString();
  const longitudeStr = formData.get("longitude")?.toString();
  const idealTemperatureCStr = formData.get("idealTemperatureC")?.toString();
  const currentTemperatureCStr = formData.get("currentTemperatureC")?.toString();
  const heatSupportFromDatacenterJoulesStr = formData.get("heatSupportFromDatacenterJoules")?.toString();
  const heatingEnergySource = formData.get("heatingEnergySource")?.toString();
  const avgElectricConsumptionKwStr = formData.get("avgElectricConsumptionKw")?.toString();
  const waterUsageLitersPerDayStr = formData.get("waterUsageLitersPerDay")?.toString();
  const co2EnrichmentTargetPpmStr = formData.get("co2EnrichmentTargetPpm")?.toString();
  const carbonFootprintMtStr = formData.get("carbonFootprintMt")?.toString();

  if (
    !name ||
    !latitudeStr ||
    !longitudeStr || 
    !idealTemperatureCStr ||
    !currentTemperatureCStr ||
    !heatSupportFromDatacenterJoulesStr ||
    !heatingEnergySource ||
    !avgElectricConsumptionKwStr ||
    !waterUsageLitersPerDayStr ||
    !co2EnrichmentTargetPpmStr ||
    !carbonFootprintMtStr
  ) {
    return { error: "All greenhouse fields are required." };
  }

  const latitude = parseFloat(latitudeStr);
  const longitude = parseFloat(longitudeStr);
  const idealTemperatureC = parseFloat(idealTemperatureCStr);
  const currentTemperatureC = parseFloat(currentTemperatureCStr);
  const heatSupportFromDatacenterJoules = parseFloat(heatSupportFromDatacenterJoulesStr);
  const avgElectricConsumptionKw = parseFloat(avgElectricConsumptionKwStr);
  const waterUsageLitersPerDay = parseFloat(waterUsageLitersPerDayStr);
  const co2EnrichmentTargetPpm = parseFloat(co2EnrichmentTargetPpmStr);
  const carbonFootprintMt = parseFloat(carbonFootprintMtStr);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    isNaN(idealTemperatureC) ||
    isNaN(currentTemperatureC) ||
    isNaN(heatSupportFromDatacenterJoules) ||
    isNaN(avgElectricConsumptionKw) ||
    isNaN(waterUsageLitersPerDay) ||
    isNaN(co2EnrichmentTargetPpm) ||
    isNaN(carbonFootprintMt)
  ) {
    return { error: "Invalid number format for one or more fields." };
  }

  const data: Prisma.GreenhouseCreateInput = {
    name,
    latitude,
    longitude,
    idealTemperatureC,
    currentTemperatureC,
    heatSupportFromDatacenterJoules,
    heatingEnergySource,
    avgElectricConsumptionKw,
    waterUsageLitersPerDay,
    co2EnrichmentTargetPpm,
    carbonFootprintMt,
  };

  try {
    await createGreenhouse(data);
  } catch (error) {
    console.error("Failed to create greenhouse:", error);
    return { error: "Failed to create greenhouse" };
  }

  revalidatePath("/profile");
  redirect("/profile");
}
