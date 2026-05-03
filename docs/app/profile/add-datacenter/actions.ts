"use server";

import { createDatacenter, getDatacenters } from "@/lib/db/datacenters";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = {
  error?: string;
  success?: boolean;
};

export async function createDatacenterAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const name = formData.get("name")?.toString();
  const latitudeStr = formData.get("latitude")?.toString();
  const longitudeStr = formData.get("longitude")?.toString();
  const avgElectricConsumptionKwStr = formData.get("avgElectricConsumptionKw")?.toString();
  const pueStr = formData.get("pue")?.toString();
  const coolingType = formData.get("coolingType")?.toString();
  const avgCoolingEnergyKwStr = formData.get("avgCoolingEnergyKw")?.toString();
  const avgNetworkUsageTbpsStr = formData.get("avgNetworkUsageTbps")?.toString();
  const renewableEnergyPercentageStr = formData.get("renewableEnergyPercentage")?.toString();
  const carbonFootprintMtStr = formData.get("carbonFootprintMt")?.toString();

  if (
    !name ||
    !latitudeStr ||
    !longitudeStr ||
    !avgElectricConsumptionKwStr ||
    !pueStr ||
    !coolingType ||
    !avgCoolingEnergyKwStr ||
    !avgNetworkUsageTbpsStr ||
    !renewableEnergyPercentageStr ||
    !carbonFootprintMtStr
  ) {
    return { error: "All datacenter fields are required." };
  }

  const latitude = parseFloat(latitudeStr);
  const longitude = parseFloat(longitudeStr);
  const avgElectricConsumptionKw = parseFloat(avgElectricConsumptionKwStr);
  const pue = parseFloat(pueStr);
  const avgCoolingEnergyKw = parseFloat(avgCoolingEnergyKwStr);
  const avgNetworkUsageTbps = parseFloat(avgNetworkUsageTbpsStr);
  const renewableEnergyPercentage = parseFloat(renewableEnergyPercentageStr);
  const carbonFootprintMt = parseFloat(carbonFootprintMtStr);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    isNaN(avgElectricConsumptionKw) ||
    isNaN(pue) ||
    isNaN(avgCoolingEnergyKw) ||
    isNaN(avgNetworkUsageTbps) ||
    isNaN(renewableEnergyPercentage) ||
    isNaN(carbonFootprintMt)
  ) {
    return { error: "Invalid number format for one or more fields." };
  }

  const data: Prisma.DatacenterCreateInput = {
    name,
    latitude,
    longitude,
    avgElectricConsumptionKw,
    pue,
    coolingType: coolingType as Prisma.DatacenterCreateInput["coolingType"],
    avgCoolingEnergyKw,
    avgNetworkUsageTbps,
    renewableEnergyPercentage,
  };

  try {
    await createDatacenter(data);
  } catch (error) {
    console.error("Failed to create datacenter:", error);
    return { error: "Failed to create datacenter" };
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export async function getDatacentersAction() {
  try {
    return await getDatacenters();
  } catch (error) {
    console.error("Failed to fetch datacenters:", error);
    return [];
  }
}
