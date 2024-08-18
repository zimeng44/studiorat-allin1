export type ColumnFields = {
  creation_time: string;
  user_name: string;
  return_id: string;
  studio: string;
  other_location: string;
  created_by: string;
  finished_by: string;
  finish_time: string;
  notes: string;
  finished: boolean;
  // inventory_items: {};
  // studio_user: {};
};

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  creation_time: TableFieldStatus;
  checkout_id: TableFieldStatus;
  return_id: TableFieldStatus;
  userName: TableFieldStatus;
  studio: TableFieldStatus;
  other_location: TableFieldStatus;
  created_by: TableFieldStatus;
  finished_by: TableFieldStatus;
  finish_time: TableFieldStatus;
  notes: TableFieldStatus;
  finished: TableFieldStatus;
}
export type ColumnKeys = keyof TableColumnStatus;

export const checkoutColumns = [
  {
    accessorKey: "creation_time",
    header: "Creation Time",
    visible: true,
  },
  {
    accessorKey: "checkout_id",
    header: "Checkout ID",
    visible: false,
  },
  {
    accessorKey: "return_id",
    header: "Return ID",
    visible: false,
  },
  {
    accessorKey: "userName",
    header: "User Name",
    visible: true,
  },
  {
    accessorKey: "studio",
    header: "Studio",
    visible: true,
  },
  {
    accessorKey: "other_location",
    header: "Other Location",
    visible: false,
  },
  {
    accessorKey: "created_by",
    header: "Created by",
    visible: false,
  },
  {
    accessorKey: "finished_by",
    header: "Finished by",
    visible: false,
  },
  {
    accessorKey: "finish_time",
    header: "Finish Time",
    visible: false,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    visible: false,
  },
  {
    accessorKey: "finished",
    header: "Finished",
    visible: true,
  },

  // {
  //   accessorKey: "inventory_items",
  //   header: "Inventory Items",
  //   visible: true,
  // },
  // {
  //   accessorKey: "studio_user",
  //   header: "Studio User",
  //   visible: true,
  // },
];

export const checkoutColumnsDefault = {
  creation_time: {
    header: "Creation Time",
    visible: true,
  },
  checkout_id: {
    header: "Checkout ID",
    visible: false,
  },
  return_id: {
    header: "Return ID",
    visible: false,
  },
  userName: {
    header: "User Name",
    visible: true,
  },
  studio: {
    header: "Studio",
    visible: true,
  },
  other_location: {
    header: "Other Location",
    visible: false,
  },
  created_by: {
    header: "Created by",
    visible: false,
  },
  finished_by: {
    header: "Finished by",
    visible: false,
  },
  finish_time: {
    header: "Finish Time",
    visible: false,
  },
  notes: {
    header: "Notes",
    visible: false,
  },
  finished: {
    header: "Status",
    visible: true,
  },

  // {
  //   accessorKey: "inventory_items",
  //   header: "Inventory Items",
  //   visible: true,
  // },
  // {
  //   accessorKey: "studio_user",
  //   header: "Studio User",
  //   visible: true,
  // },
};

export default checkoutColumns;
