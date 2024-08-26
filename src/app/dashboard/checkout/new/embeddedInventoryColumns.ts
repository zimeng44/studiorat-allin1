export type InventoryColumnFields = {
  mTechBarcode: string;
  make: string;
  model: string;
  description: string;
  category: string;
  accessories: string;
  comments: string;
  storageLocation: string;
  out: boolean;
  broken: boolean;
};

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  mTechBarcode: TableFieldStatus;
  make: TableFieldStatus;
  model: TableFieldStatus;
  description: TableFieldStatus;
  category: TableFieldStatus;
  accessories: TableFieldStatus;
  comments: TableFieldStatus;
  storageLocation: TableFieldStatus;
  out: TableFieldStatus;
  broken: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

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
    visible: false,
  },
  {
    accessorKey: "broken",
    header: "Broken",
    visible: false,
  },
];

export const inventoryColumnsFinished = [
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
    visible: false,
  },
  {
    accessorKey: "broken",
    header: "Broken",
    visible: false,
  },
];

export const inventoryColumnsDefault = {
  mTechBarcode: {
    header: "MTech Barcode",
    visible: true,
  },
  make: {
    header: "Make",
    visible: true,
  },
  model: {
    header: "Model",
    visible: true,
  },
  category: {
    header: "Category",
    visible: false,
  },
  description: {
    header: "Description",
    visible: false,
  },
  accessories: {
    header: "Accessories",
    visible: false,
  },
  storageLocation: {
    header: "Storage Location",
    visible: false,
  },
  comments: {
    header: "Comments",
    visible: false,
  },
  out: {
    header: "Out",
    visible: true,
  },
  broken: {
    header: "Broken",
    visible: true,
  },
};

// export default inventoryColumns;
