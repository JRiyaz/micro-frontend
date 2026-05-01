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
    {
      id: 9,
      name: "Smart Hydration Valve",
      category: "Industrial",
      price: 185,
      stock: 320,
      description: "Precision water flow management system with IoT connectivity.",
      image: "",
      supplierId: "SUP-004",
      warehouseId: "WH-003"
    },
    {
      id: 10,
      name: "Carbon Fiber Sheet",
      category: "Raw Materials",
      price: 120,
      stock: 150,
      description: "Lightweight, high-strength aerospace grade carbon fiber material.",
      image: "",
      supplierId: "SUP-002",
      warehouseId: "WH-002"
    },
    {
      id: 11,
      name: "Ultrasonic Leak Detector",
      category: "Electronics",
      price: 890,
      stock: 22,
      description: "Non-invasive diagnostic tool for identifying gas and liquid leaks.",
      image: "",
      supplierId: "SUP-001",
      warehouseId: "WH-001"
    },
    {
      id: 12,
      name: "High-Temp Lubricant",
      category: "Raw Materials",
      price: 45,
      stock: 1200,
      description: "Synthetic lubricant designed for extreme operating temperatures.",
      image: "",
      supplierId: "SUP-002",
      warehouseId: "WH-003"
    },
    {
      id: 13,
      name: "Modular Conveyor Belt",
      category: "Industrial",
      price: 2800,
      stock: 8,
      description: "Customizable assembly line component for automated logistics.",
      image: "",
      supplierId: "SUP-005",
      warehouseId: "WH-001"
    },
    {
      id: 14,
      name: "Infrared Vision Module",
      category: "Electronics",
      price: 640,
      stock: 45,
      description: "Thermal imaging sensor for security and process monitoring.",
      image: "",
      supplierId: "SUP-001",
      warehouseId: "WH-002"
    },
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
    {
      id: "ORD-2344",
      customer: "Apex Robotics",
      customerName: "Apex Robotics",
      status: "Processing",
      amount: 3200,
      totalAmount: 3200,
      date: "2024-04-01",
      priority: false,
      items: [
        { productId: 9, name: "Smart Hydration Valve", qty: 4, price: 185 },
        { productId: 11, name: "Ultrasonic Leak Detector", qty: 2, price: 890 },
      ],
    },
    {
      id: "ORD-2345",
      customer: "Starlight Aerospace",
      customerName: "Starlight Aerospace",
      status: "Pending",
      amount: 15400,
      totalAmount: 15400,
      date: "2024-04-02",
      priority: true,
      items: [
        { productId: 10, name: "Carbon Fiber Sheet", qty: 20, price: 120 },
        { productId: 13, name: "Modular Conveyor Belt", qty: 4, price: 2800 },
      ],
    },
    { id: "ORD-2346", customer: "Titan Manufacturing", customerName: "Titan Manufacturing", status: "Completed", amount: 6800, totalAmount: 6800, date: "2024-04-1", priority: false, items: [{ productId: 15, name: "Hydraulic Pump H1", qty: 2, price: 3400 }] },
    { id: "ORD-2347", customer: "Oceanic Energy", customerName: "Oceanic Energy", status: "Cancelled", amount: 1120, totalAmount: 1120, date: "2024-04-2", priority: false, items: [{ productId: 16, name: "Laser Range Finder", qty: 2, price: 560 }] },
    { id: "ORD-2348", customer: "Skyline Construction", customerName: "Skyline Construction", status: "Pending", amount: 420, totalAmount: 420, date: "2024-04-3", priority: false, items: [{ productId: 17, name: "Aluminum Ingot", qty: 2, price: 210 }] },
    { id: "ORD-2349", customer: "Green Leaf Tech", customerName: "Green Leaf Tech", status: "Processing", amount: 90, totalAmount: 90, date: "2024-04-4", priority: false, items: [{ productId: 18, name: "Relay Module 8-CH", qty: 2, price: 45 }] },
    { id: "ORD-2350", customer: "Pioneer Robotics", customerName: "Pioneer Robotics", status: "Completed", amount: 250, totalAmount: 250, date: "2024-04-5", priority: true, items: [{ productId: 19, name: "Conveyor Roller", qty: 2, price: 125 }] },
    { id: "ORD-2351", customer: "Ironclad Security", customerName: "Ironclad Security", status: "Cancelled", amount: 360, totalAmount: 360, date: "2024-04-6", priority: false, items: [{ productId: 20, name: "Voltage Regulator", qty: 2, price: 180 }] },
    { id: "ORD-2352", customer: "Velocity Motors", customerName: "Velocity Motors", status: "Pending", amount: 700, totalAmount: 700, date: "2024-04-7", priority: false, items: [{ productId: 21, name: "Copper Wiring 12AWG", qty: 2, price: 350 }] },
    { id: "ORD-2353", customer: "Stellar Networks", customerName: "Stellar Networks", status: "Processing", amount: 170, totalAmount: 170, date: "2024-04-8", priority: false, items: [{ productId: 22, name: "Pneumatic Valve V3", qty: 2, price: 85 }] },
    { id: "ORD-2354", customer: "Nova Chemicals", customerName: "Nova Chemicals", status: "Completed", amount: 2200, totalAmount: 2200, date: "2024-04-9", priority: false, items: [{ productId: 23, name: "Servo Motor 5kW", qty: 2, price: 1100 }] },
    { id: "ORD-2355", customer: "Summit Logistics", customerName: "Summit Logistics", status: "Cancelled", amount: 900, totalAmount: 900, date: "2024-04-10", priority: true, items: [{ productId: 24, name: "Industrial Magnet", qty: 2, price: 450 }] },
    { id: "ORD-2356", customer: "Deep Sea Mining", customerName: "Deep Sea Mining", status: "Pending", amount: 1900, totalAmount: 1900, date: "2024-04-11", priority: false, items: [{ productId: 25, name: "Silicon Wafer", qty: 2, price: 950 }] },
    { id: "ORD-2357", customer: "Aero Dynamics", customerName: "Aero Dynamics", status: "Processing", amount: 440, totalAmount: 440, date: "2024-04-12", priority: false, items: [{ productId: 26, name: "Digital Multimeter", qty: 2, price: 220 }] },
    { id: "ORD-2358", customer: "BioTech Solutions", customerName: "BioTech Solutions", status: "Completed", amount: 130, totalAmount: 130, date: "2024-04-13", priority: false, items: [{ productId: 27, name: "Heavy Duty Caster", qty: 2, price: 65 }] },
    { id: "ORD-2359", customer: "Solaris Power", customerName: "Solaris Power", status: "Cancelled", amount: 840, totalAmount: 840, date: "2024-04-14", priority: false, items: [{ productId: 28, name: "Exhaust Fan 24in", qty: 2, price: 420 }] },
    { id: "ORD-2360", customer: "Future Systems", customerName: "Future Systems", status: "Pending", amount: 30, totalAmount: 30, date: "2024-04-15", priority: true, items: [{ productId: 29, name: "Fiber Optic Cable", qty: 2, price: 15 }] },
    { id: "ORD-2361", customer: "Titan Manufacturing", customerName: "Titan Manufacturing", status: "Processing", amount: 560, totalAmount: 560, date: "2024-04-16", priority: false, items: [{ productId: 30, name: "Circuit Breaker 100A", qty: 2, price: 280 }] },
    { id: "ORD-2362", customer: "Oceanic Energy", customerName: "Oceanic Energy", status: "Completed", amount: 360, totalAmount: 360, date: "2024-04-17", priority: false, items: [{ productId: 31, name: "Hydraulic Fluid", qty: 2, price: 180 }] },
    { id: "ORD-2363", customer: "Skyline Construction", customerName: "Skyline Construction", status: "Cancelled", amount: 1780, totalAmount: 1780, date: "2024-04-18", priority: false, items: [{ productId: 32, name: "Welding Torch", qty: 2, price: 890 }] },
    { id: "ORD-2364", customer: "Green Leaf Tech", customerName: "Green Leaf Tech", status: "Pending", amount: 6800, totalAmount: 6800, date: "2024-04-19", priority: false, items: [{ productId: 15, name: "Hydraulic Pump H1", qty: 2, price: 3400 }] },
    { id: "ORD-2365", customer: "Pioneer Robotics", customerName: "Pioneer Robotics", status: "Processing", amount: 1120, totalAmount: 1120, date: "2024-04-20", priority: true, items: [{ productId: 16, name: "Laser Range Finder", qty: 2, price: 560 }] },
    { id: "ORD-2366", customer: "Ironclad Security", customerName: "Ironclad Security", status: "Completed", amount: 420, totalAmount: 420, date: "2024-04-21", priority: false, items: [{ productId: 17, name: "Aluminum Ingot", qty: 2, price: 210 }] },
    { id: "ORD-2367", customer: "Velocity Motors", customerName: "Velocity Motors", status: "Cancelled", amount: 90, totalAmount: 90, date: "2024-04-22", priority: false, items: [{ productId: 18, name: "Relay Module 8-CH", qty: 2, price: 45 }] },
    { id: "ORD-2368", customer: "Stellar Networks", customerName: "Stellar Networks", status: "Pending", amount: 250, totalAmount: 250, date: "2024-04-23", priority: false, items: [{ productId: 19, name: "Conveyor Roller", qty: 2, price: 125 }] },
    { id: "ORD-2369", customer: "Nova Chemicals", customerName: "Nova Chemicals", status: "Processing", amount: 360, totalAmount: 360, date: "2024-04-24", priority: false, items: [{ productId: 20, name: "Voltage Regulator", qty: 2, price: 180 }] },
    { id: "ORD-2370", customer: "Summit Logistics", customerName: "Summit Logistics", status: "Completed", amount: 700, totalAmount: 700, date: "2024-04-25", priority: true, items: [{ productId: 21, name: "Copper Wiring 12AWG", qty: 2, price: 350 }] },
    { id: "ORD-2371", customer: "Deep Sea Mining", customerName: "Deep Sea Mining", status: "Cancelled", amount: 170, totalAmount: 170, date: "2024-04-26", priority: false, items: [{ productId: 22, name: "Pneumatic Valve V3", qty: 2, price: 85 }] },
    { id: "ORD-2372", customer: "Aero Dynamics", customerName: "Aero Dynamics", status: "Pending", amount: 2200, totalAmount: 2200, date: "2024-04-27", priority: false, items: [{ productId: 23, name: "Servo Motor 5kW", qty: 2, price: 1100 }] },
    { id: "ORD-2373", customer: "BioTech Solutions", customerName: "BioTech Solutions", status: "Processing", amount: 900, totalAmount: 900, date: "2024-04-28", priority: false, items: [{ productId: 24, name: "Industrial Magnet", qty: 2, price: 450 }] },
    { id: "ORD-2374", customer: "Solaris Power", customerName: "Solaris Power", status: "Completed", amount: 1900, totalAmount: 1900, date: "2024-04-01", priority: false, items: [{ productId: 25, name: "Silicon Wafer", qty: 2, price: 950 }] },
    { id: "ORD-2375", customer: "Future Systems", customerName: "Future Systems", status: "Cancelled", amount: 440, totalAmount: 440, date: "2024-04-02", priority: true, items: [{ productId: 26, name: "Digital Multimeter", qty: 2, price: 220 }] },
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
    {
      id: 'CUST-004',
      name: 'Apex Robotics',
      email: 'engineering@apexrobotics.com',
      company: 'Apex Robotics',
      phone: '+1 (555) 222-3333',
      status: 'Active',
      joinDate: '2023-08-05'
    },
    {
      id: 'CUST-005',
      name: 'Starlight Aerospace',
      email: 'procurement@starlight.aero',
      company: 'Starlight Aerospace',
      phone: '+1 (555) 777-8888',
      status: 'Active',
      joinDate: '2023-11-12'
    },
    { id: 'CUST-006', name: 'Titan Manufacturing', email: 'procurement@titanmfg.com', company: 'Titan Manufacturing', phone: '+1 (555) 111-2222', status: 'Active', joinDate: '2023-12-01' },
    { id: 'CUST-007', name: 'Oceanic Energy', email: 'ops@oceanic.io', company: 'Oceanic Energy', phone: '+1 (555) 333-4444', status: 'Active', joinDate: '2024-01-10' },
    { id: 'CUST-008', name: 'Skyline Construction', email: 'bids@skyline.build', company: 'Skyline Construction', phone: '+1 (555) 555-6666', status: 'Active', joinDate: '2024-01-25' },
    { id: 'CUST-009', name: 'Green Leaf Tech', email: 'sustainability@greenleaf.com', company: 'Green Leaf Tech', phone: '+1 (555) 777-8888', status: 'Inactive', joinDate: '2024-02-05' },
    { id: 'CUST-010', name: 'Pioneer Robotics', email: 'lab@pioneer.ai', company: 'Pioneer Robotics', phone: '+1 (555) 999-0000', status: 'Active', joinDate: '2024-02-15' },
    { id: 'CUST-011', name: 'Ironclad Security', email: 'admin@ironclad.sec', company: 'Ironclad Security', phone: '+1 (555) 123-9876', status: 'Active', joinDate: '2024-03-01' },
    { id: 'CUST-012', name: 'Velocity Motors', email: 'parts@velocity.com', company: 'Velocity Motors', phone: '+1 (555) 456-7890', status: 'Active', joinDate: '2024-03-10' },
    { id: 'CUST-013', name: 'Stellar Networks', email: 'noc@stellar.net', company: 'Stellar Networks', phone: '+1 (555) 789-0123', status: 'Active', joinDate: '2024-03-20' },
    { id: 'CUST-014', name: 'Nova Chemicals', email: 'safety@nova.chem', company: 'Nova Chemicals', phone: '+1 (555) 012-3456', status: 'Active', joinDate: '2024-03-25' },
    { id: 'CUST-015', name: 'Summit Logistics', email: 'shipping@summit.log', company: 'Summit Logistics', phone: '+1 (555) 234-5678', status: 'Active', joinDate: '2024-03-28' },
    { id: 'CUST-016', name: 'Deep Sea Mining', email: 'exploration@deepsea.com', company: 'Deep Sea Mining', phone: '+1 (555) 345-6789', status: 'Inactive', joinDate: '2024-04-01' },
    { id: 'CUST-017', name: 'Aero Dynamics', email: 'design@aerodyn.io', company: 'Aero Dynamics', phone: '+1 (555) 456-7890', status: 'Active', joinDate: '2024-04-05' },
    { id: 'CUST-018', name: 'BioTech Solutions', email: 'lab@biotech.com', company: 'BioTech Solutions', phone: '+1 (555) 567-8901', status: 'Active', joinDate: '2024-04-10' },
    { id: 'CUST-019', name: 'Solaris Power', email: 'grid@solaris.en', company: 'Solaris Power', phone: '+1 (555) 678-9012', status: 'Active', joinDate: '2024-04-12' },
    { id: 'CUST-020', name: 'Future Systems', email: 'dev@futuresys.com', company: 'Future Systems', phone: '+1 (555) 789-0123', status: 'Active', joinDate: '2024-04-15' },
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
    {
      id: "SUP-004",
      name: "Fluid Dynamics Inc",
      category: "Industrial",
      email: "info@fluiddynamics.com",
      phone: "+1 415 555 0122",
      location: "San Francisco, US",
      status: "Active",
      reliability: 92,
    },
    {
      id: "SUP-005",
      name: "Modular Systems GmbH",
      category: "Industrial",
      email: "sales@modularsystems.de",
      phone: "+49 40 888999",
      location: "Munich, DE",
      status: "Active",
      reliability: 96,
    },
    { id: "SUP-006", name: "Heavy Metal Works", category: "Industrial", email: "sales@heavymetal.com", phone: "+1 412 555 1234", location: "Pittsburgh, US", status: "Active", reliability: 94 },
    { id: "SUP-007", name: "Circuit Masters", category: "Electronics", email: "info@circuitmasters.io", phone: "+886 2 23456789", location: "Taipei, TW", status: "Active", reliability: 97 },
    { id: "SUP-008", name: "Pure Elements", category: "Raw Materials", email: "mining@pureelements.au", phone: "+61 8 9123 4567", location: "Perth, AU", status: "Active", reliability: 91 },
    { id: "SUP-009", name: "Automation Pro", category: "Industrial", email: "support@autopro.com", phone: "+49 711 555 0101", location: "Stuttgart, DE", status: "Active", reliability: 95 },
    { id: "SUP-010", name: "Electro Supply", category: "Electronics", email: "orders@electrosupply.jp", phone: "+81 3 3456 7890", location: "Tokyo, JP", status: "Active", reliability: 93 },
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
    {
      id: "WH-003",
      name: "Pacific Rim Terminal",
      location: "Seattle, US",
      utilization: 28,
      totalCapacity: 25000,
      currentStock: 7000,
      zones: [
        { id: "Z-P1", name: "Primary Storage", description: "General Cargo" },
        { id: "Z-P2", name: "Climate Controlled", description: "Sensitive Electronics" },
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
    {
      id: "PO-4402",
      supplierId: "SUP-004",
      supplierName: "Fluid Dynamics Inc",
      status: "Draft",
      amount: 4500,
      date: "2024-04-02",
      items: [
        { productId: 9, name: "Smart Hydration Valve", qty: 25, price: 185 },
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
    {
      id: "MOV-902",
      productId: 10,
      type: "Inbound",
      qty: 150,
      fromLocation: "External Vendor",
      toLocation: "WH-002/Z-N1",
      date: "2024-04-01",
      reason: "Restock",
      user: "Warehouse Manager",
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
    },
    {
      id: "PAY-5005",
      orderId: "ORD-2344",
      amount: 3200,
      date: "2024-04-01",
      method: "Apple Pay",
      status: "Completed",
      transactionId: "ap_77b3..."
    },
    { id: "PAY-5100", orderId: "ORD-2346", amount: 6800, date: "2024-04-1", method: "Credit Card", status: "Completed", transactionId: "tx_abc123" },
    { id: "PAY-5101", orderId: "ORD-2347", amount: 1120, date: "2024-04-2", method: "PayPal", status: "Failed", transactionId: "tx_def456" },
    { id: "PAY-5102", orderId: "ORD-2348", amount: 420, date: "2024-04-3", method: "Bank Transfer", status: "Completed", transactionId: "tx_ghi789" },
    { id: "PAY-5103", orderId: "ORD-2349", amount: 90, date: "2024-04-4", method: "Stripe", status: "Completed", transactionId: "tx_jkl012" },
    { id: "PAY-5104", orderId: "ORD-2350", amount: 250, date: "2024-04-5", method: "Apple Pay", status: "Completed", transactionId: "tx_mno345" },
    { id: "PAY-5105", orderId: "ORD-2351", amount: 360, date: "2024-04-6", method: "Credit Card", status: "Failed", transactionId: "tx_pqr678" },
    { id: "PAY-5106", orderId: "ORD-2352", amount: 700, date: "2024-04-7", method: "PayPal", status: "Completed", transactionId: "tx_stu901" },
    { id: "PAY-5107", orderId: "ORD-2353", amount: 170, date: "2024-04-8", method: "Bank Transfer", status: "Completed", transactionId: "tx_vwx234" },
    { id: "PAY-5108", orderId: "ORD-2354", amount: 2200, date: "2024-04-9", method: "Stripe", status: "Completed", transactionId: "tx_yz0567" },
    { id: "PAY-5109", orderId: "ORD-2355", amount: 900, date: "2024-04-10", method: "Apple Pay", status: "Failed", transactionId: "tx_abc890" },
    { id: "PAY-5110", orderId: "ORD-2356", amount: 1900, date: "2024-04-11", method: "Credit Card", status: "Completed", transactionId: "tx_def123" },
    { id: "PAY-5111", orderId: "ORD-2357", amount: 440, date: "2024-04-12", method: "PayPal", status: "Completed", transactionId: "tx_ghi456" },
    { id: "PAY-5112", orderId: "ORD-2358", amount: 130, date: "2024-04-13", method: "Bank Transfer", status: "Completed", transactionId: "tx_jkl789" },
    { id: "PAY-5113", orderId: "ORD-2359", amount: 840, date: "2024-04-14", method: "Stripe", status: "Failed", transactionId: "tx_mno012" },
    { id: "PAY-5114", orderId: "ORD-2360", amount: 30, date: "2024-04-15", method: "Apple Pay", status: "Completed", transactionId: "tx_pqr345" },
    { id: "PAY-5115", orderId: "ORD-2361", amount: 560, date: "2024-04-16", method: "Credit Card", status: "Completed", transactionId: "tx_stu678" },
    { id: "PAY-5116", orderId: "ORD-2362", amount: 360, date: "2024-04-17", method: "PayPal", status: "Completed", transactionId: "tx_vwx901" },
    { id: "PAY-5117", orderId: "ORD-2363", amount: 1780, date: "2024-04-18", method: "Bank Transfer", status: "Failed", transactionId: "tx_yz0234" },
    { id: "PAY-5118", orderId: "ORD-2364", amount: 6800, date: "2024-04-19", method: "Stripe", status: "Completed", transactionId: "tx_abc567" },
    { id: "PAY-5119", orderId: "ORD-2365", amount: 1120, date: "2024-04-20", method: "Apple Pay", status: "Completed", transactionId: "tx_def890" },
    { id: "PAY-5120", orderId: "ORD-2366", amount: 420, date: "2024-04-21", method: "Credit Card", status: "Completed", transactionId: "tx_ghi123" },
    { id: "PAY-5121", orderId: "ORD-2367", amount: 90, date: "2024-04-22", method: "PayPal", status: "Failed", transactionId: "tx_jkl456" },
    { id: "PAY-5122", orderId: "ORD-2368", amount: 250, date: "2024-04-23", method: "Bank Transfer", status: "Completed", transactionId: "tx_mno789" },
    { id: "PAY-5123", orderId: "ORD-2369", amount: 360, date: "2024-04-24", method: "Stripe", status: "Completed", transactionId: "tx_pqr012" },
    { id: "PAY-5124", orderId: "ORD-2370", amount: 700, date: "2024-04-25", method: "Apple Pay", status: "Completed", transactionId: "tx_stu345" },
    { id: "PAY-5125", orderId: "ORD-2371", amount: 170, date: "2024-04-26", method: "Credit Card", status: "Failed", transactionId: "tx_vwx678" },
    { id: "PAY-5126", orderId: "ORD-2372", amount: 2200, date: "2024-04-27", method: "PayPal", status: "Completed", transactionId: "tx_yz0901" },
    { id: "PAY-5127", orderId: "ORD-2373", amount: 900, date: "2024-04-28", method: "Bank Transfer", status: "Completed", transactionId: "tx_abc234" },
    { id: "PAY-5128", orderId: "ORD-2374", amount: 1900, date: "2024-04-01", method: "Stripe", status: "Completed", transactionId: "tx_def567" },
    { id: "PAY-5129", orderId: "ORD-2375", amount: 440, date: "2024-04-02", method: "Apple Pay", status: "Failed", transactionId: "tx_ghi890" },
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
