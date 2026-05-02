import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/**
 * Create a new datacenter record.
 */
export async function createDatacenter(data: Prisma.DatacenterCreateInput) {
  return await prisma.datacenter.create({
    data,
  });
}

/**
 * Retrieves all datacenters, ordered by creation date.
 */
export async function getDatacenters() {
  return await prisma.datacenter.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Retrieves a single datacenter by its ID.
 */
export async function getDatacenterById(id: string) {
  return await prisma.datacenter.findUnique({
    where: { id },
  });
}

/**
 * Updates an existing datacenter.
 */
export async function updateDatacenter(id: string, data: Prisma.DatacenterUpdateInput) {
  return await prisma.datacenter.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a datacenter record.
 */
export async function deleteDatacenter(id: string) {
  return await prisma.datacenter.delete({
    where: { id },
  });
}