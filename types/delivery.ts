export interface ExcelRow {
  Payer?: string;
  "Name of Cust"?: string;
  Document?: string | number;
  "DO. Doc."?: string | number;
  "Sales Doc."?: string | number;
  Material?: string;
  QTY?: number;
  GROSS?: number;
  Discount?: number;
  "Bill. Date"?: string | Date | number;
}

export interface DeliveryItem {
  material: string;
  qty: number;
}

export interface DeliveryOrder {
  id: string;
  payerCode: string;
  payerCodes: string[];
  storeName: string;
  customerName: string;
  invoiceNo: string;
  doNo: string;
  salesDocNo: string;
  invoiceDate: string;
  doDate: string;
  items: DeliveryItem[];
}