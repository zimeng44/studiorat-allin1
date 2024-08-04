"use client";
import { useRouter } from "next/navigation";
import { inventoryColumns } from "@/app/dashboard/master-inventory/inventoryColumns";
import { InventoryItem } from "@/data/definitions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BookingAddItemPageTabs from "./BookingAddItemPageTabs";
import BookingAddItemEmbededTable from "./BookingAddItemEmbededTable";
import { ArrowLeftToLine } from "lucide-react";

const BookingAddItemForm = ({
  inventoryData,
  inventoryMeta,
  filter,
}: {
  inventoryData: InventoryItem[];
  inventoryMeta: { pagination: { pageCount: number; total: number } };
  filter: {};
}) => {
  const router = useRouter();

  const temp2 = localStorage.getItem(`tempNewBooking`) ?? undefined;
  const bookingData2 = temp2 ? JSON.parse(temp2) : "";

  if (!bookingData2) return <div>Booking Info Lost.</div>;

  const [itemObjArr, setItemObjArr] = useState(
    bookingData2?.inventory_items ?? Array(),
  );
  // console.lo;
  if (!bookingData2?.inventory_items) return <div>No Inventory Item</div>;

  // const bookingItems = bookingData.inventory_items;
  // console.log(bookingData.inventory_items);
  const handleBackToBooking = () => {
    localStorage.setItem(`tempNewBookingItems`, JSON.stringify(itemObjArr));
    router.push(`/dashboard/booking/new`);
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
      <BookingAddItemEmbededTable
        data={itemObjArr}
        columns={inventoryColumns}
        itemObjArr={itemObjArr}
        setItemObjArr={setItemObjArr}
      />
      <BookingAddItemPageTabs
        data={inventoryData}
        meta={inventoryMeta}
        filter={filter}
        itemObjArr={itemObjArr}
        addToBooking={setItemObjArr}
      />
    </div>
  );
};

export default BookingAddItemForm;
