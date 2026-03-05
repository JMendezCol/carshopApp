import { vehicles, type Vehicle, type InsertVehicle, type UpdateVehicleRequest, companyPolicies, type CompanyPolicy, type InsertPolicy, type UpdatePolicyRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: UpdateVehicleRequest): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;

  // Policies
  getPolicies(): Promise<CompanyPolicy[]>;
  getPolicy(id: number): Promise<CompanyPolicy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<CompanyPolicy>;
  updatePolicy(id: number, policy: UpdatePolicyRequest): Promise<CompanyPolicy>;
  deletePolicy(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: number, updateData: UpdateVehicleRequest): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updateData)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Policies
  async getPolicies(): Promise<CompanyPolicy[]> {
    return await db.select().from(companyPolicies);
  }

  async getPolicy(id: number): Promise<CompanyPolicy | undefined> {
    const [policy] = await db.select().from(companyPolicies).where(eq(companyPolicies.id, id));
    return policy;
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<CompanyPolicy> {
    const [policy] = await db.insert(companyPolicies).values(insertPolicy).returning();
    return policy;
  }

  async updatePolicy(id: number, updateData: UpdatePolicyRequest): Promise<CompanyPolicy> {
    const [policy] = await db
      .update(companyPolicies)
      .set(updateData)
      .where(eq(companyPolicies.id, id))
      .returning();
    return policy;
  }

  async deletePolicy(id: number): Promise<void> {
    await db.delete(companyPolicies).where(eq(companyPolicies.id, id));
  }
}

export const storage = new DatabaseStorage();