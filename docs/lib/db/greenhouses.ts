import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

/**
 * Create a new greenhouse record.
 */
export async function createGreenhouse(data: Prisma.GreenhouseCreateInput) {
  return await prisma.greenhouse.create({
    data,
  });
}

/**
 * Retrieves all greenhouses, ordered by creation date.
 */
export async function getGreenhouses() {
  return await prisma.greenhouse.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Retrieves a single greenhouse by its ID.
 */
export async function getGreenhouseById(id: string) {
  return await prisma.greenhouse.findUnique({
    where: { id },
  });
}

/**
 * Updates an existing greenhouse.
 */
export async function updateGreenhouse(id: string, data: Prisma.GreenhouseUpdateInput) {
  return await prisma.greenhouse.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a greenhouse record.
 */
export async function deleteGreenhouse(id: string) {
  return await prisma.greenhouse.delete({
    where: { id },
  });
}