import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword } from "./auth";

async function createDefaultAdmin() {
  try {
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      const admin = await storage.createUser({
        username: "admin",
        password: await hashPassword("admin123"),
        isAdmin: true
      });
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Create default admin user
  await createDefaultAdmin();

  // User Management API
  app.get("/api/users", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post("/api/users/:id/promote", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) return res.sendStatus(404);

    const updatedUser = await storage.updateUser(id, { isAdmin: true });
    res.json(updatedUser);
  });

  app.post("/api/users/:id/premium", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) return res.sendStatus(404);

    const updatedUser = await storage.updateUser(id, { isPremium: true });
    res.json(updatedUser);
  });

  // Products API
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const product = insertProductSchema.parse(req.body);
    const created = await storage.createProduct(product);
    res.status(201).json(created);
  });

  app.patch("/api/products/:id", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const product = insertProductSchema.partial().parse(req.body);
    const updated = await storage.updateProduct(id, product);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteProduct(id);
    if (!deleted) return res.sendStatus(404);
    res.sendStatus(204);
  });

  // Subscription API
  app.post("/api/subscription", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const subscription = await storage.createSubscription({
      userId: req.user.id,
      status: "active",
      nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.status(201).json(subscription);
  });

  app.get("/api/subscription", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const subscription = await storage.getSubscription(req.user.id);
    if (!subscription) return res.sendStatus(404);
    res.json(subscription);
  });

  // Chat WebSocket
  wss.on("connection", (ws) => {
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "chat") {
          const chatMessage = await storage.createChatMessage({
            userId: message.userId,
            message: message.text,
            timestamp: new Date(),
            isAdmin: message.isAdmin,
          });

          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(chatMessage));
            }
          });
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });
  });

  return httpServer;
}