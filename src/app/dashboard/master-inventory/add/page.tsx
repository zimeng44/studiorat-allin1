import React from "react";
import AddItemForm from "@/components/forms/AddItemForm";

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
      <h1 className="text-lg font-bold px-2 py-2">Add Item</h1>
      <div className="flex items-center px-4">
        <AddItemForm rowData={INITIAL_STATE} />
      </div>
    </div>
  );
};

export default AddItem;
