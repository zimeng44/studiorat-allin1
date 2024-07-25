import React from "react";
import AddItemForm from "@/components/forms/AddItemForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const INITIAL_STATE = {
  mTechBarcode: "",
  make: "",
  model: "",
  category: "",
  description: "",
  accessories: "",
  storageLocation: "Floor 8",
  comments: "",
  out: false,
  broken: false,
};

const AddItem = () => {
  return (
    <div className="p-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/master-inventory">
              Master Inventory
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">Add Item</h1>
      <div className="flex items-center px-4">
        <AddItemForm rowData={INITIAL_STATE} />
      </div>
    </div>
  );
};

export default AddItem;
