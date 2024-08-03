export type InventoryReportsFields = {
  createdAt: string;
  creatorName: string;
  inventorySize: string;
  notes: string;
  isFinished: string;
};

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  createdAt: TableFieldStatus;
  creatorName: TableFieldStatus;
  numItemsChecked: TableFieldStatus;
  inventorySize: TableFieldStatus;
  notes: TableFieldStatus;
  isFinished: TableFieldStatus;
}

export type ColumnKeys = keyof TableColumnStatus;

export const inventoryReportsColumns = [
  {
    accessorKey: "createdAt",
    header: "Created At",
    visible: true,
  },
  {
    accessorKey: "creatorName",
    header: "Creator",
    visible: true,
  },
  {
    accessorKey: "inventorySize",
    header: "Inventory Size",
    visible: true,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    visible: false,
  },
  {
    accessorKey: "isFinished",
    header: "isFinished",
    visible: true,
  },
];

export const inventoryReportsColumnsDefault = {
  createdAt: {
    header: "CreatedAt",
    visible: true,
  },
  creatorName: {
    header: "Creator",
    visible: true,
  },
  numItemsChecked: {
    header: "Checked Items",
    visible: true,
  },
  inventorySize: {
    header: "Inventory Size",
    visible: false,
  },
  notes: {
    header: "Notes",
    visible: false,
  },
  isFinished: {
    header: "isFinished",
    visible: true,
  },
};

// export default inventoryColumns;
