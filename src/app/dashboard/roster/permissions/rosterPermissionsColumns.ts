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
  courseN: TableFieldStatus;
  courseTitle: TableFieldStatus;
  instructor: TableFieldStatus;
  permissionDetails: TableFieldStatus;
  permittedStudios: TableFieldStatus;
  startDate: TableFieldStatus;
  endDate: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const rosterPermissionsColumnsDefault = {
  courseN: {
    header: "Course Number",
    visible: true,
  },
  courseTitle: {
    header: "Title",
    visible: true,
  },
  instructor: {
    header: "Instructor",
    visible: true,
  },
  permissionDetails: {
    header: "Details",
    visible: false,
  },
  permittedStudios: {
    header: "Permitted Studios",
    visible: false,
  },
  startDate: {
    header: "Start Date",
    visible: false,
  },
  endDate: {
    header: "End Date",
    visible: false,
  },
};

export const rosterPermissionsColumnsInEditRoster = [
  {
    accessorKey: "courseN",
    header: "Course Number",
    visible: true,
  },
  {
    accessorKey: "courseTitle",
    header: "Title",
    visible: true,
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    visible: true,
  },
  {
    accessorKey: "permissionDetails",
    header: "Details",
    visible: true,
  },
  {
    accessorKey: "permittedStudios",
    header: "Permitted Studios",
    visible: true,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    visible: false,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    visible: false,
  },
];

export const rosterPermissionsColumns = [
  {
    accessorKey: "courseN",
    header: "Course Number",
    visible: true,
  },
  {
    accessorKey: "courseTitle",
    header: "Title",
    visible: true,
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    visible: true,
  },
  {
    accessorKey: "permissionDetails",
    header: "Details",
    visible: false,
  },
  {
    accessorKey: "permittedStudios",
    header: "Permitted Studios",
    visible: false,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    visible: false,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    visible: false,
  },
];
