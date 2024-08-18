export type InventoryReportsFields = {
  created_at: string;
  created_by: string;
  inventory_size: string;
  notes: string;
  is_finished: string;
};

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  created_at: TableFieldStatus;
  created_by: TableFieldStatus;
  num_items_checked: TableFieldStatus;
  inventory_size: TableFieldStatus;
  notes: TableFieldStatus;
  is_finished: TableFieldStatus;
}

export type ColumnKeys = keyof TableColumnStatus;

export const inventoryReportsColumns = [
  {
    accessorKey: "created_at",
    header: "Created At",
    visible: true,
  },
  {
    accessorKey: "created_by",
    header: "Creator",
    visible: true,
  },
  {
    accessorKey: "inventory_size",
    header: "Inventory Size",
    visible: true,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    visible: false,
  },
  {
    accessorKey: "is_finished",
    header: "Finished",
    visible: true,
  },
];

export const inventoryReportsColumnsDefault = {
  created_at: {
    header: "CreatedAt",
    visible: true,
  },
  created_by: {
    header: "Creator",
    visible: true,
  },
  num_items_checked: {
    header: "Checked Items",
    visible: true,
  },
  inventory_size: {
    header: "Inventory Size",
    visible: false,
  },
  notes: {
    header: "Notes",
    visible: false,
  },
  is_finished: {
    header: "Finished",
    visible: true,
  },
};

// export default inventoryColumns;
