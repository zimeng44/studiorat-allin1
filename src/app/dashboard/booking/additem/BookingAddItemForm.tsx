"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BookingAddItemPageTabs from "../(inventoryDisplay)/BookingAddItemPageTabs";
import { ArrowLeftToLine } from "lucide-react";
import { inventory_items } from "@prisma/client";
import { bookingInventoryCartColumns } from "../inventoryCartColumns";
import InventoryItemCart from "@/components/custom/InventoryItemCart";

const BookingAddItemForm = ({
  bookingId,
  inventoryData,
  totalEntries,
  filter,
}: {
  bookingId: string;
  inventoryData: inventory_items[];
  totalEntries: number;
  filter: {};
}) => {
  const router = useRouter();

  // if (typeof window !== "undefined") {
  const temp2 = localStorage?.getItem(`tempBooking${bookingId}`) ?? undefined;
  const bookingData2 = temp2 ? JSON.parse(temp2) : "";
  // console.log(bookingData2);
  // }
  if (!bookingData2) return <div>Booking Info Lost.</div>;

  const [itemObjArr, setItemObjArr] = useState(
    bookingData2?.inventory_items ?? Array(),
  );
  // console.log(bookingId);
  if (!bookingData2?.inventory_items) return <div>No Inventory Item</div>;

  // const bookingItems = bookingData.inventory_items;
  // console.log(bookingData.inventory_items);
  const handleBackToBooking = () => {
    localStorage.setItem(
      `tempBookingItems${bookingId}`,
      JSON.stringify(itemObjArr),
    );
    // localStorage.removeItem(`tempBooking${bookingId}`);

    router.push(`/dashboard/booking/${bookingId}`);
    router.refresh();
  };

  return (
    <div>
      <div className="py-3">
        <Button
          className="hover:bg-slate-200 active:bg-slate-300"
          variant={"secondary"}
          type="button"
          onClick={(e) => {
            handleBackToBooking();
          }}
        >
          <ArrowLeftToLine className="h-4 w-4" />
          Back to Booking
        </Button>
      </div>
      <p className="mb-2 font-bold">Added Items</p>

      <InventoryItemCart
        data={itemObjArr}
        columnsMeta={bookingInventoryCartColumns}
        setItemObjArr={setItemObjArr}
        disabled={false}
      />

      <BookingAddItemPageTabs
        data={inventoryData}
        // meta={inventoryMeta}
        totalEntries={totalEntries}
        filter={filter}
        itemObjArr={itemObjArr}
        addToBooking={setItemObjArr}
      />
    </div>
  );
};

export default BookingAddItemForm;
