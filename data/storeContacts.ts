export interface StoreContact {
  storeName: string;
  payerCodes: string[];
  picName: string;
  whatsapp: string;
}

export const storeContacts: Record<
  string,
  StoreContact
> = {
  Griya: {
    storeName: "Griya",
    payerCodes: ["21G05000"],
    picName: "PIC Griya",
    whatsapp: "6281351572961",
  },

  King: {
    storeName: "King",
    payerCodes: ["21K03000"],
    picName: "PIC King",
    whatsapp: "6281234567891",
  },

  "Sumber Jaya": {
    storeName: "Sumber Jaya",
    payerCodes: [
      "21S24000",
      "21S240DS",
    ],
    picName: "PIC Sumber Jaya",
    whatsapp: "6281234567892",
  },

  "Niaga Raya": {
    storeName: "Niaga Raya",
    payerCodes: ["21N08000"],
    picName: "PIC Niaga Raya",
    whatsapp: "6281234567893",
  },
};