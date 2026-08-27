"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  DeliveryOrder,
} from "../../types/delivery";

import WhatsAppButton from "./WhatsAppButton";

interface DeliveryListProps {
  deliveries: DeliveryOrder[];
}

export default function DeliveryList({
  deliveries,
}: DeliveryListProps) {
  const [selectedStore, setSelectedStore] =
    useState("All");

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  /* ================================================= */
  /* STORE LIST */
  /* ================================================= */

  const stores = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          deliveries.map(
            (item) =>
              item.storeName
          )
        )
      ),
    ];
  }, [deliveries]);

  /* ================================================= */
  /* FILTERED DATA */
  /* ================================================= */

  const filtered =
    selectedStore === "All"
      ? deliveries
      : deliveries.filter(
          (item) =>
            item.storeName ===
            selectedStore
        );

  /* ================================================= */
  /* SELECTED DATA */
  /* ================================================= */

  const selectedDeliveries =
    deliveries.filter(
      (delivery) =>
        selectedIds.includes(
          delivery.id
        )
    );

  /* ================================================= */
  /* TOGGLE CHECKBOX */
  /* ================================================= */

  const toggleSelection = (
    id: string
  ) => {
    setSelectedIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id
            )
          : [
              ...current,
              id,
            ]
    );
  };

  /* ================================================= */
  /* SELECT ALL */
  /* ================================================= */

  const toggleAll = () => {
    const ids =
      filtered.map(
        (item) => item.id
      );

    const allSelected =
      ids.length > 0 &&
      ids.every((id) =>
        selectedIds.includes(id)
      );

    if (allSelected) {
      setSelectedIds(
        (current) =>
          current.filter(
            (id) =>
              !ids.includes(id)
          )
      );
    } else {
      setSelectedIds(
        (current) => [
          ...new Set([
            ...current,
            ...ids,
          ]),
        ]
      );
    }
  };

  /* ================================================= */
  /* CHANGE STORE */
  /* ================================================= */

  const handleStoreChange = (
    store: string
  ) => {
    setSelectedStore(store);

    // Reset pilihan ketika
    // berpindah toko.
    setSelectedIds([]);
  };

  /* ================================================= */
  /* WHATSAPP VALIDATION */
  /* ================================================= */

  const canSend =
    selectedDeliveries.length > 0 &&
    selectedDeliveries.every(
      (delivery) =>
        delivery.storeName ===
        selectedDeliveries[0]
          ?.storeName
    );

  /* ================================================= */
  /* CHECK SELECT ALL STATE */
  /* ================================================= */

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every(
      (item) =>
        selectedIds.includes(
          item.id
        )
    );

  return (
    <div className="mt-8">

      {/* ================================================= */}
      {/* STORE FILTER */}
      {/* ================================================= */}

      <div
        className="
          rounded-[24px]
          bg-white
          p-4
          shadow-[0_10px_30px_rgba(187,125,64,0.06)]
        "
      >
        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          {stores.map(
            (store) => (
              <button
                key={store}
                type="button"
                onClick={() =>
                  handleStoreChange(
                    store
                  )
                }
                className={`
                  rounded-full
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  transition-all
                  duration-200

                  ${
                    selectedStore ===
                    store
                      ? "bg-[#3F4A32] text-[#FFF7E7]"
                      : "bg-[#FFEDC9] text-[#713901] hover:bg-[#FEC841]"
                  }
                `}
              >
                {store}
              </button>
            )
          )}
        </div>
      </div>


      {/* ================================================= */}
      {/* MAIN TWO-COLUMN LAYOUT */}
      {/* ================================================= */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-5
          lg:grid-cols-[1.2fr_0.8fr]
          lg:items-start
        "
      >

        {/* ================================================= */}
        {/* LEFT — DELIVERY LIST */}
        {/* ================================================= */}

        <div>

          {/* ================================================= */}
          {/* SELECTED COUNT + SELECT ALL */}
          {/* ================================================= */}

          <div
            className="
              mb-4
              flex
              items-center
              justify-between
              gap-4
              rounded-[22px]
              bg-[#FFEDC9]
              px-5
              py-4
            "
          >

            {/* SELECTED COUNT */}

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#713901]/60
                "
              >
                Selected
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-[#713901]
                "
              >
                {
                  selectedDeliveries.length
                }{" "}
                DO
                {selectedDeliveries.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>


            {/* SELECT ALL */}

            <button
              type="button"
              onClick={
                toggleAll
              }
              disabled={
                filtered.length ===
                0
              }
              className="
                shrink-0
                rounded-full
                bg-[#FFD6D6]
                px-4
                py-2
                text-xs
                font-semibold
                text-[#CF1C1F]
                transition-all
                duration-200
                hover:-translate-y-0.5
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {allFilteredSelected
                ? "Unselect All"
                : "Select All"}
            </button>

          </div>


          {/* ================================================= */}
          {/* DELIVERY CARDS */}
          {/* ================================================= */}

          <div
            className="
              space-y-3
            "
          >
            {filtered.map(
              (delivery) => {
                const checked =
                  selectedIds.includes(
                    delivery.id
                  );

                return (
                  <label
                    key={
                      delivery.id
                    }
                    className={`
                      flex
                      cursor-pointer
                      items-start
                      gap-4
                      rounded-[22px]
                      border
                      p-5
                      transition-all
                      duration-200

                      ${
                        checked
                          ? "border-[#CF1C1F]/35 bg-[#FFF0F0]"
                          : "border-[#BB7D40]/15 bg-white hover:-translate-y-0.5"
                      }
                    `}
                  >

                    {/* CHECKBOX */}

                    <input
                      type="checkbox"
                      checked={
                        checked
                      }
                      onChange={() =>
                        toggleSelection(
                          delivery.id
                        )
                      }
                      className="
                        mt-1
                        h-4
                        w-4
                        accent-[#CF1C1F]
                      "
                    />


                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      {/* HEADER */}

                      <div
                        className="
                          flex
                          flex-wrap
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <div>
                          <p
                            className="
                              text-base
                              font-bold
                              text-[#3F4A32]
                            "
                          >
                            DO{" "}
                            {
                              delivery.doNo
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-[#BB7D40]
                            "
                          >
                            {
                              delivery.storeName
                            }
                          </p>
                        </div>


                        {/* DATE */}

                        <div
                          className="
                            rounded-full
                            bg-[#FEC841]
                            px-3
                            py-1.5
                            text-[11px]
                            font-semibold
                            text-[#713901]
                          "
                        >
                          {
                            formatDate(
                              delivery.doDate
                            )
                          }
                        </div>

                      </div>


                      {/* META */}

                      <div
                        className="
                          mt-4
                          grid
                          gap-2
                          text-xs
                          text-[#68705A]
                          sm:grid-cols-3
                        "
                      >

                        <p>
                          <span className="font-semibold">
                            Invoice:
                          </span>{" "}
                          {
                            delivery.invoiceNo
                          }
                        </p>

                        <p>
                          <span className="font-semibold">
                            Sales:
                          </span>{" "}
                          {
                            delivery.salesDocNo
                          }
                        </p>

                        <p>
                          <span className="font-semibold">
                            Items:
                          </span>{" "}
                          {
                            delivery.items
                              .length
                          }
                        </p>

                      </div>


                      {/* ================================================= */}
                      {/* ITEMS */}
                      {/* ================================================= */}

                      <details
                        className="
                          mt-4
                          text-xs
                        "
                      >

                        <summary
                          className="
                            cursor-pointer
                            font-semibold
                            text-[#CF1C1F]
                          "
                        >
                          View Items
                        </summary>

                        <div
                          className="
                            mt-3
                            space-y-1.5
                          "
                        >
                          {delivery.items.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={`${item.material}-${index}`}
                                className="
                                  flex
                                  items-center
                                  justify-between
                                  rounded-lg
                                  bg-[#FFF7E7]
                                  px-3
                                  py-2
                                "
                              >

                                <span
                                  className="
                                    text-[#68705A]
                                  "
                                >
                                  {
                                    item.material
                                  }
                                </span>

                                <span
                                  className="
                                    font-semibold
                                    text-[#BB7D40]
                                  "
                                >
                                  ×
                                  {
                                    item.qty
                                  }
                                </span>

                              </div>
                            )
                          )}
                        </div>

                      </details>

                    </div>

                  </label>
                );
              }
            )}


            {/* ================================================= */}
            {/* EMPTY STATE */}
            {/* ================================================= */}

            {filtered.length ===
              0 && (
              <div
                className="
                  rounded-[22px]
                  border
                  border-dashed
                  border-[#BB7D40]/25
                  bg-[#FFEDC9]/30
                  p-8
                  text-center
                  text-sm
                  text-[#68705A]
                "
              >
                No delivery data
                found.
              </div>
            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* RIGHT — MESSAGE PREVIEW */}
        {/* ================================================= */}

        <div
          className="
            lg:sticky
            lg:top-6
          "
        >

          {canSend ? (
            <WhatsAppButton
              deliveries={
                selectedDeliveries
              }
            />
          ) : (
            <div
              className="
                rounded-[24px]
                border
                border-dashed
                border-[#BB7D40]/25
                bg-white
                p-8
                text-center
                lg:min-h-[420px]
                lg:flex
                lg:flex-col
                lg:items-center
                lg:justify-center
              "
            >

              <div
                className="
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
                💬
              </div>

              <p
                className="
                  mt-4
                  text-base
                  font-bold
                  text-[#3F4A32]
                "
              >
                Message Preview
              </p>

              <p
                className="
                  mt-2
                  max-w-[300px]
                  text-xs
                  leading-5
                  text-[#68705A]
                "
              >
                Select one or more DO
                from the same store to
                generate the WhatsApp
                message.
              </p>

            </div>
          )}

        </div>

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