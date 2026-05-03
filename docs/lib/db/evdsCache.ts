import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

/**
 * Create a new EVDS cache record.
 */
export async function createEvdsCache(data: Prisma.EvdsCacheCreateInput) {
  return await prisma.evdsCache.create({
    data,
  });
}

/**
 * Retrieves all EVDS cache records, ordered by creation date.
 */
export async function getEvdsCaches() {
  return await prisma.evdsCache.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Retrieves a single EVDS cache record by its ID.
 */
export async function getEvdsCacheById(id: string) {
  return await prisma.evdsCache.findUnique({
    where: { id },
  });
}

/**
 * Updates an existing EVDS cache record.
 */
export async function updateEvdsCache(id: string, data: Prisma.EvdsCacheUpdateInput) {
  return await prisma.evdsCache.update({
    where: { id },
    data,
  });
}

/**
 * Deletes an EVDS cache record.
 */
export async function deleteEvdsCache(id: string) {
  return await prisma.evdsCache.delete({
    where: { id },
  });
}