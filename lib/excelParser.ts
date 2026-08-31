import * as XLSX from "xlsx";

import type {
  ExcelRow,
  DeliveryOrder,
  DeliveryItem,
} from "../types/delivery";

const STORE_PAYER_MAP: Record<
  string,
  {
    ds: string[];
    branch: string[];
  }
> = {
  Griya: {
    ds: ["21G050DS"],
    branch: ["21G05000"],
  },

  King: {
    ds: [],
    branch: ["21K03000"],
  },

  "Sumber Jaya": {
    ds: ["21S240DS"],
    branch: ["21S24000"],
  },

  "Niaga Raya": {
    ds: ["21N080DS"],
    branch: ["21N08000"],
  },
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

  return String(value)
    .trim()
    .replace(/\s+/g, " ");
}

function normalizePayer(
  value: unknown
): string {
  return normalizeString(value)
    .toUpperCase();
}

function parseExcelDate(
  value: unknown
): Date | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  // Excel serial number
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

  // Excel date object
  if (value instanceof Date) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  if (typeof value === "string") {
    const text = value.trim();

    // MM/DD/YYYY
    const usMatch = text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (usMatch) {
      const month = Number(
        usMatch[1]
      );

      const day = Number(
        usMatch[2]
      );

      const year = Number(
        usMatch[3]
      );

      return new Date(
        year,
        month - 1,
        day
      );
    }

    // DD-MM-YYYY / DD/MM/YYYY
    const localMatch = text.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
    );

    if (localMatch) {
      const first = Number(
        localMatch[1]
      );

      const second = Number(
        localMatch[2]
      );

      const year = Number(
        localMatch[3]
      );

      // Untuk format dengan "-"
      // kita anggap DD-MM-YYYY.
      if (text.includes("-")) {
        return new Date(
          year,
          second - 1,
          first
        );
      }

      // Untuk "/" kita anggap
      // DD/MM/YYYY bila valid.
      return new Date(
        year,
        second - 1,
        first
      );
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
    new Date(
      invoiceDate
    );

  // KHUSUS GRIYA CABANG
  if (
    payerCode ===
    "21G05000"
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
  const normalizedPayer =
    normalizePayer(
      payerCode
    );

  for (
    const [
      storeName,
      config,
    ] of Object.entries(
      STORE_PAYER_MAP
    )
  ) {
    if (
      config.ds.includes(
        normalizedPayer
      ) ||
      config.branch.includes(
        normalizedPayer
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
      cellDates: false,
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

  const grouped =
    new Map<
      string,
      DeliveryOrder
    >();

  for (
    const row of rows
  ) {
    const payerCode =
      normalizePayer(
        row.Payer
      );

    if (!payerCode) {
      continue;
    }

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

    /*
      IMPORTANT:
      Masukkan payer ke ID supaya
      DO dari DS dan branch tidak
      bisa tergabung menjadi satu.
    */
    const id =
      [
        storeName,
        payerCode,
        doNo,
        invoiceNo,
      ].join("-");

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

    // Simpan payer yang terkait
    if (
      !existing.payerCodes.includes(
        payerCode
      )
    ) {
      existing.payerCodes.push(
        payerCode
      );
    }

    // Jangan duplicate item
    if (
      material
    ) {
      const existingItem =
        existing.items.find(
          (item) =>
            item.material ===
            material
        );

      if (
        existingItem
      ) {
        existingItem.qty +=
          qty;
      } else {
        const item:
          DeliveryItem = {
          material,
          qty,
        };

        existing.items.push(
          item
        );
      }
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