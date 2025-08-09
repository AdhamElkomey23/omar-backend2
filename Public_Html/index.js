// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  products;
  sales;
  expenses;
  activityLogs;
  workers;
  storageItems;
  workerAttendance;
  salaryDeductions;
  userCounter;
  productCounter;
  saleCounter;
  expenseCounter;
  activityLogCounter;
  workerCounter;
  storageItemCounter;
  attendanceCounter;
  salaryDeductionCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.sales = /* @__PURE__ */ new Map();
    this.expenses = /* @__PURE__ */ new Map();
    this.activityLogs = /* @__PURE__ */ new Map();
    this.workers = /* @__PURE__ */ new Map();
    this.storageItems = /* @__PURE__ */ new Map();
    this.workerAttendance = /* @__PURE__ */ new Map();
    this.salaryDeductions = /* @__PURE__ */ new Map();
    this.userCounter = 1;
    this.productCounter = 1;
    this.saleCounter = 1;
    this.expenseCounter = 1;
    this.activityLogCounter = 1;
    this.workerCounter = 1;
    this.storageItemCounter = 1;
    this.attendanceCounter = 1;
    this.salaryDeductionCounter = 1;
    this.loadSeedData();
  }
  loadSeedData() {
    const user = {
      id: this.userCounter++,
      username: "admin",
      password: "admin123"
      // In a real app, this would be hashed
    };
    this.users.set(user.id, user);
    const sampleProducts = [
      { name: "NPK Fertilizer", unitPrice: 2500, stockQuantity: 150 },
      { name: "Urea", unitPrice: 1800, stockQuantity: 200 },
      { name: "Organic Compost", unitPrice: 1200, stockQuantity: 100 },
      { name: "Phosphate", unitPrice: 2200, stockQuantity: 80 },
      { name: "Potassium Nitrate", unitPrice: 3e3, stockQuantity: 60 }
    ];
    sampleProducts.forEach((prod) => {
      const product = {
        id: this.productCounter++,
        name: prod.name,
        unitPrice: prod.unitPrice,
        stockQuantity: prod.stockQuantity || 0,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.products.set(product.id, product);
    });
    const today = /* @__PURE__ */ new Date();
    const sampleSales = [
      { productId: 1, quantity: 20, totalAmount: 5e4, saleDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1e3) },
      { productId: 2, quantity: 15, totalAmount: 27e3, saleDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1e3) },
      { productId: 3, quantity: 10, totalAmount: 12e3, saleDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1e3) },
      { productId: 1, quantity: 25, totalAmount: 62500, saleDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1e3) },
      { productId: 4, quantity: 8, totalAmount: 17600, saleDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1e3) }
    ];
    const clients = [
      { name: "Green Valley Farms", contact: "+20 100 123 4567" },
      { name: "Nile Delta Agriculture Co.", contact: "+20 101 234 5678" },
      { name: "Cairo Agricultural Supplies", contact: "+20 102 345 6789" },
      { name: "Alexandria Fertilizer Trading", contact: "+20 103 456 7890" },
      { name: "Upper Egypt Farm Supply", contact: "+20 104 567 8901" }
    ];
    sampleSales.forEach((sale, index) => {
      const client = clients[index % clients.length];
      const newSale = {
        id: this.saleCounter++,
        productName: "Ammonium Nitrate",
        // Use actual storage item name
        quantity: sale.quantity,
        totalAmount: sale.totalAmount,
        saleDate: sale.saleDate,
        clientName: client.name,
        clientContact: client.contact,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.sales.set(newSale.id, newSale);
    });
    const sampleExpenses = [
      { name: "Electricity Bill", amount: 15e3, category: "Utilities", expenseDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1e3) },
      { name: "Worker Salaries", amount: 5e4, category: "Salaries", expenseDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1e3) },
      { name: "Equipment Repair", amount: 8e3, category: "Maintenance", expenseDate: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1e3) },
      { name: "Raw Materials", amount: 35e3, category: "RawMaterials", expenseDate: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1e3) },
      { name: "Transportation", amount: 12e3, category: "Transportation", expenseDate: new Date(today.getTime() - 18 * 24 * 60 * 60 * 1e3) }
    ];
    sampleExpenses.forEach((expense) => {
      const newExpense = {
        id: this.expenseCounter++,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        expenseDate: expense.expenseDate,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.expenses.set(newExpense.id, newExpense);
    });
    const sampleLogs = [
      { title: "Equipment Maintenance", description: "Mixer machine repaired", logDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1e3) },
      { title: "Inventory Check", description: "Monthly inventory verification completed", logDate: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1e3) },
      { title: "Process Improvement", description: "Implemented new mixing procedure for higher efficiency", logDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1e3) }
    ];
    sampleLogs.forEach((log2) => {
      const newLog = {
        id: this.activityLogCounter++,
        title: log2.title,
        description: log2.description,
        logDate: log2.logDate,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.activityLogs.set(newLog.id, newLog);
    });
    const dealers = [
      { name: "Global Chemical Industries", contact: "+20 120 555 0001" },
      { name: "Nile Valley Chemicals Ltd.", contact: "+20 122 555 0002" },
      { name: "Egyptian Raw Materials Co.", contact: "+20 121 555 0003" },
      { name: "Mediterranean Chemical Supply", contact: "+20 123 555 0004" },
      { name: "Cairo Chemical Trading", contact: "+20 124 555 0005" },
      { name: "Delta Mining & Chemicals", contact: "+20 125 555 0006" },
      { name: "Suez Industrial Supplies", contact: "+20 126 555 0007" }
    ];
    const sampleStorageItems = [
      { itemName: "Ammonium Nitrate", quantityInTons: 150, purchasePricePerTon: 350 },
      { itemName: "Potassium Chloride", quantityInTons: 120, purchasePricePerTon: 420 },
      { itemName: "Phosphoric Acid", quantityInTons: 80, purchasePricePerTon: 650 },
      { itemName: "Urea", quantityInTons: 200, purchasePricePerTon: 300 },
      { itemName: "Sulfuric Acid", quantityInTons: 95, purchasePricePerTon: 280 },
      { itemName: "Limestone", quantityInTons: 300, purchasePricePerTon: 45 },
      { itemName: "Potassium Sulfate", quantityInTons: 60, purchasePricePerTon: 580 }
    ];
    sampleStorageItems.forEach((item, index) => {
      const dealer = dealers[index % dealers.length];
      const purchaseDate = /* @__PURE__ */ new Date();
      purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 90));
      const newItem = {
        id: this.storageItemCounter++,
        itemName: item.itemName,
        quantityInTons: item.quantityInTons,
        purchasePricePerTon: item.purchasePricePerTon,
        dealerName: dealer.name,
        dealerContact: dealer.contact,
        purchaseDate: purchaseDate.toISOString().split("T")[0],
        createdAt: /* @__PURE__ */ new Date()
      };
      this.storageItems.set(newItem.id, newItem);
    });
  }
  // Product Methods
  async getAllProducts() {
    return Array.from(this.products.values());
  }
  async getProduct(id) {
    return this.products.get(id);
  }
  async createProduct(insertProduct) {
    const id = this.productCounter++;
    const product = {
      ...insertProduct,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.products.set(id, product);
    return product;
  }
  async updateProduct(id, productUpdate) {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return void 0;
    const updatedProduct = {
      ...existingProduct,
      ...productUpdate
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  async deleteProduct(id) {
    return this.products.delete(id);
  }
  // Sale Methods
  async getAllSales() {
    return Array.from(this.sales.values());
  }
  async getSalesByDateRange(startDate, endDate) {
    let filteredSales = Array.from(this.sales.values());
    if (startDate) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate);
        return saleDate >= startDate;
      });
    }
    if (endDate) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate);
        return saleDate <= endDate;
      });
    }
    return filteredSales.sort((a, b) => {
      const dateA = a.saleDate instanceof Date ? a.saleDate : new Date(a.saleDate);
      const dateB = b.saleDate instanceof Date ? b.saleDate : new Date(b.saleDate);
      return dateB.getTime() - dateA.getTime();
    });
  }
  async getSalesByProductId(productId) {
    return Array.from(this.sales.values()).filter((sale) => sale.productId === productId).sort((a, b) => {
      const dateA = a.saleDate instanceof Date ? a.saleDate : new Date(a.saleDate);
      const dateB = b.saleDate instanceof Date ? b.saleDate : new Date(b.saleDate);
      return dateB.getTime() - dateA.getTime();
    });
  }
  async createSale(insertSale) {
    const id = this.saleCounter++;
    const saleDate = insertSale.saleDate instanceof Date ? insertSale.saleDate : new Date(insertSale.saleDate);
    const sale = {
      ...insertSale,
      saleDate,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.sales.set(id, sale);
    const product = this.products.get(sale.productId);
    if (product) {
      this.products.set(product.id, {
        ...product,
        stockQuantity: product.stockQuantity - sale.quantity
      });
    }
    return sale;
  }
  async updateSale(id, saleUpdate) {
    const existingSale = this.sales.get(id);
    if (!existingSale) {
      return void 0;
    }
    const updatedSale = {
      ...existingSale,
      ...saleUpdate,
      saleDate: saleUpdate.saleDate ? new Date(saleUpdate.saleDate) : existingSale.saleDate,
      clientContact: saleUpdate.clientContact !== void 0 ? saleUpdate.clientContact : existingSale.clientContact
    };
    this.sales.set(id, updatedSale);
    return updatedSale;
  }
  async deleteSale(id) {
    return this.sales.delete(id);
  }
  // Expense Methods
  async getAllExpenses() {
    return Array.from(this.expenses.values());
  }
  async getExpensesByDateRange(startDate, endDate) {
    let filteredExpenses = Array.from(this.expenses.values());
    if (startDate) {
      filteredExpenses = filteredExpenses.filter((expense) => {
        const expenseDate = expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate);
        return expenseDate >= startDate;
      });
    }
    if (endDate) {
      filteredExpenses = filteredExpenses.filter((expense) => {
        const expenseDate = expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate);
        return expenseDate <= endDate;
      });
    }
    return filteredExpenses.sort((a, b) => {
      const dateA = a.expenseDate instanceof Date ? a.expenseDate : new Date(a.expenseDate);
      const dateB = b.expenseDate instanceof Date ? b.expenseDate : new Date(b.expenseDate);
      return dateB.getTime() - dateA.getTime();
    });
  }
  async getExpensesByCategory(category) {
    return Array.from(this.expenses.values()).filter((expense) => expense.category === category).sort((a, b) => {
      const dateA = a.expenseDate instanceof Date ? a.expenseDate : new Date(a.expenseDate);
      const dateB = b.expenseDate instanceof Date ? b.expenseDate : new Date(b.expenseDate);
      return dateB.getTime() - dateA.getTime();
    });
  }
  async createExpense(insertExpense) {
    const id = this.expenseCounter++;
    const expenseDate = insertExpense.expenseDate instanceof Date ? insertExpense.expenseDate : new Date(insertExpense.expenseDate);
    const expense = {
      ...insertExpense,
      expenseDate,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }
  async deleteExpense(id) {
    return this.expenses.delete(id);
  }
  // Activity Log Methods
  async getAllActivityLogs() {
    return Array.from(this.activityLogs.values());
  }
  async getActivityLogsByDateRange(startDate, endDate) {
    let filteredLogs = Array.from(this.activityLogs.values());
    if (startDate) {
      filteredLogs = filteredLogs.filter((log2) => {
        const logDate = log2.logDate instanceof Date ? log2.logDate : new Date(log2.logDate);
        return logDate >= startDate;
      });
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter((log2) => {
        const logDate = log2.logDate instanceof Date ? log2.logDate : new Date(log2.logDate);
        return logDate <= endDate;
      });
    }
    return filteredLogs.sort((a, b) => {
      const dateA = a.logDate instanceof Date ? a.logDate : new Date(a.logDate);
      const dateB = b.logDate instanceof Date ? b.logDate : new Date(b.logDate);
      return dateB.getTime() - dateA.getTime();
    });
  }
  async createActivityLog(insertLog) {
    const id = this.activityLogCounter++;
    const logDate = insertLog.logDate instanceof Date ? insertLog.logDate : new Date(insertLog.logDate);
    const log2 = {
      ...insertLog,
      logDate,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.activityLogs.set(id, log2);
    return log2;
  }
  async deleteActivityLog(id) {
    return this.activityLogs.delete(id);
  }
  // Dashboard Data Methods
  async getDashboardData(filter) {
    let filteredSales = Array.from(this.sales.values());
    let filteredExpenses = Array.from(this.expenses.values());
    if (filter?.startDate) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate);
        return saleDate >= filter.startDate;
      });
      filteredExpenses = filteredExpenses.filter((expense) => {
        const expenseDate = expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate);
        return expenseDate >= filter.startDate;
      });
    }
    if (filter?.endDate) {
      filteredSales = filteredSales.filter((sale) => {
        const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate);
        return saleDate <= filter.endDate;
      });
      filteredExpenses = filteredExpenses.filter((expense) => {
        const expenseDate = expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate);
        return expenseDate <= filter.endDate;
      });
    }
    if (filter?.productId) {
      filteredSales = filteredSales.filter((sale) => sale.productId === filter.productId);
    }
    if (filter?.category) {
      filteredExpenses = filteredExpenses.filter((expense) => expense.category === filter.category);
    }
    const totalIncome = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalIncome - totalExpenses;
    const productSales = /* @__PURE__ */ new Map();
    filteredSales.forEach((sale) => {
      const existing = productSales.get(sale.productId) || { totalSold: 0, totalRevenue: 0 };
      productSales.set(sale.productId, {
        totalSold: existing.totalSold + sale.quantity,
        totalRevenue: existing.totalRevenue + sale.totalAmount
      });
    });
    const topSellingProducts = Array.from(productSales.entries()).map(([productId, data]) => {
      const product = this.products.get(productId);
      return {
        productId,
        productName: product ? product.name : "Unknown Product",
        totalSold: data.totalSold,
        totalRevenue: data.totalRevenue
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
    const topExpenses = filteredExpenses.sort((a, b) => b.amount - a.amount).slice(0, 5).map((expense) => ({
      expenseName: expense.name,
      amount: expense.amount,
      category: expense.category
    }));
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let recentSales = filteredSales;
    let recentExpenses = filteredExpenses;
    if (!filter?.startDate && !filter?.endDate) {
      recentSales = recentSales.filter((sale) => {
        const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate);
        return saleDate >= sevenDaysAgo;
      });
      recentExpenses = recentExpenses.filter((expense) => {
        const expenseDate = expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate);
        return expenseDate >= sevenDaysAgo;
      });
    }
    const recentTransactions = [
      ...recentSales.map((sale) => {
        const product = this.products.get(sale.productId);
        const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate);
        return {
          id: sale.id,
          type: "sale",
          amount: sale.totalAmount,
          description: `Sale: ${product?.name || "Unknown Product"} (${sale.quantity} units)`,
          date: saleDate
        };
      }),
      ...recentExpenses.map((expense) => {
        const expenseDate = expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate);
        return {
          id: expense.id,
          type: "expense",
          amount: expense.amount,
          description: `Expense: ${expense.name} (${expense.category})`,
          date: expenseDate
        };
      })
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    return {
      totalIncome,
      totalExpenses,
      profit,
      topSellingProducts,
      topExpenses,
      recentTransactions
    };
  }
  // User Methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Workers Methods
  async getAllWorkers() {
    return Array.from(this.workers.values());
  }
  async getWorker(id) {
    return this.workers.get(id);
  }
  async createWorker(insertWorker) {
    const id = this.workerCounter++;
    const worker = {
      ...insertWorker,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.workers.set(id, worker);
    return worker;
  }
  async updateWorker(id, workerUpdate) {
    const existingWorker = this.workers.get(id);
    if (!existingWorker) {
      return void 0;
    }
    const updatedWorker = {
      ...existingWorker,
      ...workerUpdate
    };
    this.workers.set(id, updatedWorker);
    return updatedWorker;
  }
  async deleteWorker(id) {
    return this.workers.delete(id);
  }
  async getWorkersByDepartment(department) {
    return Array.from(this.workers.values()).filter((worker) => worker.department === department);
  }
  // Storage Items Methods
  async getAllStorageItems() {
    return Array.from(this.storageItems.values());
  }
  async getStorageItem(id) {
    return this.storageItems.get(id);
  }
  async createStorageItem(insertItem) {
    const id = this.storageItemCounter++;
    const purchaseDate = insertItem.purchaseDate instanceof Date ? insertItem.purchaseDate : new Date(insertItem.purchaseDate);
    const storageItem = {
      ...insertItem,
      purchaseDate: purchaseDate.toISOString().split("T")[0],
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.storageItems.set(id, storageItem);
    return storageItem;
  }
  async updateStorageItem(id, itemUpdate) {
    const existingItem = this.storageItems.get(id);
    if (!existingItem) {
      return void 0;
    }
    const updatedItem = {
      ...existingItem,
      ...itemUpdate
    };
    this.storageItems.set(id, updatedItem);
    return updatedItem;
  }
  async deleteStorageItem(id) {
    return this.storageItems.delete(id);
  }
  async deductStorageQuantity(itemName, quantity) {
    const items = Array.from(this.storageItems.values()).filter((item) => item.itemName === itemName);
    let remainingToDeduct = quantity;
    for (const item of items) {
      if (remainingToDeduct <= 0) break;
      if (item.quantityInTons >= remainingToDeduct) {
        const updatedItem = { ...item, quantityInTons: item.quantityInTons - remainingToDeduct };
        this.storageItems.set(item.id, updatedItem);
        remainingToDeduct = 0;
      } else {
        remainingToDeduct -= item.quantityInTons;
        const updatedItem = { ...item, quantityInTons: 0 };
        this.storageItems.set(item.id, updatedItem);
      }
    }
    return remainingToDeduct === 0;
  }
  async addStorageQuantity(itemName, quantity) {
    const items = Array.from(this.storageItems.values()).filter((item2) => item2.itemName === itemName);
    if (items.length === 0) {
      return false;
    }
    const item = items[0];
    const updatedItem = { ...item, quantityInTons: item.quantityInTons + quantity };
    this.storageItems.set(item.id, updatedItem);
    return true;
  }
  // Worker Attendance Methods
  async getWorkerAttendance(workerId, startDate, endDate) {
    const allAttendance = Array.from(this.workerAttendance.values());
    let filtered = allAttendance.filter((record) => record.workerId === workerId);
    if (startDate) {
      filtered = filtered.filter((record) => new Date(record.attendanceDate) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((record) => new Date(record.attendanceDate) <= endDate);
    }
    return filtered.sort((a, b) => new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime());
  }
  async getAllAttendanceByDate(date2) {
    const targetDate = date2.toISOString().split("T")[0];
    return Array.from(this.workerAttendance.values()).filter((record) => record.attendanceDate === targetDate).sort((a, b) => a.workerId - b.workerId);
  }
  async createAttendanceRecord(insertAttendance) {
    const id = this.attendanceCounter++;
    const attendance = {
      ...insertAttendance,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.workerAttendance.set(id, attendance);
    return attendance;
  }
  async updateAttendanceRecord(id, attendanceUpdate) {
    const existing = this.workerAttendance.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...attendanceUpdate
    };
    this.workerAttendance.set(id, updated);
    return updated;
  }
  async deleteAttendanceRecord(id) {
    return this.workerAttendance.delete(id);
  }
  async getWorkerMonthlySummary(workerId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const attendance = await this.getWorkerAttendance(workerId, startDate, endDate);
    let totalDaysWorked = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalHours = 0;
    let totalOvertimeHours = 0;
    attendance.forEach((record) => {
      switch (record.status) {
        case "present":
          totalDaysWorked++;
          break;
        case "absent":
          totalAbsent++;
          break;
        case "late":
          totalLate++;
          totalDaysWorked++;
          break;
        case "half-day":
          totalDaysWorked += 0.5;
          break;
      }
      totalHours += record.hoursWorked || 0;
      totalOvertimeHours += record.overtimeHours || 0;
    });
    const worker = await this.getWorker(workerId);
    let salaryDeductions2 = 0;
    if (worker) {
      const dailySalary = worker.salary / 30;
      salaryDeductions2 = totalAbsent * dailySalary + totalLate * dailySalary * 0.5;
    }
    return {
      totalDaysWorked,
      totalAbsent,
      totalLate,
      totalHours,
      totalOvertimeHours,
      salaryDeductions: salaryDeductions2
    };
  }
  // Salary Deductions Methods
  async getAllSalaryDeductions(workerId, month) {
    let deductions = Array.from(this.salaryDeductions.values());
    if (workerId) {
      deductions = deductions.filter((d) => d.workerId === workerId);
    }
    if (month) {
      deductions = deductions.filter((d) => d.month === month);
    }
    return deductions.sort((a, b) => new Date(b.deductionDate).getTime() - new Date(a.deductionDate).getTime());
  }
  async createSalaryDeduction(insertDeduction) {
    const id = this.salaryDeductionCounter++;
    const deduction = {
      ...insertDeduction,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.salaryDeductions.set(id, deduction);
    return deduction;
  }
  async updateSalaryDeduction(id, deductionUpdate) {
    const existing = this.salaryDeductions.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...deductionUpdate
    };
    this.salaryDeductions.set(id, updated);
    return updated;
  }
  async deleteSalaryDeduction(id) {
    return this.salaryDeductions.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, doublePrecision, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
var sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  // Changed from productId to productName
  quantity: integer("quantity").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  saleDate: date("sale_date").notNull(),
  clientName: text("client_name").notNull(),
  clientContact: text("client_contact"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
var expenseCategoryEnum = z.enum([
  "Utilities",
  "Salaries",
  "Maintenance",
  "RawMaterials",
  "Transportation",
  "Other"
]);
var expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(),
  // Will store ExpenseCategory values
  expenseDate: date("expense_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
var activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
var workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  salary: integer("salary").notNull(),
  hireDate: date("hire_date").notNull(),
  email: text("email"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  // active, inactive, terminated
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertWorkerSchema = createInsertSchema(workers).omit({ id: true, createdAt: true });
var dateRangeFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  productId: z.number().optional(),
  category: z.string().optional()
});
var storageItems = pgTable("storage_items", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  quantityInTons: doublePrecision("quantity_in_tons").notNull(),
  purchasePricePerTon: doublePrecision("purchase_price_per_ton").notNull(),
  dealerName: text("dealer_name").notNull(),
  dealerContact: text("dealer_contact"),
  purchaseDate: date("purchase_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertStorageItemSchema = createInsertSchema(storageItems).omit({ id: true, createdAt: true });
var workerAttendance = pgTable("worker_attendance", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").notNull(),
  attendanceDate: date("attendance_date").notNull(),
  checkInTime: text("check_in_time"),
  // Format: "HH:MM"
  checkOutTime: text("check_out_time"),
  // Format: "HH:MM"
  status: text("status").notNull(),
  // present, absent, late, half-day
  hoursWorked: doublePrecision("hours_worked").default(0),
  overtimeHours: doublePrecision("overtime_hours").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertWorkerAttendanceSchema = createInsertSchema(workerAttendance).omit({ id: true, createdAt: true });
var salaryDeductions = pgTable("salary_deductions", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").notNull(),
  month: text("month").notNull(),
  // Format: "YYYY-MM"
  amount: doublePrecision("amount").notNull(),
  reason: text("reason").notNull(),
  // absence, late, advance, penalty, insurance, other
  details: text("details"),
  deductionDate: date("deduction_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertSalaryDeductionSchema = createInsertSchema(salaryDeductions).omit({ id: true, createdAt: true });

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  const apiRouter = express.Router();
  apiRouter.get("/products", async (req, res) => {
    try {
      const products2 = await storage.getAllProducts();
      res.json(products2);
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
      const validatedData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(validatedData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
      const validatedData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, validatedData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/sales", async (req, res) => {
    try {
      const sales2 = await storage.getAllSales();
      res.json(sales2);
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
      const sales2 = await storage.getSalesByProductId(productId);
      res.json(sales2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales for product" });
    }
  });
  apiRouter.get("/sales/date-range", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const sales2 = await storage.getSalesByDateRange(startDate, endDate);
      res.json(sales2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales by date range" });
    }
  });
  apiRouter.post("/sales", async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      const newSale = await storage.createSale(validatedData);
      res.status(201).json(newSale);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
      const validatedData = insertSaleSchema.parse(req.body);
      const updatedSale = await storage.updateSale(id, validatedData);
      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(updatedSale);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/expenses", async (req, res) => {
    try {
      const expenses2 = await storage.getAllExpenses();
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  apiRouter.get("/expenses/category/:category", async (req, res) => {
    try {
      const expenses2 = await storage.getExpensesByCategory(req.params.category);
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses by category" });
    }
  });
  apiRouter.get("/expenses/date-range", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const expenses2 = await storage.getExpensesByDateRange(startDate, endDate);
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses by date range" });
    }
  });
  apiRouter.post("/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const newExpense = await storage.createExpense(validatedData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const logs = await storage.getActivityLogsByDateRange(startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs by date range" });
    }
  });
  apiRouter.post("/activity-logs", async (req, res) => {
    try {
      const validatedData = insertActivityLogSchema.parse(req.body);
      const newLog = await storage.createActivityLog(validatedData);
      res.status(201).json(newLog);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/dashboard", async (req, res) => {
    try {
      const filter = {};
      if (req.query.startDate) {
        filter.startDate = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.endDate = new Date(req.query.endDate);
      }
      if (req.query.productId) {
        filter.productId = parseInt(req.query.productId);
      }
      if (req.query.category) {
        filter.category = req.query.category;
      }
      const validatedFilter = dateRangeFilterSchema.parse(filter);
      const dashboardData = await storage.getDashboardData(validatedFilter);
      res.json(dashboardData);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  apiRouter.get("/workers", async (req, res) => {
    try {
      const department = req.query.department;
      const status = req.query.status;
      if (department && department !== "all") {
        const workers2 = await storage.getWorkersByDepartment(department);
        res.json(workers2);
      } else {
        const workers2 = await storage.getAllWorkers();
        res.json(workers2);
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
      const validatedData = insertWorkerSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const newWorker = await storage.createWorker(validatedData);
      console.log("Created worker:", newWorker);
      res.status(201).json(newWorker);
    } catch (error) {
      console.error("Worker creation error:", error);
      if (error instanceof z2.ZodError) {
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
      const validatedData = insertWorkerSchema.parse(req.body);
      const updatedWorker = await storage.updateWorker(id, validatedData);
      if (!updatedWorker) {
        return res.status(404).json({ message: "Worker not found" });
      }
      res.json(updatedWorker);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
  apiRouter.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({
        id: user.id,
        username: user.username,
        token: "dummy-token"
        // This would be a real JWT in a production app
      });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  apiRouter.get("/attendance/worker/:workerId", async (req, res) => {
    try {
      const workerId = parseInt(req.params.workerId);
      if (isNaN(workerId)) {
        return res.status(400).json({ message: "Invalid worker ID" });
      }
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const attendance = await storage.getWorkerAttendance(workerId, startDate, endDate);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worker attendance" });
    }
  });
  apiRouter.get("/attendance/date/:date", async (req, res) => {
    try {
      const date2 = new Date(req.params.date);
      if (isNaN(date2.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      const attendance = await storage.getAllAttendanceByDate(date2);
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/salary-deductions", async (req, res) => {
    try {
      const workerId = req.query.workerId ? parseInt(req.query.workerId) : void 0;
      const month = req.query.month;
      const deductions = await storage.getAllSalaryDeductions(workerId, month);
      res.json(deductions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch salary deductions" });
    }
  });
  apiRouter.post("/salary-deductions", async (req, res) => {
    try {
      const validatedData = insertSalaryDeductionSchema.parse(req.body);
      const newDeduction = await storage.createSalaryDeduction(validatedData);
      res.status(201).json(newDeduction);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid salary deduction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create salary deduction" });
    }
  });
  apiRouter.put("/salary-deductions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid salary deduction ID" });
      }
      const validatedData = insertSalaryDeductionSchema.partial().parse(req.body);
      const updatedDeduction = await storage.updateSalaryDeduction(id, validatedData);
      if (!updatedDeduction) {
        return res.status(404).json({ message: "Salary deduction not found" });
      }
      res.json(updatedDeduction);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid salary deduction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update salary deduction" });
    }
  });
  apiRouter.delete("/salary-deductions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid salary deduction ID" });
      }
      const success = await storage.deleteSalaryDeduction(id);
      if (!success) {
        return res.status(404).json({ message: "Salary deduction not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete salary deduction" });
    }
  });
  app2.use("/api", apiRouter);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
