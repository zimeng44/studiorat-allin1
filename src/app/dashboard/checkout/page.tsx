"use client";
import PaginationControls from "./PaginationControls";
import React from "react";
// import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ServerTable from "./ServerTable";
import {
  InventoryItem,
  CheckoutSessionSent,
  CheckoutSessionReceived,
} from "@/app/lib/definitions";
import { useToast } from "@/components/ui/use-toast";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

export default function Checkout() {
  const { toast } = useToast();

  // const router = useRouter();
  // const searchParams = useSearchParams();

  // router.push(
  //   `/master-inventory?page=${Number(page) - 1}&per_page=${per_page}`
  // );

  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [sort, setSort] = useState("");
  const [desc, setDesc] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [dataChanged, setDataChanged] = useState(false);
  const [filter, setFilter] = useState({
    creationTime: { from: undefined, to: undefined },
    stuIDCheckout: "",
    stuIDCheckin: "",
    studio: "all",
    otherLocation: "",
    creationMonitor: "",
    finishMonitor: "",
    finishTime: "",
    notes: "",
    finished: "all",
    // inventory_items: {},
    // studio_user: {},
  });
  const [numRowSelected, setNumRowSelected] = useState(0);
  const [filterOn, setFilterOn] = useState(false);

  function handleSort(newSort: string) {
    setSort(newSort);
    setDesc(!desc);
    // console.log("Sort is ", newSort, desc);
  }

  const addItem = async (newItem: CheckoutSessionSent) => {
    const res = await fetch(`${apiUrl}/checkout-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(newItem),
      // cache: "no-store",
    });
    console.log("res item", newItem);

    setDataChanged(true);
    // toast.success("Item Added Successfully!");
    if (res.status == 200) {
      toast({
        description: "Item Added Successfully!",
      });
    } else {
      toast({
        description: `Error: ${res.statusText}`,
      });
    }
    // router.refresh();
    if (totalEntries % pageSize === 0) {
      setPageIndex(pageCount + 1);
    } else {
      setPageIndex(pageCount);
    }

    return;
  };

  const updateItem = async (updatedItem: CheckoutSessionSent, id: number) => {
    const res = await fetch(`${apiUrl}/checkout-sessions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(updatedItem),
      // cache: "no-store",
    });
    setDataChanged(true);
    // toast.success("Item Updated Successfully!");
    if (res.status == 200) {
      toast({
        description: "Item Updated Successfully!",
      });
    } else {
      toast({
        description: `Error: ${res.statusText}`,
      });
    }

    // console.log("here we go", updatedItem);
    return;
  };

  const deleteItem = async (id: number) => {
    const res = await fetch(`${apiUrl}/checkout-sessions/${id}`, {
      method: "DELETE",
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      // cache: "no-store",
    });

    setDataChanged(true);

    if (res.status == 200) {
      toast({
        description: "Item Deleted Successfully!",
      });
    } else {
      toast({
        description: `Error: ${res.statusText}`,
      });
    }
    return;
  };

  const getFilterStr = () => {
    let filterStr = "";
    let counter = 0;
    for (const [key, value] of Object.entries(filter)) {
      if (key === "studio" && value === "all") continue;
      if (key === "finished" && value === "all") continue;
      if (value !== "") {
        if (key === "finished") {
          filterStr += `&filters[$and][${counter}][${key}][$eq]=${value === "finished" ? true : false}`;
        } else if (key === "creationTime") {
          if (value.from !== undefined && value.to !== undefined) {
            filterStr += `&filters[$and][${counter}][${key}][$gte]=${value.from.toISOString()}`;
            filterStr += `&filters[$and][${counter}][${key}][$lte]=${new Date(value.to.setDate(value.to.getDate() + 1)).toISOString()}`;
          } else if (value.from !== undefined && value.to === undefined) {
            filterStr += `&filters[$and][${counter}][${key}][$gte]=${value.from.toISOString()}`;
            // filterStr += `&filters[$and][${counter}][${key}][$lte]=${value.to.toISOString()}`;
          } else if (value.from === undefined && value.to !== undefined) {
            // filterStr += `&filters[$and][${counter}][${key}][$gte]=${value.from.toISOString()}`;
            filterStr += `&filters[$and][${counter}][${key}][$lte]=${new Date(value.to.getDate() + 1).toISOString()}`;
          } else {
            continue;
          }
          // console.log(filterStr);
        } else {
          filterStr += `&filters[$and][${counter}][${key}][$containsi]=${value}`;
        }
        counter++;
      }
      // console.log(`${key}: ${value}`);
    }
    // console.log(filterStr);
    if (filterStr !== "") {
      setFilterOn(true);
    } else {
      setFilterOn(false);
    }
    return filterStr;
  };

  useEffect(() => {
    let newPageIndex = pageIndex;
    let newPageSize = pageSize;
    if (totalEntries % pageSize === 0) {
      if (pageIndex > totalEntries / pageSize) {
        newPageIndex = 1;
      }
    } else {
      if (pageIndex > parseInt(totalEntries / pageSize) + 1) {
        newPageIndex = 1;
      }
    }

    // const filterStr = getFilterStr();

    const dataUrl =
      sort === ""
        ? `${apiUrl}/checkout-sessions?${getFilterStr()}&pagination[page]=${newPageIndex}&pagination[pageSize]=${newPageSize}`
        : desc
          ? `${apiUrl}/checkout-sessions?${getFilterStr()}&pagination[page]=${pageIndex}&pagination[pageSize]=${pageSize}&sort=${sort}:desc`
          : `${apiUrl}/checkout-sessions?${getFilterStr()}&pagination[page]=${newPageIndex}&pagination[pageSize]=${newPageSize}&sort=${sort}`;

    // console.log("URL is ", dataUrl);

    fetch(dataUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        // if (data.data.length !== 0) {
        setData(data.data);
        setLoading(false);
        setDataChanged(false);
        // setPageIndex(data.meta.pagination.page);
        // setPageSize(data.meta.pagination.pageSize);
        setPageCount(data.meta.pagination.pageCount);
        setTotalEntries(data.meta.pagination.total);
        // console.log("useEffect Triggered!!!!!!!!!!!!!!!!")
        // }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [pageIndex, pageSize, sort, desc, dataChanged, filter]);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No Inventory data</p>;

  // const dataRows = data.data.map((item: {}) => item.attributes);
  // const dataRows = data.data;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-lg font-bold">Checkout</h1>
      <ServerTable
        data={data}
        pageSize={pageSize}
        totalEntries={totalEntries}
        filter={filter}
        filterOn={filterOn}
        setNumRowSelected={setNumRowSelected}
        setPageIndex={setPageIndex}
        setSort={handleSort}
        setFilter={setFilter}
        addItem={addItem}
        updateItem={updateItem}
        deleteItem={deleteItem}
      />
      <div className="flex items-center justify-end space-x-2 py-4">
        <PaginationControls
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          totalEntries={totalEntries}
          numRowSelected={numRowSelected}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
}
