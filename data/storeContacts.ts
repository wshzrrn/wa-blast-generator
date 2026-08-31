// ======================================================
// STORE CONTACT MASTER
// ======================================================

export interface StoreContact {
  // Nama pendek yang dipakai di website
  storeName: string;

  // Nama yang benar-benar muncul di Excel
  excelCustomerName: string;

  // Sapaan PIC
  salutation: string;

  // Nama PIC
  picName: string;

  // Nomor WhatsApp PIC
  whatsapp: string;

  // Email PIC
  email: string;

  // Payer untuk Pusat → Toko
  dsPayerCodes: string[];

  // Payer untuk Pusat → Cabang
  branchPayerCodes: string[];
}

export const storeContacts: Record<
  string,
  StoreContact
> = {
  Griya: {
    storeName:
      "Griya",

    excelCustomerName:
      "CV. GRIYA INDAH SEJAHTERA",

    salutation:
      "Mba",

    picName:
      "PIC Griya",

    whatsapp:
      "6281351572961",

    // GANTI dengan email asli PIC Griya
    email:
      "picgriya@example.com",

    dsPayerCodes: [
      "21G050DS",
    ],

    branchPayerCodes: [
      "21G05000",
    ],
  },

  King: {
    storeName:
      "King",

    excelCustomerName:
      "CV. KING ELECTRONIC",

    salutation:
      "Mas",

    picName:
      "PIC King",

    whatsapp:
      "6281234567891",

    // GANTI dengan email asli PIC King
    email:
      "pick ing@example.com".replace(
        " ",
        ""
      ),

    dsPayerCodes: [],

    branchPayerCodes: [
      "21K03000",
    ],
  },

  "Sumber Jaya": {
    storeName:
      "Sumber Jaya",

    excelCustomerName:
      "CV. SUMBER JAYA",

    salutation:
      "Mba",

    picName:
      "PIC Sumber Jaya",

    whatsapp:
      "6281234567892",

    // GANTI dengan email asli PIC Sumber Jaya
    email:
      "picsumberjaya@example.com",

    dsPayerCodes: [
      "21S240DS",
    ],

    branchPayerCodes: [
      "21S24000",
    ],
  },

  "Niaga Raya": {
    storeName:
      "Niaga Raya",

    excelCustomerName:
      "PT. NIAGA RAYA",

    salutation:
      "Mas",

    picName:
      "PIC Niaga Raya",

    whatsapp:
      "6281234567893",

    // GANTI dengan email asli PIC Niaga Raya
    email:
      "picniagaraya@example.com",

    dsPayerCodes: [
      "21N080DS",
    ],

    branchPayerCodes: [
      "21N08000",
    ],
  },
};