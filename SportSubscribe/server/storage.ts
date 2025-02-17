import { User, Product, ChatMessage, Subscription, InsertUser, insertUserSchema } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User>;
  updateUser(id: number, user: Partial<Omit<User, "id">>): Promise<User | undefined>;

  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: Omit<Product, "id">): Promise<Product>;
  updateProduct(id: number, product: Partial<Omit<Product, "id">>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: Omit<ChatMessage, "id">): Promise<ChatMessage>;

  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: Omit<Subscription, "id">): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Omit<Subscription, "id">>): Promise<Subscription | undefined>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private chatMessages: Map<number, ChatMessage>;
  private subscriptions: Map<number, Subscription>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.chatMessages = new Map();
    this.subscriptions = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin ?? false
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: number,
    userData: Partial<Omit<User, "id">>,
  ): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...userData };
    this.users.set(id, updated);
    return updated;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const id = this.currentId++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(
    id: number,
    product: Partial<Omit<Product, "id">>,
  ): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (msg) => msg.userId === userId,
    );
  }

  async createChatMessage(message: Omit<ChatMessage, "id">): Promise<ChatMessage> {
    const id = this.currentId++;
    const newMessage = { ...message, id };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId,
    );
  }

  async createSubscription(
    subscription: Omit<Subscription, "id">,
  ): Promise<Subscription> {
    const id = this.currentId++;
    const newSubscription = { ...subscription, id };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(
    id: number,
    subscription: Partial<Omit<Subscription, "id">>,
  ): Promise<Subscription | undefined> {
    const existing = this.subscriptions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...subscription };
    this.subscriptions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();