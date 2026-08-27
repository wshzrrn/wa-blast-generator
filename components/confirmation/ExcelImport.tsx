"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import {
  parseExcelFile,
} from "../../lib/excelParser";

import type {
  DeliveryOrder,
} from "../../types/delivery";

interface ExcelImportProps {
  onImported: (
    deliveries: DeliveryOrder[]
  ) => void;
}

export default function ExcelImport({
  onImported,
}: ExcelImportProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isDragging, setIsDragging] =
    useState(false);

  const handleFile = async (
    file?: File
  ) => {
    if (!file) {
      return;
    }

    setError("");

    /* ================================================= */
    /* VALIDATE FILE */
    /* ================================================= */

    const isExcel =
      file.name
        .toLowerCase()
        .endsWith(".xlsx") ||
      file.name
        .toLowerCase()
        .endsWith(".xls");

    if (!isExcel) {
      setError(
        "Please upload an Excel file (.xlsx or .xls)."
      );
      return;
    }

    setLoading(true);

    try {
      const deliveries =
        await parseExcelFile(file);

      if (
        deliveries.length === 0
      ) {
        throw new Error(
          "Tidak ditemukan data untuk Griya, King, Sumber Jaya, atau Niaga Raya."
        );
      }

      onImported(deliveries);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "File Excel gagal dibaca."
      );
    } finally {
      setLoading(false);

      /* Reset supaya file yang sama */
      /* bisa dipilih lagi */
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  /* ================================================= */
  /* CLICK FILE */
  /* ================================================= */

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    handleFile(
      event.target.files?.[0]
    );
  };

  /* ================================================= */
  /* DRAG OVER */
  /* ================================================= */

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  /* ================================================= */
  /* DRAG LEAVE */
  /* ================================================= */

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  /* ================================================= */
  /* DROP */
  /* ================================================= */

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    handleFile(file);
  };

  /* ================================================= */
  /* OPEN FILE PICKER */
  /* ================================================= */

  const openFilePicker = () => {
    if (loading) {
      return;
    }

    inputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={
          handleInputChange
        }
      />

      {/* ================================================= */}
      {/* DROP ZONE */}
      {/* ================================================= */}

      <div
        onClick={
          openFilePicker
        }
        onDragOver={
          handleDragOver
        }
        onDragLeave={
          handleDragLeave
        }
        onDrop={
          handleDrop
        }
        className={`
          group
          cursor-pointer
          rounded-[28px]
          border-2
          border-dashed
          p-8
          text-center
          transition-all
          duration-200
          sm:p-10

          ${
            isDragging
              ? `
                border-[#CF1C1F]
                bg-[#FFD6D6]
                scale-[1.01]
              `
              : `
                border-[#BB7D40]/30
                bg-white
                hover:border-[#BB7D40]/60
                hover:bg-[#FFFDF5]
              `
          }

          ${
            loading
              ? "pointer-events-none opacity-60"
              : ""
          }
        `}
      >

        {/* ================================================= */}
        {/* ICON */}
        {/* ================================================= */}

        <div
          className={`
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            text-3xl
            transition-transform
            duration-200

            ${
              isDragging
                ? "scale-110 bg-[#CF1C1F]"
                : "bg-[#FFEDC9] group-hover:scale-105"
            }
          `}
        >
          {isDragging
            ? "📥"
            : "📊"}
        </div>


        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <p
          className={`
            mt-5
            text-base
            font-bold

            ${
              isDragging
                ? "text-[#CF1C1F]"
                : "text-[#3F4A32]"
            }
          `}
        >
          {loading
            ? "Reading Excel..."
            : isDragging
              ? "Drop your Excel file here"
              : "Drop your Excel file here"}
        </p>


        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <p
          className="
            mx-auto
            mt-2
            max-w-[500px]
            text-sm
            leading-6
            text-[#68705A]
          "
        >
          {loading
            ? "Please wait while the delivery data is being processed."
            : "Drag and drop your Excel file here, or click to browse from your computer."}
        </p>


        {/* ================================================= */}
        {/* FORMAT */}
        {/* ================================================= */}

        {!loading && (
          <div
            className="
              mt-4
              inline-flex
              items-center
              rounded-full
              bg-[#FEC841]/30
              px-4
              py-2
              text-xs
              font-semibold
              text-[#713901]
            "
          >
            .XLSX / .XLS
          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div
          className="
            mt-4
            rounded-2xl
            bg-[#FFD6D6]
            px-5
            py-4
            text-sm
            font-medium
            text-[#CF1C1F]
          "
        >
          {error}
        </div>
      )}
    </div>
  );
}