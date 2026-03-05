import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Replit Auth Models
export * from "./models/auth";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // COP
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  condition: text("condition").notNull(), // 'new', 'used'
  status: text("status").notNull().default("available"), // 'available', 'sold'
  features: text("features").array(),
  imageUrl: text("image_url"),
  paymentLink: text("payment_link"),
  whatsappNumber: text("whatsapp_number"), // Direct contact
  location: text("location"), // City in Colombia
  createdAt: timestamp("created_at").defaultNow(),
});

export const companyPolicies = pgTable("company_policies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  email: text("email"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ 
  id: true, 
  createdAt: true,
  status: true 
});

export const insertPolicySchema = createInsertSchema(companyPolicies).omit({
  id: true,
  createdAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

// Explicit API Contract Types
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type CompanyPolicy = typeof companyPolicies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type CreateVehicleRequest = InsertVehicle;
export type UpdateVehicleRequest = Partial<InsertVehicle> & { status?: string };
export type VehicleResponse = Vehicle;

export type CreatePolicyRequest = InsertPolicy;
export type UpdatePolicyRequest = Partial<InsertPolicy>;
export type PolicyResponse = CompanyPolicy;
