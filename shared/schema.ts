import { pgTable, text, serial, integer, doublePrecision, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Sales Table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(), // Changed from productId to productName
  quantity: integer("quantity").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  saleDate: date("sale_date").notNull(),
  clientName: text("client_name").notNull(),
  clientContact: text("client_contact"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// For the insert schema, we need to handle dates properly
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = {
  id: number;
  productName: string; // Changed from productId to productName
  quantity: number;
  totalAmount: number;
  saleDate: Date;
  clientName: string;
  clientContact: string | null;
  createdAt: Date;
};

// Expense Categories Enum
export const expenseCategoryEnum = z.enum([
  "Utilities",
  "Salaries",
  "Maintenance",
  "RawMaterials",
  "Transportation",
  "Other"
]);

export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;

// Expenses Table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(), // Will store ExpenseCategory values
  expenseDate: date("expense_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = {
  id: number;
  name: string;
  amount: number;
  category: string;
  expenseDate: Date;
  createdAt: Date;
};

// Activity Logs Table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = {
  id: number;
  title: string;
  description: string;
  logDate: Date;
  createdAt: Date;
};

// Workers table
export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  salary: integer("salary").notNull(),
  hireDate: date("hire_date").notNull(),
  email: text("email"),
  phone: text("phone"),
  status: text("status").notNull().default("active"), // active, inactive, terminated
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkerSchema = createInsertSchema(workers).omit({ id: true, createdAt: true });
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;

// Dashboard Filter Schema (for client-side only)
export const dateRangeFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  productId: z.number().optional(),
  category: z.string().optional(),
});

export type DateRangeFilter = z.infer<typeof dateRangeFilterSchema>;

// Storage Items Table
export const storageItems = pgTable("storage_items", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  quantityInTons: doublePrecision("quantity_in_tons").notNull(),
  purchasePricePerTon: doublePrecision("purchase_price_per_ton").notNull(),
  dealerName: text("dealer_name").notNull(),
  dealerContact: text("dealer_contact"),
  purchaseDate: date("purchase_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStorageItemSchema = createInsertSchema(storageItems).omit({ id: true, createdAt: true });
export type InsertStorageItem = z.infer<typeof insertStorageItemSchema>;
export type StorageItem = typeof storageItems.$inferSelect;

// Worker Attendance Table
export const workerAttendance = pgTable("worker_attendance", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").notNull(),
  attendanceDate: date("attendance_date").notNull(),
  checkInTime: text("check_in_time"), // Format: "HH:MM"
  checkOutTime: text("check_out_time"), // Format: "HH:MM"
  status: text("status").notNull(), // present, absent, late, half-day
  hoursWorked: doublePrecision("hours_worked").default(0),
  overtimeHours: doublePrecision("overtime_hours").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkerAttendanceSchema = createInsertSchema(workerAttendance).omit({ id: true, createdAt: true });
export type InsertWorkerAttendance = z.infer<typeof insertWorkerAttendanceSchema>;
export type WorkerAttendance = typeof workerAttendance.$inferSelect;
