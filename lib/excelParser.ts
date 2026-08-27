import * as XLSX from "xlsx";
import type {
  ExcelRow,
  DeliveryOrder,
  DeliveryItem,
} from "../types/delivery";

import { storeContacts } from "../data/storeContacts";

const STORE_PAYER_MAP: Record<
  string,
  string[]
> = {
  Griya: ["21G05000"],
  King: ["21K03000"],
  "Sumber Jaya": [
    "21S24000",
    "21S240DS",
  ],
  "Niaga Raya": ["21N08000"],
};

function normalizeString(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function parseExcelDate(
  value: unknown
): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    const parsed =
      XLSX.SSF.parse_date_code(value);

    if (!parsed) {
      return null;
    }

    return new Date(
      parsed.y,
      parsed.m - 1,
      parsed.d
    );
  }

  if (typeof value === "string") {
    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date;
    }
  }

  return null;
}

function formatDate(
  date: Date
): string {
  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const year =
    date.getFullYear();

  return `${year}-${month}-${day}`;
}

function calculateDoDate(
  payerCode: string,
  invoiceDate: Date
): Date {
  const result =
    new Date(invoiceDate);

  if (
    payerCode === "21G05000"
  ) {
    result.setDate(
      result.getDate() - 3
    );
  }

  return result;
}

function findStoreName(
  payerCode: string
): string | null {
  for (
    const [
      storeName,
      payerCodes,
    ] of Object.entries(
      STORE_PAYER_MAP
    )
  ) {
    if (
      payerCodes.includes(
        payerCode
      )
    ) {
      return storeName;
    }
  }

  return null;
}

export async function parseExcelFile(
  file: File
): Promise<DeliveryOrder[]> {
  const buffer =
    await file.arrayBuffer();

  const workbook =
    XLSX.read(buffer, {
      type: "array",
      cellDates: true,
    });

  const firstSheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];

  if (!firstSheet) {
    throw new Error(
      "Sheet Excel tidak ditemukan."
    );
  }

  const rows =
    XLSX.utils.sheet_to_json<ExcelRow>(
      firstSheet,
      {
        defval: "",
      }
    );

  const targetRows =
    rows.filter((row) => {
      const payerCode =
        normalizeString(
          row.Payer
        );

      return Boolean(
        findStoreName(
          payerCode
        )
      );
    });

  const grouped =
    new Map<
      string,
      DeliveryOrder
    >();

  for (
    const row of targetRows
  ) {
    const payerCode =
      normalizeString(
        row.Payer
      );

    const storeName =
      findStoreName(
        payerCode
      );

    if (!storeName) {
      continue;
    }

    const invoiceNo =
      normalizeString(
        row.Document
      );

    const doNo =
      normalizeString(
        row["DO. Doc."]
      );

    const salesDocNo =
      normalizeString(
        row["Sales Doc."]
      );

    const customerName =
      normalizeString(
        row["Name of Cust"]
      );

    const material =
      normalizeString(
        row.Material
      );

    const qty =
      Number(row.QTY) || 0;

    const invoiceDate =
      parseExcelDate(
        row["Bill. Date"]
      );

    if (!invoiceDate) {
      continue;
    }

    const doDate =
      calculateDoDate(
        payerCode,
        invoiceDate
      );

    const id =
      `${storeName}-${doNo}-${invoiceNo}`;

    let existing =
      grouped.get(id);

    if (!existing) {
      existing = {
        id,
        payerCode,
        payerCodes: [
          payerCode,
        ],
        storeName,
        customerName,
        invoiceNo,
        doNo,
        salesDocNo,
        invoiceDate:
          formatDate(
            invoiceDate
          ),
        doDate:
          formatDate(
            doDate
          ),
        items: [],
      };

      grouped.set(
        id,
        existing
      );
    }

    if (
      !existing.payerCodes.includes(
        payerCode
      )
    ) {
      existing.payerCodes.push(
        payerCode
      );
    }

    if (material) {
      const item: DeliveryItem =
        {
          material,
          qty,
        };

      existing.items.push(
        item
      );
    }
  }

  const deliveries =
    Array.from(
      grouped.values()
    );

  return deliveries.sort(
    (a, b) => {
      return (
        a.doDate.localeCompare(
          b.doDate
        ) ||
        a.storeName.localeCompare(
          b.storeName
        ) ||
        a.doNo.localeCompare(
          b.doNo
        )
      );
    }
  );
}