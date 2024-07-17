export type InventoryColumnFields = {
  mTechBarcode: string;
  make: string;
  model: string;
  description: string;
  category: string;
  accessories: string;
  serialNumber: string;
  comments: string;
  storageLocation: string;
  out: boolean;
  broken: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export const inventoryColumns = [
  {
    accessorKey: "mTechBarcode",
    header: "MTech Barcode",
    visible: true,
  },
  {
    accessorKey: "make",
    header: "Make",
    visible: true,
  },
  {
    accessorKey: "model",
    header: "Model",
    visible: true,
  },
  {
    accessorKey: "category",
    header: "Category",
    visible: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    visible: false,
  },
  {
    accessorKey: "accessories",
    header: "Accessories",
    visible: false,
  },
  {
    accessorKey: "storageLocation",
    header: "Storage Location",
    visible: false,
  },
  {
    accessorKey: "comments",
    header: "Comments",
    visible: false,
  },
  {
    accessorKey: "out",
    header: "Out",
    visible: true,
  },
  {
    accessorKey: "broken",
    header: "Broken",
    visible: true,
  },
];

// export default inventoryColumns;
