export type InventoryColumnFields = {
  m_tech_barcode: string;
  make: string;
  model: string;
  description: string;
  category: string;
  accessories: string;
  comments: string;
  storage_location: string;
  out: boolean;
  broken: boolean;
};

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  // image: TableFieldStatus;
  m_tech_barcode: TableFieldStatus;
  make: TableFieldStatus;
  model: TableFieldStatus;
  description: TableFieldStatus;
  category: TableFieldStatus;
  accessories: TableFieldStatus;
  comments: TableFieldStatus;
  storage_location: TableFieldStatus;
  out: TableFieldStatus;
  broken: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const inventoryColumns = [
  {
    accessorKey: "image",
    header: "Image",
    visible: true,
  },
  {
    accessorKey: "m_tech_barcode",
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
    accessorKey: "storage_location",
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

export const inventoryColumnsDefault = {
  // image: {
  //   header: "Image",
  //   visible: false,
  // },
  m_tech_barcode: {
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
  storage_location: {
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
