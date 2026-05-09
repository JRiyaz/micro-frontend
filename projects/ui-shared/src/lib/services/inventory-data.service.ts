import { Injectable, signal, computed } from "@angular/core";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  supplierId?: string;
  warehouseId?: string;
  discount?: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  productId?: number;
  category?: string;
  expiryDate: string;
  image?: string;
  color?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  customerName?: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  amount: number;
  totalAmount?: number;
  date: string;
  priority: boolean;
  items: OrderItem[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  location?: string;
  status: "Active" | "Inactive";
  joinDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  location: string;
  status: "Active" | "Pending" | "Inactive";
  reliability: number; // 0-100
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  currentStock?: number;
  category?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  utilization: number;
  totalCapacity: number;
  currentStock: number;
  zones: Zone[];
  manager?: string;
  lastAudit?: string;
}

export interface PurchaseOrderItem {
  productId: number;
  name: string;
  qty: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: "Draft" | "Ordered" | "Received" | "Cancelled";
  amount: number;
  date: string;
  items: PurchaseOrderItem[];
}

export interface StockMovement {
  id: string;
  productId: number;
  type: "Transfer" | "Adjustment" | "Inbound" | "Outbound";
  qty: number;
  fromLocation: string;
  toLocation: string;
  date: string;
  reason?: string;
  user: string;
}

export interface Payment {
  id: string;
  orderId?: string;
  purchaseOrderId?: string;
  amount: number;
  date: string;
  method: "Credit Card" | "PayPal" | "Bank Transfer" | "Stripe" | "Apple Pay";
  status: "Pending" | "Completed" | "Refunded" | "Failed";
  transactionId: string;
}

@Injectable({
  providedIn: "root",
})
export class InventoryDataService {
  loading = signal(false);
  
  settings = signal({
    currency: "USD",
    taxRate: 15,
    lowStockThreshold: 20,
    companyName: "Industrial Core IMS",
    uom: ["Units", "Kilograms", "Litres", "Meters"],
  });

  private _products = signal<Product[]>([]);
  products = this._products.asReadonly();

  private _offers = signal<Offer[]>([]);
  offers = this._offers.asReadonly();

  private _orders = signal<Order[]>([]);
  orders = this._orders.asReadonly();

  private _customers = signal<Customer[]>([]);
  customers = this._customers.asReadonly();

  private _suppliers = signal<Supplier[]>([]);
  suppliers = this._suppliers.asReadonly();

  private _warehouses = signal<Warehouse[]>([]);
  warehouses = this._warehouses.asReadonly();

  private _purchaseOrders = signal<PurchaseOrder[]>([]);
  purchaseOrders = this._purchaseOrders.asReadonly();

  private _movements = signal<StockMovement[]>([]);
  movements = this._movements.asReadonly();

  private _payments = signal<Payment[]>([]);
  payments = this._payments.asReadonly();

  constructor() {
    this.loadFromStorage();
    if (this._products().length === 0) {
      this._products.set(this.generateProducts());
    }
    if (this._offers().length === 0) {
      this._offers.set(this.generateOffers());
    }
    if (this._orders().length === 0) {
      this._orders.set(this.generateOrders());
    }
    if (this._customers().length === 0) {
      this._customers.set(this.generateCustomers());
    }
    if (this._suppliers().length === 0) {
      this._suppliers.set(this.generateSuppliers());
    }
    if (this._warehouses().length === 0) {
      this._warehouses.set(this.generateWarehouses());
    }
    if (this._purchaseOrders().length === 0) {
      this._purchaseOrders.set(this.generatePurchaseOrders());
    }
    if (this._movements().length === 0) {
      this._movements.set(this.generateMovements());
    }
    if (this._payments().length === 0) {
      this._payments.set(this.generatePayments());
    }
  }

  private loadFromStorage() {
    const offers = localStorage.getItem("shopper_offers");
    if (offers) this._offers.set(JSON.parse(offers));
    
    const products = localStorage.getItem("shopper_products");
    if (products) this._products.set(JSON.parse(products));

    const orders = localStorage.getItem("shopper_orders");
    if (orders) this._orders.set(JSON.parse(orders));
  }

  private saveToStorage() {
    localStorage.setItem("shopper_offers", JSON.stringify(this._offers()));
    localStorage.setItem("shopper_products", JSON.stringify(this._products()));
    localStorage.setItem("shopper_orders", JSON.stringify(this._orders()));
  }

  // API Methods
  addOffer(offer: Offer) {
    this._offers.update(prev => [offer, ...prev]);
    this.saveToStorage();
  }

  addOrder(order: Order): void {
    this._orders.update(prev => [...prev, order]);
    this.saveToStorage();
  }

  addCustomer(customer: Customer): void {
    this._customers.update(prev => [...prev, customer]);
  }

  addProduct(product: Product): void {
    this._products.update(prev => [...prev, product]);
    this.saveToStorage();
  }

  addSupplier(supplier: Supplier): void {
    this._suppliers.update(prev => [...prev, supplier]);
  }

  addWarehouse(warehouse: Warehouse): void {
    this._warehouses.update(prev => [...prev, warehouse]);
  }

  updateProduct(product: Product): void {
    this._products.update(prev => prev.map(p => p.id === product.id ? product : p));
    this.saveToStorage();
  }

  updateOrder(order: Order): void {
    this._orders.update(prev => prev.map(o => o.id === order.id ? order : o));
    this.saveToStorage();
  }

  updateCustomer(customer: Customer): void {
    this._customers.update(prev => prev.map(c => c.id === customer.id ? customer : c));
  }

  updateSupplier(supplier: Supplier): void {
    this._suppliers.update(prev => prev.map(s => s.id === supplier.id ? supplier : s));
  }

  updateWarehouse(warehouse: Warehouse): void {
    this._warehouses.update(prev => prev.map(w => w.id === warehouse.id ? warehouse : w));
  }

  getProduct(id: number): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  getOrdersForCustomer(customerName: string): Order[] {
    return this.orders().filter(o => o.customer === customerName);
  }

  getOrdersForProduct(productId: number): Order[] {
    return this.orders().filter((order) =>
      order.items.some((item) => item.productId === productId),
    );
  }

  getCustomerIdByName(name: string): string | undefined {
    if (!name) return undefined;
    const searchName = name.trim().toLowerCase();
    return this.customers().find((c) => c.name.trim().toLowerCase() === searchName)?.id;
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers().find(s => s.id === id);
  }

  getWarehouseById(id: string): Warehouse | undefined {
    return this.warehouses().find(w => w.id === id);
  }

  getPaymentsByOrderId(orderId: string): Payment[] {
    return this.payments().filter(p => p.orderId === orderId);
  }

  getPurchaseOrdersBySupplier(supplierId: string): PurchaseOrder[] {
    return this.purchaseOrders().filter(po => po.supplierId === supplierId);
  }

  // Mock Data Generators
  private generateProducts(): Product[] {
    return [
      { id: 1, name: "Precision Logic Controller", category: "Industrial", price: 1240, stock: 45, description: "High-speed automated processing unit with dual redundancy support.", supplierId: "SUP-001", warehouseId: "WH-001", discount: 15 },
      { id: 2, name: "Thermal Flux Sensor", category: "Electronics", price: 450, stock: 120, description: "Advanced temperature monitoring with ±0.1°C precision accuracy.", supplierId: "SUP-001", warehouseId: "WH-001", discount: 10 },
      { id: 3, name: "Reinforced Steel Alloy", category: "Raw Materials", price: 89, stock: 2500, description: "High-tensile strength industrial grade steel for structural components.", supplierId: "SUP-002", warehouseId: "WH-002" },
      { id: 4, name: "Quantum Circuit Breaker", category: "Electronics", price: 2100, stock: 12, description: "Next-gen energy protection system with instant isolation capabilities.", supplierId: "SUP-001", warehouseId: "WH-001", discount: 20 },
      { id: 5, name: "Pneumatic Actuator X5", category: "Industrial", price: 670, stock: 88, description: "Heavy-duty air pressure driven mechanical movement system.", supplierId: "SUP-002", warehouseId: "WH-002" },
      { id: 6, name: "Industrial Grade Coolant", category: "Raw Materials", price: 150, stock: 430, description: "Non-corrosive heat dissipation fluid for high-temperature machinery.", supplierId: "SUP-002", warehouseId: "WH-001" },
      { id: 7, name: "Logic Gate Array V2", category: "Electronics", price: 320, stock: 15, description: "Programmable logic controller for complex sequence automation.", supplierId: "SUP-001", warehouseId: "WH-001", discount: 30 },
      { id: 8, name: "Heavy Duty Gear Box", category: "Industrial", price: 4500, stock: 5, description: "Ultra-durable transmission system for mining and heavy lifting.", supplierId: "SUP-002", warehouseId: "WH-002" },
      { id: 9, name: "Smart Hydration Valve", category: "Industrial", price: 185, stock: 320, description: "Precision water flow management system with IoT connectivity.", supplierId: "SUP-004", warehouseId: "WH-003", discount: 10 },
      { id: 10, name: "Carbon Fiber Sheet", category: "Raw Materials", price: 120, stock: 150, description: "Lightweight, high-strength aerospace grade carbon fiber material.", supplierId: "SUP-002", warehouseId: "WH-002" },
      { id: 11, name: "Ultrasonic Leak Detector", category: "Electronics", price: 890, stock: 22, description: "Non-invasive diagnostic tool for identifying gas and liquid leaks.", supplierId: "SUP-001", warehouseId: "WH-001", discount: 15 },
      { id: 12, name: "High-Temp Lubricant", category: "Raw Materials", price: 45, stock: 1200, description: "Synthetic lubricant designed for extreme operating temperatures.", supplierId: "SUP-002", warehouseId: "WH-003" },
      { id: 13, name: "Modular Conveyor Belt", category: "Industrial", price: 2800, stock: 8, description: "Customizable assembly line component for automated logistics.", supplierId: "SUP-005", warehouseId: "WH-001" },
      { id: 14, name: "Infrared Vision Module", category: "Electronics", price: 640, stock: 45, description: "Thermal imaging sensor for security and process monitoring.", supplierId: "SUP-001", warehouseId: "WH-002" },
      { id: 15, name: "Hydraulic Pump H1", category: "Industrial", price: 3400, stock: 15, description: "High-pressure hydraulic pump for heavy industrial machinery.", supplierId: "SUP-002", warehouseId: "WH-001" },
      { id: 16, name: "Laser Range Finder", category: "Electronics", price: 560, stock: 85, description: "Precision laser distance measurement tool with ±1mm accuracy.", supplierId: "SUP-001", warehouseId: "WH-002" },
      { id: 17, name: "Aluminum Ingot", category: "Raw Materials", price: 210, stock: 3500, description: "99.9% pure aluminum ingots for casting and manufacturing.", supplierId: "SUP-002", warehouseId: "WH-002" },
      { id: 18, name: "Relay Module 8-CH", category: "Electronics", price: 45, stock: 450, description: "8-channel relay board for low-voltage signal control.", supplierId: "SUP-001", warehouseId: "WH-001" },
      { id: 19, name: "Conveyor Roller", category: "Industrial", price: 125, stock: 200, description: "Heavy-duty steel roller for industrial conveyor systems.", supplierId: "SUP-005", warehouseId: "WH-001" },
      { id: 20, name: "Voltage Regulator", category: "Electronics", price: 180, stock: 65, description: "Automatic voltage stabilizer for sensitive electronic equipment.", supplierId: "SUP-001", warehouseId: "WH-003" },
      { id: 21, name: "Copper Wiring 12AWG", category: "Raw Materials", price: 350, stock: 120, description: "High-conductivity copper wire for industrial electrical installations.", supplierId: "SUP-002", warehouseId: "WH-002" },
      { id: 22, name: "Pneumatic Valve V3", category: "Industrial", price: 85, stock: 140, description: "Quick-response air valve for pneumatic automation systems.", supplierId: "SUP-004", warehouseId: "WH-003" },
      { id: 23, name: "Servo Motor 5kW", category: "Electronics", price: 1100, stock: 18, description: "High-torque servo motor for CNC and robotic applications.", supplierId: "SUP-001", warehouseId: "WH-001" },
      { id: 24, name: "Industrial Magnet", category: "Industrial", price: 450, stock: 30, description: "Powerful permanent magnet for lifting and separation tasks.", supplierId: "SUP-002", warehouseId: "WH-002" },
      { id: 25, name: "Silicon Wafer", category: "Raw Materials", price: 950, stock: 60, description: "High-purity silicon wafers for semiconductor manufacturing.", supplierId: "SUP-001", warehouseId: "WH-001" },
      { id: 26, name: "Digital Multimeter", category: "Electronics", price: 220, stock: 110, description: "Professional grade multimeter with auto-ranging and data logging.", supplierId: "SUP-001", warehouseId: "WH-003" },
      { id: 27, name: "Heavy Duty Caster", category: "Industrial", price: 65, stock: 300, description: "Durable swivel caster for industrial carts and machinery.", supplierId: "SUP-005", warehouseId: "WH-001" },
      { id: 28, name: "Exhaust Fan 24in", category: "Industrial", price: 420, stock: 25, description: "High-capacity industrial exhaust fan for ventilation systems.", supplierId: "SUP-004", warehouseId: "WH-002" },
      { id: 29, name: "Fiber Optic Cable", category: "Raw Materials", price: 15, stock: 5000, description: "Single-mode fiber optic cable for high-speed data transmission.", supplierId: "SUP-001", warehouseId: "WH-001" },
      { id: 30, name: "Circuit Breaker 100A", category: "Electronics", price: 280, stock: 40, description: "Three-phase circuit breaker for industrial power distribution.", supplierId: "SUP-001", warehouseId: "WH-003" },
      { id: 31, name: "Hydraulic Fluid", category: "Raw Materials", price: 180, stock: 450, description: "Anti-wear hydraulic oil for high-pressure systems.", supplierId: "SUP-002", warehouseId: "WH-003" },
      { id: 32, name: "Welding Torch", category: "Industrial", price: 890, stock: 12, description: "Professional TIG welding torch with ergonomic grip.", supplierId: "SUP-002", warehouseId: "WH-002" },
    ];
  }

  private generateOffers(): Offer[] {
    return [
      { id: "OFFER-1", title: "Summer Industrial Expo", description: "20% off all Electronics and Sensors this week only.", discount: 20, category: "Electronics", expiryDate: "2026-08-31", color: "#9333ea" },
      { id: "OFFER-2", title: "Precision Tools Special", description: "Save 15% on high-precision machining tools for bulk orders.", discount: 15, productId: 1, expiryDate: "2026-06-15", color: "#3b82f6" },
      { id: "OFFER-3", title: "Warehouse Clearance", description: "Massive 50% discount on raw materials to clear shelf space.", discount: 50, category: "Raw Materials", expiryDate: "2026-05-20", color: "#ef4444" }
    ];
  }

  private generateOrders(): Order[] {
    return [
      { id: "ORD-2341", customer: "TechNexus Industries", customerName: "TechNexus Industries", status: "Processing", amount: 45200, totalAmount: 45200, date: "2024-03-28", priority: true, items: [{ productId: 1, name: "Precision Logic Controller", qty: 2, price: 1240 }, { productId: 2, name: "Thermal Flux Sensor", qty: 12, price: 450 }] },
      { id: "ORD-2342", customer: "Global Logistics Co", customerName: "Global Logistics Co", status: "Pending", amount: 12450, totalAmount: 12450, date: "2024-03-27", priority: false, items: [{ productId: 5, name: "Pneumatic Actuator X5", qty: 5, price: 670 }, { productId: 6, name: "Industrial Grade Coolant", qty: 10, price: 150 }] },
      { id: "ORD-2343", customer: "Quantum Systems", customerName: "Quantum Systems", status: "Completed", amount: 89000, totalAmount: 89000, date: "2024-03-25", priority: true, items: [{ productId: 4, name: "Quantum Circuit Breaker", qty: 1, price: 2100 }, { productId: 7, name: "Logic Gate Array V2", qty: 3, price: 320 }] },
    ];
  }

  private generateCustomers(): Customer[] {
    return [
      { id: 'CUST-001', name: 'TechNexus Industries', email: 'contact@technexus.com', company: 'TechNexus Industries', phone: '+1 (555) 012-3456', status: 'Active', joinDate: '2023-01-15' },
      { id: 'CUST-002', name: 'Global Logistics Co', email: 'ops@globallogistics.com', company: 'Global Logistics Co', phone: '+1 (555) 987-6543', status: 'Active', joinDate: '2023-03-22' },
    ];
  }

  private generateSuppliers(): Supplier[] {
    return [
      { id: "SUP-001", name: "TechNova Solutions", category: "Electronics", email: "sales@technova.com", phone: "+49 30 123456", location: "Berlin, DE", status: "Active", reliability: 98 },
      { id: "SUP-002", name: "Industrial Steel Co", category: "Raw Materials", email: "orders@indsteel.co", phone: "+1 312 555 0199", location: "Chicago, US", status: "Active", reliability: 95 },
    ];
  }

  private generateWarehouses(): Warehouse[] {
    return [
      { id: "WH-001", name: "Main Distribution Center", location: "Frankfurt, DE", utilization: 82, totalCapacity: 15000, currentStock: 12300, zones: [{ id: "Z-A1", name: "Zone A1", description: "Electronics & Sensors" }] },
    ];
  }

  private generatePurchaseOrders(): PurchaseOrder[] {
    return [
      { id: "PO-4401", supplierId: "SUP-001", supplierName: "TechNova Solutions", status: "Ordered", amount: 15600, date: "2024-03-30", items: [{ productId: 2, name: "Thermal Flux Sensor", qty: 30, price: 450 }] },
    ];
  }

  private generateMovements(): StockMovement[] {
    return [
      { id: "MOV-901", productId: 3, type: "Transfer", qty: 500, fromLocation: "WH-001/Z-B2", toLocation: "WH-002/Z-N1", date: "2024-03-31", reason: "Inventory Rebalancing", user: "System Admin" },
    ];
  }

  private generatePayments(): Payment[] {
    return [
      { id: "PAY-5001", orderId: "ORD-2341", amount: 45200, date: "2024-03-29", method: "Stripe", status: "Completed", transactionId: "ch_3Oly..." },
    ];
  }
}
