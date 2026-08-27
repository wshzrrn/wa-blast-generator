"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  DeliveryOrder,
} from "../../types/delivery";

import {
  storeContacts,
} from "../../data/storeContacts";

interface WhatsAppButtonProps {
  deliveries: DeliveryOrder[];
}

export default function WhatsAppButton({
  deliveries,
}: WhatsAppButtonProps) {
  const [copied, setCopied] =
    useState(false);

  /* ================================================= */
  /* STORE */
  /* ================================================= */

  const storeName =
    deliveries[0]?.storeName ?? "";

  const contact =
    storeName
      ? storeContacts[storeName]
      : undefined;

  /* ================================================= */
  /* GROUP DO BY DATE */
  /* ================================================= */

  const groupedByDate =
    useMemo(() => {
      const groups =
        new Map<
          string,
          DeliveryOrder[]
        >();

      const sorted =
        [...deliveries].sort(
          (a, b) =>
            a.doDate.localeCompare(
              b.doDate
            )
        );

      for (
        const delivery of sorted
      ) {
        const existing =
          groups.get(
            delivery.doDate
          );

        if (existing) {
          existing.push(
            delivery
          );
        } else {
          groups.set(
            delivery.doDate,
            [delivery]
          );
        }
      }

      return Array.from(
        groups.entries()
      );
    }, [deliveries]);

  /* ================================================= */
  /* MESSAGE */
  /* ================================================= */

  const message =
    useMemo(() => {
      if (
        !contact ||
        deliveries.length === 0
      ) {
        return "";
      }

      const greeting =
        `Selamat siang ${contact.picName}`;

      const deliveryLines =
        groupedByDate
          .map(
            ([date, dateDeliveries]) => {
              const doNumbers =
                dateDeliveries
                  .map(
                    (delivery) =>
                      delivery.doNo
                  )
                  .join("\n");

              return `${doNumbers}
Tanggal ${formatDate(
                date
              )}`;
            }
          )
          .join("\n");

      return `${greeting}

Kami dari bagian Admin PT SHARP Samarinda mau mengkorfirmasi pengiriman barang dengan nomor DO :
${deliveryLines}

Apakah barang diterima sesuai dengan perincian pada DO diatas. Sambil menunggu konfirmasi balik, kami ucapkan terimakasih atas kerjasamanya.`;
    }, [
      contact,
      deliveries,
      groupedByDate,
    ]);

  /* ================================================= */
  /* EMAIL SUBJECT */
  /* ================================================= */

  const emailSubject =
    useMemo(() => {
      if (!storeName) {
        return "";
      }

      return `Konfirmasi Penerimaan Barang - ${storeName}`;
    }, [storeName]);

  /* ================================================= */
  /* COPY MESSAGE */
  /* ================================================= */

  const handleCopy =
    async () => {
      if (!message) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          message
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        alert(
          "Message could not be copied."
        );
      }
    };

  /* ================================================= */
  /* WHATSAPP */
  /* ================================================= */

  const handleWhatsApp =
    () => {
      if (
        !message ||
        !contact?.whatsapp
      ) {
        return;
      }

      const url =
        `https://wa.me/${contact.whatsapp}` +
        `?text=${encodeURIComponent(
          message
        )}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  /* ================================================= */
  /* SEND TO EMAIL */
  /* ================================================= */

  const handleEmail =
    () => {
      if (!message) {
        return;
      }

      const mailtoUrl =
        `mailto:wshzrrn@gmail.com` +
        `?subject=${encodeURIComponent(
          emailSubject
        )}` +
        `&body=${encodeURIComponent(
          message
        )}`;

      window.location.href =
        mailtoUrl;
    };

  /* ================================================= */
  /* EMPTY */
  /* ================================================= */

  if (
    deliveries.length === 0 ||
    !contact
  ) {
    return (
      <div
        className="
          rounded-[24px]
          border
          border-dashed
          border-[#BB7D40]/25
          bg-white
          p-8
          text-center
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-[#3F4A32]
          "
        >
          Select DO first
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* ================================================= */}
      {/* MESSAGE PREVIEW */}
      {/* ================================================= */}

      <div
        className="
          rounded-[24px]
          border
          border-[#BB7D40]/15
          bg-white
          p-5
          shadow-[0_10px_30px_rgba(187,125,64,0.05)]
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div>

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#BB7D40]
              "
            >
              Message Preview
            </p>

            <p
              className="
                mt-1
                text-sm
                font-bold
                text-[#3F4A32]
              "
            >
              {contact.picName}
            </p>

            <p
              className="
                mt-0.5
                text-xs
                text-[#68705A]
              "
            >
              {storeName}
            </p>

          </div>

          <div
            className="
              shrink-0
              rounded-full
              bg-[#FFD6D6]
              px-3
              py-1.5
              text-[10px]
              font-semibold
              text-[#CF1C1F]
            "
          >
            {deliveries.length} DO
            {deliveries.length !== 1
              ? "s"
              : ""}
          </div>

        </div>


        {/* MESSAGE */}

        <div
          className="
            mt-4
            max-h-[380px]
            overflow-y-auto
            rounded-[18px]
            bg-[#FFF7E7]
            p-4
          "
        >
          <pre
            className="
              whitespace-pre-wrap
              font-sans
              text-xs
              leading-6
              text-[#3F4A32]
            "
          >
            {message}
          </pre>
        </div>

      </div>


      {/* ================================================= */}
      {/* ACTION BUTTONS */}
      {/* ================================================= */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >

        {/* ================================================= */}
        {/* COPY MESSAGE */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={
            handleCopy
          }
          className="
            rounded-full
            border
            border-[#3F4A32]
            bg-white
            px-4
            py-3
            text-sm
            font-semibold
            text-[#3F4A32]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-[#FFF7E7]
          "
        >
          {copied
            ? "✓ Copied!"
            : "📋 Copy Message"}
        </button>


        {/* ================================================= */}
        {/* WHATSAPP */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={
            handleWhatsApp
          }
          className="
            rounded-full
            bg-[#3F4A32]
            px-4
            py-3
            text-sm
            font-semibold
            text-[#FFF7E7]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-[0_8px_20px_rgba(63,74,50,0.18)]
          "
        >
          💬 WhatsApp
        </button>


        {/* ================================================= */}
        {/* SEND TO EMAIL */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={
            handleEmail
          }
          className="
            rounded-full
            bg-[#FEC841]
            px-4
            py-3
            text-sm
            font-semibold
            text-[#713901]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-[0_8px_20px_rgba(254,200,65,0.25)]
          "
        >
          ✉️ Send to Email
        </button>

      </div>

    </div>
  );
}


/* ================================================= */
/* DATE FORMATTER */
/* ================================================= */

function formatDate(
  value: string
): string {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

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
}