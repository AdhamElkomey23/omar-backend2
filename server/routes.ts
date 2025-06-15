import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertSaleSchema, 
  insertExpenseSchema,
  insertActivityLogSchema,
  insertWorkerSchema,
  insertStorageItemSchema,
  insertWorkerAttendanceSchema,
  dateRangeFilterSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();
  
  // Products Routes
  apiRouter.get("/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  apiRouter.get("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  apiRouter.post("/products", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertProductSchema.parse(req.body);
      
      const newProduct = await storage.createProduct(validatedData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  apiRouter.put("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Partial validation of request body
      const validatedData = insertProductSchema.partial().parse(req.body);
      
      const updatedProduct = await storage.updateProduct(id, validatedData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  apiRouter.delete("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Sales Routes
  apiRouter.get("/sales", async (req, res) => {
    try {
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  apiRouter.get("/sales/product/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const sales = await storage.getSalesByProductId(productId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales for product" });
    }
  });

  apiRouter.get("/sales/date-range", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const sales = await storage.getSalesByDateRange(startDate, endDate);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales by date range" });
    }
  });

  apiRouter.post("/sales", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertSaleSchema.parse(req.body);
      
      const newSale = await storage.createSale(validatedData);
      res.status(201).json(newSale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  apiRouter.patch("/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sale ID" });
      }

      // Validate request body
      const validatedData = insertSaleSchema.parse(req.body);
      
      const updatedSale = await storage.updateSale(id, validatedData);
      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.json(updatedSale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sale" });
    }
  });

  apiRouter.delete("/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid sale ID" });
      }

      const success = await storage.deleteSale(id);
      if (!success) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Expenses Routes
  apiRouter.get("/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  apiRouter.get("/expenses/category/:category", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByCategory(req.params.category);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses by category" });
    }
  });

  apiRouter.get("/expenses/date-range", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const expenses = await storage.getExpensesByDateRange(startDate, endDate);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses by date range" });
    }
  });

  apiRouter.post("/expenses", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertExpenseSchema.parse(req.body);
      
      const newExpense = await storage.createExpense(validatedData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  apiRouter.delete("/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }

      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Activity Logs Routes
  apiRouter.get("/activity-logs", async (req, res) => {
    try {
      const logs = await storage.getAllActivityLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  apiRouter.get("/activity-logs/date-range", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const logs = await storage.getActivityLogsByDateRange(startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs by date range" });
    }
  });

  apiRouter.post("/activity-logs", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertActivityLogSchema.parse(req.body);
      
      const newLog = await storage.createActivityLog(validatedData);
      res.status(201).json(newLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity log" });
    }
  });

  apiRouter.delete("/activity-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid activity log ID" });
      }

      const success = await storage.deleteActivityLog(id);
      if (!success) {
        return res.status(404).json({ message: "Activity log not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity log" });
    }
  });

  // Dashboard Data Route
  apiRouter.get("/dashboard", async (req, res) => {
    try {
      const filter: any = {};

      // Parse date range
      if (req.query.startDate) {
        filter.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.endDate = new Date(req.query.endDate as string);
      }
      
      // Parse product filter
      if (req.query.productId) {
        filter.productId = parseInt(req.query.productId as string);
      }
      
      // Parse category filter
      if (req.query.category) {
        filter.category = req.query.category as string;
      }

      // Validate filter
      const validatedFilter = dateRangeFilterSchema.parse(filter);
      
      const dashboardData = await storage.getDashboardData(validatedFilter);
      res.json(dashboardData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Workers Routes
  apiRouter.get("/workers", async (req, res) => {
    try {
      const department = req.query.department as string;
      const status = req.query.status as string;
      
      if (department && department !== 'all') {
        const workers = await storage.getWorkersByDepartment(department);
        res.json(workers);
      } else {
        const workers = await storage.getAllWorkers();
        res.json(workers);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workers" });
    }
  });

  apiRouter.get("/workers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid worker ID" });
      }

      const worker = await storage.getWorker(id);
      if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
      }
      res.json(worker);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worker" });
    }
  });

  apiRouter.post("/workers", async (req, res) => {
    try {
      console.log("Creating worker with data:", req.body);
      // Validate request body
      const validatedData = insertWorkerSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      const newWorker = await storage.createWorker(validatedData);
      console.log("Created worker:", newWorker);
      res.status(201).json(newWorker);
    } catch (error) {
      console.error("Worker creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid worker data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create worker", error: error.message });
    }
  });

  apiRouter.put("/workers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid worker ID" });
      }

      // Validate request body
      const validatedData = insertWorkerSchema.parse(req.body);
      
      const updatedWorker = await storage.updateWorker(id, validatedData);
      if (!updatedWorker) {
        return res.status(404).json({ message: "Worker not found" });
      }
      
      res.json(updatedWorker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid worker data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update worker" });
    }
  });

  apiRouter.delete("/workers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid worker ID" });
      }

      const success = await storage.deleteWorker(id);
      if (!success) {
        return res.status(404).json({ message: "Worker not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete worker" });
    }
  });

  // Storage Items Routes
  apiRouter.get("/storage", async (req, res) => {
    try {
      const items = await storage.getAllStorageItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage items" });
    }
  });

  apiRouter.get("/storage/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid storage item ID" });
      }

      const item = await storage.getStorageItem(id);
      if (!item) {
        return res.status(404).json({ message: "Storage item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage item" });
    }
  });

  apiRouter.post("/storage", async (req, res) => {
    try {
      const validatedData = insertStorageItemSchema.parse(req.body);
      const newItem = await storage.createStorageItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid storage item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create storage item" });
    }
  });

  apiRouter.put("/storage/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid storage item ID" });
      }

      const validatedData = insertStorageItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateStorageItem(id, validatedData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Storage item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid storage item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update storage item" });
    }
  });

  apiRouter.delete("/storage/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid storage item ID" });
      }

      const success = await storage.deleteStorageItem(id);
      if (!success) {
        return res.status(404).json({ message: "Storage item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete storage item" });
    }
  });

  apiRouter.post("/storage/deduct", async (req, res) => {
    try {
      const { itemName, quantity } = req.body;
      
      if (!itemName || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid item name or quantity" });
      }

      const success = await storage.deductStorageQuantity(itemName, quantity);
      if (!success) {
        return res.status(400).json({ message: "Insufficient inventory" });
      }
      
      res.json({ success: true, message: "Inventory updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  apiRouter.post("/storage/add", async (req, res) => {
    try {
      const { itemName, quantity } = req.body;
      
      if (!itemName || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid item name or quantity" });
      }

      const success = await storage.addStorageQuantity(itemName, quantity);
      if (!success) {
        return res.status(400).json({ message: "Item not found in storage" });
      }
      
      res.json({ success: true, message: "Quantity added back successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add quantity to storage" });
    }
  });

  // Authentication Routes (simple for now)
  apiRouter.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple authentication for now
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we'd use JWT or sessions here
      res.json({ 
        id: user.id, 
        username: user.username,
        token: "dummy-token" // This would be a real JWT in a production app
      });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Worker Attendance Routes
  apiRouter.get("/attendance/worker/:workerId", async (req, res) => {
    try {
      const workerId = parseInt(req.params.workerId);
      if (isNaN(workerId)) {
        return res.status(400).json({ message: "Invalid worker ID" });
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const attendance = await storage.getWorkerAttendance(workerId, startDate, endDate);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worker attendance" });
    }
  });

  apiRouter.get("/attendance/date/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const attendance = await storage.getAllAttendanceByDate(date);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance by date" });
    }
  });

  apiRouter.post("/attendance", async (req, res) => {
    try {
      const validatedData = insertWorkerAttendanceSchema.parse(req.body);
      const newRecord = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(newRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  apiRouter.put("/attendance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid attendance record ID" });
      }

      const validatedData = insertWorkerAttendanceSchema.partial().parse(req.body);
      const updatedRecord = await storage.updateAttendanceRecord(id, validatedData);
      
      if (!updatedRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      res.json(updatedRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  apiRouter.delete("/attendance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid attendance record ID" });
      }

      const success = await storage.deleteAttendanceRecord(id);
      if (!success) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attendance record" });
    }
  });

  apiRouter.get("/attendance/summary/:workerId/:year/:month", async (req, res) => {
    try {
      const workerId = parseInt(req.params.workerId);
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      if (isNaN(workerId) || isNaN(year) || isNaN(month)) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const summary = await storage.getWorkerMonthlySummary(workerId, year, month);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly summary" });
    }
  });

  // Register API routes with prefix
  app.use("/api", apiRouter);

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
