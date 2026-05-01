import { Injectable, signal } from "@angular/core";

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
  // System Settings
  settings = signal({
    currency: "USD",
    taxRate: 15,
    lowStockThreshold: 20,
    companyName: "Industrial Core IMS",
    uom: ["Units", "Kilograms", "Litres", "Meters"],
  });

  products = signal<Product[]>([
    {
      id: 1,
      name: "Precision Logic Controller",
      category: "Industrial",
      price: 1240,
      stock: 45,
      description: "High-speed automated processing unit with dual redundancy support.",
      image: "",
      supplierId: "SUP-001",
      warehouseId: "WH-001"
    },
    {
      id: 2,
      name: "Thermal Flux Sensor",
      category: "Electronics",
      price: 450,
      stock: 120,
      description: "Advanced temperature monitoring with ±0.1°C precision accuracy.",
      image: "",
      supplierId: "SUP-001",
      warehouseId: "WH-001"
    },
    {
      id: 3,
      name: "Reinforced Steel Alloy",
      category: "Raw Materials",
      price: 89,
      stock: 2500,
      description: "High-tensile strength industrial grade steel for structural components.",
      image: "",
      supplierId: "SUP-002",
      warehouseId: "WH-002"
    },
    {
      id: 4,
      name: "Quantum Circuit Breaker",
      category: "Electronics",
      price: 2100,
      stock: 12,
      description: "Next-gen energy protection system with instant isolation capabilities.",
      image: "",
      supplierId: "SUP-001",
      warehouseId: "WH-001"
    },
    {
      id: 5,
      name: "Pneumatic Actuator X5",
      category: "Industrial",
      price: 670,
      stock: 88,
      description: "Heavy-duty air pressure driven mechanical movement system.",
      image: "",
      supplierId: "SUP-002",
      warehouseId: "WH-002"
    },
    {
      id: 6,
      name: "Industrial Grade Coolant",
      category: "Raw Materials",
      price: 150,
      stock: 430,
      description: "Non-corrosive heat dissipation fluid for high-temperature machinery.",
      image: "",
      supplierId: "SUP-002",
      warehouseId: "WH-001"
    },
    {
      id: 7,
      name: "Logic Gate Array V2",
      category: "Electronics",
      price: 320,
      stock: 15,
      description: "Programmable logic controller for complex sequence automation.",
      image: "",
      supplierId: "SUP-001",
      warehouseId: "WH-001"
    },
    {
      id: 8,
      name: "Heavy Duty Gear Box",
      category: "Industrial",
      price: 4500,
      stock: 5,
      description: "Ultra-durable transmission system for mining and heavy lifting.",
      image: "",
      supplierId: "SUP-002",
      warehouseId: "WH-002"
    },
  ]);

  orders = signal<Order[]>([
    {
      id: "ORD-2341",
      customer: "TechNexus Industries",
      customerName: "TechNexus Industries",
      status: "Processing",
      amount: 45200,
      totalAmount: 45200,
      date: "2024-03-28",
      priority: true,
      items: [
        { productId: 1, name: "Precision Logic Controller", qty: 2, price: 1240 },
        { productId: 2, name: "Thermal Flux Sensor", qty: 12, price: 450 },
      ],
    },
    {
      id: "ORD-2342",
      customer: "Global Logistics Co",
      customerName: "Global Logistics Co",
      status: "Pending",
      amount: 12450,
      totalAmount: 12450,
      date: "2024-03-27",
      priority: false,
      items: [
        { productId: 5, name: "Pneumatic Actuator X5", qty: 5, price: 670 },
        { productId: 6, name: "Industrial Grade Coolant", qty: 10, price: 150 },
      ],
    },
    {
      id: "ORD-2343",
      customer: "Quantum Systems",
      customerName: "Quantum Systems",
      status: "Completed",
      amount: 89000,
      totalAmount: 89000,
      date: "2024-03-25",
      priority: true,
      items: [
        { productId: 4, name: "Quantum Circuit Breaker", qty: 1, price: 2100 },
        { productId: 7, name: "Logic Gate Array V2", qty: 3, price: 320 },
      ],
    },
  ]);

  customers = signal<Customer[]>([
    {
      id: 'CUST-001',
      name: 'TechNexus Industries',
      email: 'contact@technexus.com',
      company: 'TechNexus Industries',
      phone: '+1 (555) 012-3456',
      status: 'Active',
      joinDate: '2023-01-15'
    },
    {
      id: 'CUST-002',
      name: 'Global Logistics Co',
      email: 'ops@globallogistics.com',
      company: 'Global Logistics Co',
      phone: '+1 (555) 987-6543',
      status: 'Active',
      joinDate: '2023-03-22'
    },
    {
      id: 'CUST-003',
      name: 'Quantum Systems',
      email: 'support@quantumsys.io',
      company: 'Quantum Systems',
      phone: '+1 (555) 444-5555',
      status: 'Active',
      joinDate: '2023-06-10'
    },
  ]);

  suppliers = signal<Supplier[]>([
    {
      id: "SUP-001",
      name: "TechNova Solutions",
      category: "Electronics",
      email: "sales@technova.com",
      phone: "+49 30 123456",
      location: "Berlin, DE",
      status: "Active",
      reliability: 98,
    },
    {
      id: "SUP-002",
      name: "Industrial Steel Co",
      category: "Raw Materials",
      email: "orders@indsteel.co",
      phone: "+1 312 555 0199",
      location: "Chicago, US",
      status: "Active",
      reliability: 95,
    },
    {
      id: "SUP-003",
      name: "Global Logistics Ltd",
      category: "Services",
      email: "support@globallog.net",
      phone: "+44 20 7946 0000",
      location: "London, UK",
      status: "Pending",
      reliability: 88,
    },
  ]);

  warehouses = signal<Warehouse[]>([
    {
      id: "WH-001",
      name: "Main Distribution Center",
      location: "Frankfurt, DE",
      utilization: 82,
      totalCapacity: 15000,
      currentStock: 12300,
      zones: [
        { id: "Z-A1", name: "Zone A1", description: "Electronics & Sensors" },
        { id: "Z-B2", name: "Zone B2", description: "Heavy Machinery" },
      ],
    },
    {
      id: "WH-002",
      name: "North-Side Hub",
      location: "Hamburg, DE",
      utilization: 45,
      totalCapacity: 8000,
      currentStock: 3600,
      zones: [
        { id: "Z-N1", name: "North Loading", description: "Incoming Raw Materials" },
      ],
    },
  ]);

  purchaseOrders = signal<PurchaseOrder[]>([
    {
      id: "PO-4401",
      supplierId: "SUP-001",
      supplierName: "TechNova Solutions",
      status: "Ordered",
      amount: 15600,
      date: "2024-03-30",
      items: [
        { productId: 2, name: "Thermal Flux Sensor", qty: 30, price: 450 },
        { productId: 7, name: "Logic Gate Array V2", qty: 5, price: 320 },
      ],
    },
  ]);

  movements = signal<StockMovement[]>([
    {
      id: "MOV-901",
      productId: 3,
      type: "Transfer",
      qty: 500,
      fromLocation: "WH-001/Z-B2",
      toLocation: "WH-002/Z-N1",
      date: "2024-03-31",
      reason: "Inventory Rebalancing",
      user: "System Admin",
    },
  ]);

  payments = signal<Payment[]>([
    {
      id: "PAY-5001",
      orderId: "ORD-2341",
      amount: 45200,
      date: "2024-03-29",
      method: "Stripe",
      status: "Completed",
      transactionId: "ch_3Oly..."
    },
    {
      id: "PAY-5002",
      orderId: "ORD-2342",
      amount: 12450,
      date: "2024-03-28",
      method: "Bank Transfer",
      status: "Pending",
      transactionId: "bt_9Xk2..."
    },
    {
      id: "PAY-5003",
      orderId: "ORD-2343",
      amount: 89000,
      date: "2024-03-26",
      method: "Credit Card",
      status: "Completed",
      transactionId: "cc_44a1..."
    },
    {
      id: "PAY-5004",
      amount: 5600,
      date: "2024-03-31",
      method: "PayPal",
      status: "Failed",
      transactionId: "pp_err_0"
    }
  ]);

  // Helper Methods
  getOrdersForProduct(productId: number): Order[] {
    return this.orders().filter((order) =>
      order.items.some((item) => item.productId === productId),
    );
  }

  getProductQuantityInOrder(productId: number, orderId: string): number {
    const order = this.orders().find((o) => o.id === orderId);
    if (!order) return 0;
    const item = order.items.find((i) => i.productId === productId);
    return item ? item.qty : 0;
  }

  getOrdersForCustomer(customerName: string): Order[] {
    return this.orders().filter(o => o.customer === customerName);
  }

  getCustomerIdByName(name: string): string | undefined {
    if (!name) return undefined;
    const searchName = name.trim().toLowerCase();
    return this.customers().find((c) => c.name.trim().toLowerCase() === searchName)?.id;
  }

  addOrder(order: Order): void {
    this.orders.update(prev => [...prev, order]);
  }

  addCustomer(customer: Customer): void {
    this.customers.update(prev => [...prev, customer]);
  }

  addProduct(product: Product): void {
    this.products.update(prev => [...prev, product]);
  }

  addSupplier(supplier: Supplier): void {
    this.suppliers.update(prev => [...prev, supplier]);
  }

  addWarehouse(warehouse: Warehouse): void {
    this.warehouses.update(prev => [...prev, warehouse]);
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
}
