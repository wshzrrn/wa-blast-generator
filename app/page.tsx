"use client";

import { useMemo, useState } from "react";

import ExcelImport from "../components/confirmation/ExcelImport";
import DeliveryList from "../components/confirmation/DeliveryList";

import type {
  DeliveryOrder,
} from "../types/delivery";

export default function Home() {
  const [deliveries, setDeliveries] =
    useState<DeliveryOrder[]>([]);

  const summary = useMemo(() => {
    const stores = new Set(
      deliveries.map(
        (item) => item.storeName
      )
    );

    const totalItems =
      deliveries.reduce(
        (total, delivery) =>
          total + delivery.items.length,
        0
      );

    return {
      stores: stores.size,
      deliveries: deliveries.length,
      items: totalItems,
    };
  }, [deliveries]);

  const handleImported = (
    data: DeliveryOrder[]
  ) => {
    setDeliveries(data);
  };

  return (
    <main
      className="
        min-h-screen
        bg-[#FFF7E7]
        px-5
        py-8
        sm:px-8
        lg:px-12
      "
    >
      <div
        className="
          mx-auto
          max-w-[1200px]
        "
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header className="mb-8">
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#BB7D40]
            "
          >
            Delivery Confirmation
          </p>

          <h1
            className="
              mt-2
              text-4xl
              font-bold
              text-[#3F4A32]
              sm:text-5xl
            "
          >
            WhatsApp Blast Generator
          </h1>
        </header>


        {/* ================================================= */}
        {/* EXCEL IMPORT */}
        {/* ================================================= */}

        <ExcelImport
          onImported={
            handleImported
          }
        />


        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        {deliveries.length > 0 && (
          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-3
            "
          >

            {/* STORES */}

            <div
              className="
                rounded-[22px]
                bg-[#3F4A32]
                px-5
                py-4
                text-[#FFF7E7]
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  opacity-70
                "
              >
                Stores
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                "
              >
                {summary.stores}
              </p>
            </div>


            {/* DELIVERY ORDERS */}

            <div
              className="
                rounded-[22px]
                bg-[#FEC841]
                px-5
                py-4
                text-[#713901]
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  opacity-70
                "
              >
                Delivery Orders
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                "
              >
                {summary.deliveries}
              </p>
            </div>


            {/* ITEMS */}

            <div
              className="
                rounded-[22px]
                bg-[#FFD6D6]
                px-5
                py-4
                text-[#CF1C1F]
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  opacity-70
                "
              >
                Total Items
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                "
              >
                {summary.items}
              </p>
            </div>

          </div>
        )}


        {/* ================================================= */}
        {/* DELIVERY LIST */}
        {/* ================================================= */}

        {deliveries.length > 0 ? (
          <DeliveryList
            deliveries={
              deliveries
            }
          />
        ) : (
          <div
            className="
              mt-8
              rounded-[28px]
              border
              border-dashed
              border-[#BB7D40]/30
              bg-white/50
              px-6
              py-16
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[#FFEDC9]
                text-2xl
              "
            >
              📊
            </div>

            <h2
              className="
                mt-4
                text-lg
                font-bold
                text-[#3F4A32]
              "
            >
              No Excel file imported yet
            </h2>
          </div>
        )}

      </div>
    </main>
  );
}