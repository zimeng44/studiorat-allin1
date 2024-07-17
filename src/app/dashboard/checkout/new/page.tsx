"use client";
import React from "react";
import AddForm from "./NewCheckoutForm";
import { useState } from "react";
import { CheckoutSessionType } from "@/app/lib/definitions";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

const page = () => {
  const [addOpen, setAddOpen] = useState(false);

  const addItem = async (newItem: CheckoutSessionType) => {
    const res = await fetch(`${apiUrl}/checkout-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(newItem),
      // cache: "no-store",
    });
    // console.log("res item", newItem);

    // setDataChanged(true);

    // if (res.status == 200) {
    //   toast({
    //     description: "Item Added Successfully!",
    //   });
    // } else {
    //   toast({
    //     description: `Error: ${res.statusText}`,
    //   });
    // }
    // // router.refresh();
    // if (totalEntries % pageSize === 0) {
    //   setPageIndex(pageCount + 1);
    // } else {
    //   setPageIndex(pageCount);
    // }

    return;
  };

  return (
    <div>
      This is a New Session
      <AddForm
        rowData={{
          attributes: {
            creationTime: `${new Date().toLocaleString()}`,
            stuIDCheckout: "",
            stuIDCheckin: "",
            studio: "",
            otherLocation: "",
            creationMonitor: "",
            finishMonitor: "",
            finishTime: "",
            notes: "",
            finished: false,
            inventory_items: [],
            studio_user: [863],
          },
        }}
        addItem={addItem}
        setAddOpen={setAddOpen}
      />
    </div>
  );
};

export default page;
