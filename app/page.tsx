"use client";

import {
  ChangeEvent,
  useMemo,
  useState,
} from "react";

import * as XLSX from "xlsx";

import {
  storeContacts,
} from "../data/storeContacts";

// ======================================================
// TYPES
// ======================================================

type ShipmentType =
  | "ds"
  | "branch";

type DOData = {
  id: string;
  toko: string;
  payer: string;
  noDO: string;
  billDate: string;
  rawBillDate: Date | null;
};

// ======================================================
// NORMALIZE
// ======================================================

const normalizeText = (
  value: unknown
): string => {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
};

const normalizePayer = (
  value: unknown
): string => {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
};

// ======================================================
// DATE FORMAT
// ======================================================

const formatDate = (
  date: Date
): string => {
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

  return `${day}-${month}-${year}`;
};

const formatLongDate = (
  date: Date
): string => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// ======================================================
// PARSE EXCEL DATE
// ======================================================

const parseExcelDate = (
  value: unknown
): Date | null => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  // Excel serial number
  if (
    typeof value ===
    "number"
  ) {
    const parsed =
      XLSX.SSF.parse_date_code(
        value
      );

    if (!parsed) {
      return null;
    }

    return new Date(
      parsed.y,
      parsed.m - 1,
      parsed.d
    );
  }

  // Excel Date object
  if (
    value instanceof Date
  ) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  if (
    typeof value ===
    "string"
  ) {
    const text =
      value.trim();

    // MM/DD/YYYY
    // Example:
    // 08/23/2026
    const usMatch =
      text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );

    if (usMatch) {
      const month =
        Number(
          usMatch[1]
        );

      const day =
        Number(
          usMatch[2]
        );

      const year =
        Number(
          usMatch[3]
        );

      return new Date(
        year,
        month - 1,
        day
      );
    }

    // DD-MM-YYYY
    const dashMatch =
      text.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      );

    if (dashMatch) {
      const day =
        Number(
          dashMatch[1]
        );

      const month =
        Number(
          dashMatch[2]
        );

      const year =
        Number(
          dashMatch[3]
        );

      return new Date(
        year,
        month - 1,
        day
      );
    }
  }

  return null;
};

// ======================================================
// SPECIAL BLAST DATE
//
// ONLY:
// Griya + 21G05000
// Bill Date - 3 days
// ======================================================

const getBlastDate = (
  tokoKey: string,
  payer: string,
  rawBillDate: Date
): Date => {
  const normalizedPayer =
    normalizePayer(
      payer
    );

  const isGriyaBranch =
    tokoKey ===
      "Griya" &&
    normalizedPayer ===
      "21G05000";

  if (
    !isGriyaBranch
  ) {
    return new Date(
      rawBillDate
    );
  }

  const result =
    new Date(
      rawBillDate
    );

  result.setDate(
    result.getDate() - 3
  );

  return result;
};

// ======================================================
// STORE LIST
// ======================================================

const STORE_KEYS =
  Object.keys(
    storeContacts
  );

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Home() {
  const [
    data,
    setData,
  ] =
    useState<DOData[]>(
      []
    );

  const [
    selectedToko,
    setSelectedToko,
  ] = useState("");

  const [
    shipmentType,
    setShipmentType,
  ] =
    useState<ShipmentType>(
      "ds"
    );

  // Selection global.
  // Tidak hilang saat pindah DS / Branch.
  const [
    selectedDO,
    setSelectedDO,
  ] = useState<string[]>(
    []
  );

  const [
    greetingTime,
    setGreetingTime,
  ] =
    useState("siang");

  // Message terakhir tetap hidup
  // saat user crosscheck tab.
  const [
    message,
    setMessage,
  ] = useState("");

  // ======================================================
  // SELECTED STORE
  // ======================================================

  const selectedStore =
    selectedToko
      ? storeContacts[
          selectedToko
        ]
      : undefined;

  // ======================================================
  // UPLOAD EXCEL
  // ======================================================

  const handleFileUpload =
    async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      try {
        const buffer =
          await file.arrayBuffer();

        const workbook =
          XLSX.read(
            buffer,
            {
              type: "array",
              cellDates: false,
            }
          );

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
          XLSX.utils.sheet_to_json<any>(
            firstSheet,
            {
              defval: "",
            }
          );

        // ==================================================
        // PARSE ROWS
        // ==================================================

        const parsedRows: DOData[] =
          [];

        rows.forEach(
          (
            row,
            index
          ) => {
            const excelCustomerName =
              normalizeText(
                row[
                  "Name of Cust"
                ]
              );

            const payer =
              normalizePayer(
                row[
                  "Payer"
                ]
              );

            const noDO =
              String(
                row[
                  "DO. Doc."
                ] ?? ""
              ).trim();

            const rawBillDate =
              parseExcelDate(
                row[
                  "Bill. Date"
                ]
              );

            if (
              !excelCustomerName ||
              !payer ||
              !noDO ||
              !rawBillDate
            ) {
              return;
            }

            // ==================================================
            // FIND STORE BERDASARKAN EXCEL CUSTOMER NAME
            // ==================================================

            const storeEntry =
              STORE_KEYS.find(
                (
                  key
                ) =>
                  normalizeText(
                    storeContacts[
                      key
                    ]
                      .excelCustomerName
                  ) ===
                  excelCustomerName
              );

            if (!storeEntry) {
              return;
            }

            const store =
              storeContacts[
                storeEntry
              ];

            // ==================================================
            // PASTIKAN PAYER MEMANG TERDAFTAR
            // DI STORE MASTER
            // ==================================================

            const allPayers = [
              ...store.dsPayerCodes,
              ...store.branchPayerCodes,
            ].map(
              normalizePayer
            );

            if (
              !allPayers.includes(
                payer
              )
            ) {
              return;
            }

            // ==================================================
            // UNIQUE ID
            // ==================================================

            const id = [
              storeEntry,
              payer,
              noDO,
              formatDate(
                rawBillDate
              ),
              index,
            ].join(
              "-"
            );

            parsedRows.push({
              id,
              toko:
                storeEntry,
              payer,
              noDO,
              billDate:
                formatDate(
                  rawBillDate
                ),
              rawBillDate,
            });
          }
        );

        // ==================================================
        // DEDUPLICATE
        // ==================================================

        const uniqueMap =
          new Map<
            string,
            DOData
          >();

        parsedRows.forEach(
          (
            row
          ) => {
            const key = [
              row.toko,
              row.payer,
              row.noDO,
              row.billDate,
            ].join(
              "|"
            );

            if (
              !uniqueMap.has(
                key
              )
            ) {
              uniqueMap.set(
                key,
                row
              );
            }
          }
        );

        const formattedData =
          Array.from(
            uniqueMap.values()
          ).sort(
            (
              a,
              b
            ) =>
              a.billDate.localeCompare(
                b.billDate
              ) ||
              a.toko.localeCompare(
                b.toko
              ) ||
              a.noDO.localeCompare(
                b.noDO
              )
          );

        setData(
          formattedData
        );

        setSelectedToko(
          ""
        );

        setShipmentType(
          "ds"
        );

        setSelectedDO(
          []
        );

        setMessage(
          ""
        );

        console.log(
          "Parsed Excel:",
          formattedData
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        alert(
          "File Excel gagal dibaca."
        );
      }
    };

  // ======================================================
  // AVAILABLE SHIPMENT TYPES
  // ======================================================

  const availableShipmentTypes =
    useMemo(() => {
      if (
        !selectedStore
      ) {
        return {
          ds: false,
          branch: false,
        };
      }

      return {
        ds:
          selectedStore
            .dsPayerCodes
            .length >
          0,

        branch:
          selectedStore
            .branchPayerCodes
            .length >
          0,
      };
    }, [
      selectedStore,
    ]);

  // ======================================================
  // CURRENT VISIBLE DO
  // ======================================================

  const tokoDO =
    useMemo(() => {
      if (
        !selectedStore
      ) {
        return [];
      }

      const payerCodes =
        shipmentType ===
        "ds"
          ? selectedStore.dsPayerCodes
          : selectedStore.branchPayerCodes;

      const allowedPayers =
        payerCodes.map(
          normalizePayer
        );

      return data.filter(
        (
          item
        ) => {
          const sameStore =
            item.toko ===
            selectedToko;

          const correctPayer =
            allowedPayers.includes(
              normalizePayer(
                item.payer
              )
            );

          return (
            sameStore &&
            correctPayer
          );
        }
      );
    }, [
      data,
      selectedStore,
      selectedToko,
      shipmentType,
    ]);

  // ======================================================
  // ALL DO FROM CURRENT STORE
  //
  // Digunakan untuk Generate Message.
  // DS + Branch bisa digabung.
  // ======================================================

  const allStoreDO =
    useMemo(() => {
      if (
        !selectedToko
      ) {
        return [];
      }

      return data.filter(
        (
          item
        ) =>
          item.toko ===
          selectedToko
      );
    }, [
      data,
      selectedToko,
    ]);

  // ======================================================
  // SELECT ALL STATE
  // ======================================================

  const allVisibleDOSelected =
    tokoDO.length >
      0 &&
    tokoDO.every(
      (
        row
      ) =>
        selectedDO.includes(
          row.id
        )
    );

  // ======================================================
  // TOGGLE SINGLE DO
  // ======================================================

  const toggleDO = (
    id: string
  ) => {
    setSelectedDO(
      (
        current
      ) =>
        current.includes(
          id
        )
          ? current.filter(
              (
                item
              ) =>
                item !==
                id
            )
          : [
              ...current,
              id,
            ]
    );
  };

  // ======================================================
  // SELECT ALL
  // ======================================================

  const toggleAllDO = () => {
    const visibleIds =
      tokoDO.map(
        (
          row
        ) =>
          row.id
      );

    if (
      visibleIds.length ===
      0
    ) {
      return;
    }

    if (
      allVisibleDOSelected
    ) {
      setSelectedDO(
        (
          current
        ) =>
          current.filter(
            (
              id
            ) =>
              !visibleIds.includes(
                id
              )
          )
      );
    } else {
      setSelectedDO(
        (
          current
        ) => [
          ...new Set([
            ...current,
            ...visibleIds,
          ]),
        ]
      );
    }
  };

  // ======================================================
  // GENERATE MESSAGE
  // ======================================================

  const generateMessage =
    () => {
      if (
        !selectedStore
      ) {
        alert(
          "Pilih toko terlebih dahulu."
        );

        return;
      }

      if (
        selectedDO.length ===
        0
      ) {
        alert(
          "Checklist minimal satu DO."
        );

        return;
      }

      // IMPORTANT:
      // Ambil dari SEMUA DO TOKO.
      // Jadi DS + Branch bisa satu message.
      const selectedRows =
        allStoreDO.filter(
          (
            row
          ) =>
            selectedDO.includes(
              row.id
            )
        );

      if (
        selectedRows.length ===
        0
      ) {
        alert(
          "DO yang dipilih tidak ditemukan."
        );

        return;
      }

      // ==================================================
      // GROUP BY BLAST DATE
      // ==================================================

      const grouped =
        new Map<
          string,
          {
            blastDate: Date;
            rows: DOData[];
          }
        >();

      selectedRows.forEach(
        (
          row
        ) => {
          if (
            !row.rawBillDate
          ) {
            return;
          }

          const blastDate =
            getBlastDate(
              row.toko,
              row.payer,
              row.rawBillDate
            );

          const key =
            formatDate(
              blastDate
            );

          if (
            !grouped.has(
              key
            )
          ) {
            grouped.set(
              key,
              {
                blastDate,
                rows: [],
              }
            );
          }

          grouped
            .get(key)!
            .rows.push(
              row
            );
        }
      );

      // ==================================================
      // MESSAGE BODY
      // ==================================================

      let doText =
        "";

      Array.from(
        grouped.values()
      ).forEach(
        (
          group
        ) => {
          group.rows.forEach(
            (
              row
            ) => {
              doText +=
                `${row.noDO}\n`;
            }
          );

          doText +=
            `Tanggal ${formatLongDate(
              group.blastDate
            )}\n\n`;
        }
      );

      const generated =
        `Selamat ${greetingTime} ${selectedStore.salutation} ${selectedStore.picName}

Kami dari bagian Admin PT SHARP Samarinda mau mengonfirmasi pengiriman barang dengan nomor DO:

${doText}Apakah barang diterima sesuai dengan perincian pada DO di atas. Sambil menunggu konfirmasi balik, kami ucapkan terima kasih atas kerja samanya.`;

      setMessage(
        generated
      );
    };

  // ======================================================
  // COPY
  // ======================================================

  const copyMessage =
    async () => {
      if (!message) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          message
        );

        alert(
          "Pesan berhasil dicopy! ✅"
        );
      } catch {
        alert(
          "Pesan gagal dicopy."
        );
      }
    };

  // ======================================================
  // WHATSAPP
  // ======================================================

  const sendToWhatsApp =
    () => {
      if (
        !message ||
        !selectedStore
      ) {
        return;
      }

      const phone =
        selectedStore.whatsapp.replace(
          /\D/g,
          ""
        );

      const url =
        `https://wa.me/${phone}?text=${encodeURIComponent(
          message
        )}`;

      window.open(
        url,
        "_blank"
      );
    };

  // ======================================================
  // EMAIL
  // ======================================================

  const sendToEmail =
    () => {
      if (
        !message ||
        !selectedStore
      ) {
        return;
      }

      const subject =
        `Konfirmasi Pengiriman DO - ${selectedStore.storeName}`;

      const url =
        `mailto:${selectedStore.email}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(
          message
        )}`;

      window.location.href =
        url;
    };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <main className="min-h-screen bg-[#f7f5f2] px-6 py-10">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-8">

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8c7b6a]">
            Admin Tool
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#2f2924]">
            WhatsApp Blast Generator
          </h1>

          <p className="mt-3 text-[#756b63]">
            Pilih DO yang ingin dikonfirmasi dan buat pesan WhatsApp secara otomatis.
          </p>

        </header>

        {/* UPLOAD */}
        <section className="rounded-3xl border border-[#e8e0d8] bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-[#2f2924]">
                Upload Data DO
              </h2>

              <p className="mt-1 text-sm text-[#8a8179]">
                Upload file Excel berisi daftar toko, nomor DO, payer, dan Bill Date.
              </p>

            </div>

            <label className="cursor-pointer rounded-xl bg-[#2f2924] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a4038]">

              Pilih File Excel

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={
                  handleFileUpload
                }
                className="hidden"
              />

            </label>

          </div>

          {data.length >
            0 && (

            <div className="mt-5 rounded-xl bg-[#f4efe9] px-4 py-3 text-sm text-[#5f554d]">

              ✅ Berhasil membaca{" "}

              <strong>
                {data.length}
              </strong>{" "}

              data DO yang masuk ke 4 toko sementara.

            </div>

          )}

        </section>

        {data.length >
          0 && (

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

            {/* ==================================================
                LEFT
            ================================================== */}

            <section className="rounded-3xl border border-[#e8e0d8] bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-[#2f2924]">
                Pilih Data
              </h2>

              {/* GREETING */}
              <div className="mt-6">

                <label className="mb-2 block text-sm font-medium text-[#4d443d]">
                  Waktu salam
                </label>

                <select
                  value={
                    greetingTime
                  }
                  onChange={(e) =>
                    setGreetingTime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#d8cfc7] bg-white px-4 py-3 text-sm font-medium text-[#3F4A32] outline-none focus:border-[#BB7D40]"
                >

                  <option value="pagi">
                    Selamat pagi
                  </option>

                  <option value="siang">
                    Selamat siang
                  </option>

                  <option value="sore">
                    Selamat sore
                  </option>

                  <option value="malam">
                    Selamat malam
                  </option>

                </select>

              </div>

              {/* STORE */}
              <div className="mt-6">

                <label className="mb-2 block text-sm font-medium text-[#4d443d]">
                  Toko
                </label>

                <select
                  value={
                    selectedToko
                  }
                  onChange={(e) => {

                    const toko =
                      e.target.value;

                    setSelectedToko(
                      toko
                    );

                    // Toko berbeda =
                    // PIC berbeda.
                    setSelectedDO(
                      []
                    );

                    setMessage(
                      ""
                    );

                    if (
                      storeContacts[
                        toko
                      ]
                        ?.dsPayerCodes
                        .length >
                      0
                    ) {
                      setShipmentType(
                        "ds"
                      );
                    } else {
                      setShipmentType(
                        "branch"
                      );
                    }

                  }}
                  className="w-full rounded-xl border border-[#d8cfc7] bg-white px-4 py-3 text-sm font-medium text-[#3F4A32] outline-none focus:border-[#BB7D40]"
                >

                  <option value="">
                    Pilih toko
                  </option>

                  {STORE_KEYS.map(
                    (
                      key
                    ) => {

                      const store =
                        storeContacts[
                          key
                        ];

                      return (
                        <option
                          key={
                            key
                          }
                          value={
                            key
                          }
                        >
                          {
                            store.storeName
                          }
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* SHIPMENT TYPE */}
              {selectedToko &&
                selectedStore && (

                <div className="mt-6">

                  <label className="mb-2 block text-sm font-medium text-[#4d443d]">
                    Tipe Pengiriman
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {availableShipmentTypes.ds && (

                      <button
                        type="button"
                        onClick={() =>
                          setShipmentType(
                            "ds"
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          shipmentType ===
                          "ds"
                            ? "border-[#2f2924] bg-[#2f2924] text-white"
                            : "border-[#d8cfc7] bg-white text-[#4d443d] hover:bg-[#faf8f5]"
                        }`}
                      >
                        Pusat → Toko
                      </button>

                    )}

                    {availableShipmentTypes.branch && (

                      <button
                        type="button"
                        onClick={() =>
                          setShipmentType(
                            "branch"
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          shipmentType ===
                          "branch"
                            ? "border-[#2f2924] bg-[#2f2924] text-white"
                            : "border-[#d8cfc7] bg-white text-[#4d443d] hover:bg-[#faf8f5]"
                        }`}
                      >
                        Pusat → Cabang
                      </button>

                    )}

                  </div>

                </div>

              )}

              {/* PIC */}
              {selectedToko &&
                selectedStore && (

                <div className="mt-5 rounded-2xl bg-[#faf8f5] p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-[#968b82]">
                    PIC
                  </p>

                  <p className="mt-1 font-semibold text-[#3F4A32]">
                    {
                      selectedStore.salutation
                    }{" "}
                    {
                      selectedStore.picName
                    }
                  </p>

                  <p className="mt-1 text-sm text-[#756b63]">
                    {
                      selectedStore.whatsapp
                    }
                  </p>

                  <p className="mt-1 text-sm text-[#756b63]">
                    {
                      selectedStore.email
                    }
                  </p>

                </div>

              )}

              {/* DO */}
              {selectedToko && (

                <div className="mt-6">

                  <div className="mb-3 flex items-center justify-between">

                    <label className="text-sm font-medium text-[#4d443d]">
                      Pilih DO
                    </label>

                    <span className="text-sm font-medium text-[#68705A]">
                      {
                        selectedDO.length
                      }{" "}
                      dipilih
                    </span>

                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#e8e0d8]">

                    <table className="w-full text-left text-sm">

                      <thead className="bg-[#FFF7E7]">

                        <tr>

                          <th className="w-14 px-4 py-3 text-center">

                            <input
                              type="checkbox"
                              checked={
                                allVisibleDOSelected
                              }
                              onChange={
                                toggleAllDO
                              }
                              disabled={
                                tokoDO.length ===
                                0
                              }
                              className="h-4 w-4 cursor-pointer accent-[#CF1C1F] disabled:cursor-not-allowed disabled:opacity-40"
                            />

                          </th>

                          <th className="px-4 py-3 font-semibold text-[#3F4A32]">
                            No. DO
                          </th>

                          <th className="px-4 py-3 font-semibold text-[#3F4A32]">
                            Bill Date
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {tokoDO.length >
                        0 ? (

                          tokoDO.map(
                            (
                              row
                            ) => {

                              const checked =
                                selectedDO.includes(
                                  row.id
                                );

                              const blastDate =
                                row.rawBillDate
                                  ? getBlastDate(
                                      row.toko,
                                      row.payer,
                                      row.rawBillDate
                                    )
                                  : null;

                              const isGriyaBranch =
                                row.toko ===
                                  "Griya" &&
                                normalizePayer(
                                  row.payer
                                ) ===
                                  "21G05000";

                              return (

                                <tr
                                  key={
                                    row.id
                                  }
                                  className="border-t border-[#eee8e2]"
                                >

                                  <td className="px-4 py-3 text-center">

                                    <input
                                      type="checkbox"
                                      checked={
                                        checked
                                      }
                                      onChange={() =>
                                        toggleDO(
                                          row.id
                                        )
                                      }
                                      className="h-4 w-4 cursor-pointer accent-[#CF1C1F]"
                                    />

                                  </td>

                                  <td className="px-4 py-3 font-semibold text-[#3F4A32]">
                                    {
                                      row.noDO
                                    }
                                  </td>

                                  <td className="px-4 py-3">

                                    {blastDate ? (
                                      <>

                                        <p className="font-medium text-[#68705A]">
                                          {
                                            formatLongDate(
                                              blastDate
                                            )
                                          }
                                        </p>

                                        {isGriyaBranch &&
                                          row.rawBillDate && (

                                          <p className="mt-1 text-xs font-medium text-[#BB7D40]">
                                            Data asli:{" "}
                                            {
                                              formatLongDate(
                                                row.rawBillDate
                                              )
                                            }
                                          </p>

                                        )}

                                      </>
                                    ) : (

                                      <span className="text-red-500">
                                        Tanggal tidak tersedia
                                      </span>

                                    )}

                                  </td>

                                </tr>
                              );
                            }
                          )

                        ) : (

                          <tr>

                            <td
                              colSpan={
                                3
                              }
                              className="px-4 py-8 text-center text-sm font-medium text-[#68705A]"
                            >
                              Tidak ada DO untuk tipe pengiriman ini.
                            </td>

                          </tr>

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}

              {/* GENERATE */}
              <button
                onClick={
                  generateMessage
                }
                disabled={
                  !selectedToko ||
                  selectedDO.length ===
                    0
                }
                className="mt-6 w-full rounded-xl bg-[#2f2924] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4a4038] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Generate Message
              </button>

            </section>

            {/* ==================================================
                RIGHT — PREVIEW
            ================================================== */}

            <section className="rounded-3xl border border-[#e8e0d8] bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-semibold text-[#2f2924]">
                    Preview WhatsApp
                  </h2>

                  <p className="mt-1 text-sm text-[#8a8179]">
                    Pesan terakhir yang sudah di-generate.
                  </p>

                </div>

              </div>

              <div className="mt-6 min-h-[560px] rounded-3xl bg-[#eee8e1] p-5">

                {message ? (

                  <div className="flex min-h-[510px] flex-col">

                    {/* MESSAGE */}
                    <div className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-[#342d28] shadow-sm">
                      {
                        message
                      }
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-auto pt-6">

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                        <button
                          onClick={
                            copyMessage
                          }
                          className="rounded-xl border border-[#d8cfc7] bg-white px-4 py-3 text-sm font-semibold text-[#3F4A32] transition hover:bg-[#faf8f5]"
                        >
                          📋 Copy
                        </button>

                        <button
                          onClick={
                            sendToWhatsApp
                          }
                          className="rounded-xl bg-[#3F4A32] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          💬 WhatsApp
                        </button>

                        <button
                          onClick={
                            sendToEmail
                          }
                          className="rounded-xl bg-[#BB7D40] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          ✉️ Email
                        </button>

                      </div>

                      <p className="mt-3 text-center text-xs text-[#8a8179]">
                        WhatsApp dan Email akan membuka pesan yang sudah terisi dan siap dikirim.
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="flex min-h-[510px] items-center justify-center text-center text-[#968b82]">

                    <div>

                      <div className="text-5xl">
                        💬
                      </div>

                      <p className="mt-4 font-medium text-[#51483f]">
                        Belum ada pesan
                      </p>

                      <p className="mt-1 text-sm">
                        Pilih toko dan checklist DO terlebih dahulu.
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </section>

          </div>

        )}

        {!data.length && (

          <section className="mt-6 rounded-3xl border border-[#e8e0d8] bg-white p-12 text-center shadow-sm">

            <div className="text-5xl">
              📊
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#2f2924]">
              Belum ada data
            </h2>

            <p className="mt-2 text-sm text-[#8a8179]">
              Upload Excel untuk mulai memilih DO yang ingin dikonfirmasi.
            </p>

          </section>

        )}

      </div>

    </main>
  );
}