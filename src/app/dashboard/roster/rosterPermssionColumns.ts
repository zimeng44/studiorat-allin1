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
  stuN: TableFieldStatus;
  netId: TableFieldStatus;
  stuName: TableFieldStatus;
  academicLevel: TableFieldStatus;
  academicProgram: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const rosterColumnsDefault = {
  stuN: {
    header: "Student Number",
    visible: true,
  },
  netId: {
    header: "NetID",
    visible: true,
  },
  stuName: {
    header: "Student Name",
    visible: true,
  },
  academicLevel: {
    header: "Level",
    visible: true,
  },
  academicProgram: {
    header: "Program",
    visible: false,
  },
};

export const rosterPermissionColumns = [
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
];
