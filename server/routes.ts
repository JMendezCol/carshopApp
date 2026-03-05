import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Vehicles endpoints
  app.get(api.vehicles.list.path, async (req, res) => {
    const vehicles = await storage.getVehicles();
    res.json(vehicles);
  });

  app.get(api.vehicles.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const vehicle = await storage.getVehicle(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  });

  app.post(api.vehicles.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.vehicles.create.input.parse(req.body);
      const vehicle = await storage.createVehicle(input);
      res.status(201).json(vehicle);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.vehicles.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const input = api.vehicles.update.input.parse(req.body);
      
      const existing = await storage.getVehicle(id);
      if (!existing) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const vehicle = await storage.updateVehicle(id, input);
      res.json(vehicle);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.vehicles.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const existing = await storage.getVehicle(id);
    if (!existing) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await storage.deleteVehicle(id);
    res.status(204).end();
  });

  // Policies endpoints
  app.get(api.policies.list.path, async (req, res) => {
    const policies = await storage.getPolicies();
    res.json(policies);
  });

  // Support & Chatbot
  app.post(api.support.sendMessage.path, async (req, res) => {
    try {
      const input = api.support.sendMessage.input.parse(req.body);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.support.chatbot.path, async (req, res) => {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    let reply = "Lo siento, no entiendo tu pregunta. ¿Te gustaría hablar con un asesor por WhatsApp?";

    if (lowerMsg.includes("precio") || lowerMsg.includes("cuanto vale")) {
      reply = "Nuestros precios varían según el modelo. Puedes ver los precios en pesos colombianos (COP) en cada vehículo de nuestro inventario.";
    } else if (lowerMsg.includes("credito") || lowerMsg.includes("financiacion")) {
      reply = "¡Claro! Ofrecemos planes de financiación de hasta 72 meses con una tasa aproximada del 1.5% M.V. Puedes usar el simulador en la página de cada vehículo.";
    } else if (lowerMsg.includes("hola") || lowerMsg.includes("buenos dias")) {
      reply = "¡Hola! Bienvenido a nuestra vitrina digital. ¿Buscas algún vehículo en especial o quieres información sobre crédito?";
    } else if (lowerMsg.includes("donde estan") || lowerMsg.includes("ubicacion") || lowerMsg.includes("bogota")) {
      reply = "Estamos ubicados en Bogotá, D.C. Atendemos de lunes a sábado de 8:00 AM a 6:00 PM.";
    }

    res.json({ reply });
  });

  return httpServer;
}
