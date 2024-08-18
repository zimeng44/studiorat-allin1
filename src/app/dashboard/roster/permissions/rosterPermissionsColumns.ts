// export type InventoryColumnFields = {
//   stuN?: string;
//   netId?: string;
//   stuName?: string;
//   academicLevel?: string;
//   academicProgram?: string;
// };

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  permission_code: TableFieldStatus;
  permission_title: TableFieldStatus;
  instructor: TableFieldStatus;
  permission_details: TableFieldStatus;
  permitted_studios: TableFieldStatus;
  start_date: TableFieldStatus;
  end_date: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const rosterPermissionsColumnsDefault = {
  permission_code: {
    header: "Permission Code",
    visible: true,
  },
  permission_title: {
    header: "Title",
    visible: true,
  },
  instructor: {
    header: "Instructor",
    visible: true,
  },
  permission_details: {
    header: "Details",
    visible: true,
  },
  permitted_studios: {
    header: "Permitted Studios",
    visible: false,
  },
  start_date: {
    header: "Start Date",
    visible: false,
  },
  end_date: {
    header: "End Date",
    visible: false,
  },
};

export const rosterPermissionsColumnsInEditRoster = [
  {
    accessorKey: "permission_code",
    header: "Permission Code",
    visible: true,
  },
  {
    accessorKey: "permission_title",
    header: "Title",
    visible: true,
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    visible: true,
  },
  {
    accessorKey: "permission_details",
    header: "Details",
    visible: true,
  },
  {
    accessorKey: "permitted_studios",
    header: "Permitted Studios",
    visible: true,
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    visible: false,
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    visible: false,
  },
];

export const rosterPermissionsColumns = [
  {
    accessorKey: "permission_code",
    header: "Permission Code",
    visible: true,
  },
  {
    accessorKey: "permission_title",
    header: "Title",
    visible: true,
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    visible: true,
  },
  {
    accessorKey: "permission_details",
    header: "Details",
    visible: false,
  },
  {
    accessorKey: "permitted_studios",
    header: "Permitted Studios",
    visible: false,
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    visible: false,
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    visible: false,
  },
];
