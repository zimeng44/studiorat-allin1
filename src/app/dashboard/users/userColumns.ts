export type UserFields = {
  username: string;
  stuId: string;
  fullName: string;
  academicLevel: string;
  email: string;
  bio: string;
  blocked: boolean;
};

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  username: TableFieldStatus;
  stuId: TableFieldStatus;
  fullName: TableFieldStatus;
  academicLevel: TableFieldStatus;
  email: TableFieldStatus;
  bio: TableFieldStatus;
  blocked: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const userColumns = [
  {
    accessorKey: "username",
    header: "NetID",
    visible: true,
  },
  {
    accessorKey: "stuId",
    header: "ID Barcode",
    visible: true,
  },
  {
    accessorKey: "fullName",
    header: "Name",
    visible: true,
  },
  {
    accessorKey: "academicLevel",
    header: "Academic Level",
    visible: false,
  },
  {
    accessorKey: "eamil",
    header: "Email",
    visible: false,
  },
  {
    accessorKey: "bio",
    header: "User Bio",
    visible: false,
  },
  {
    accessorKey: "blocked",
    header: "Blocked",
    visible: false,
  },
];

export const userColumnsDefault = {
  username: {
    header: "NetID",
    visible: true,
  },
  stuId: {
    header: "ID Barcode",
    visible: false,
  },
  fullName: {
    header: "Name",
    visible: true,
  },
  academicLevel: {
    header: "Academic Level",
    visible: true,
  },
  email: {
    header: "Email",
    visible: false,
  },
  bio: {
    header: "User Bio",
    visible: false,
  },
  blocked: {
    header: "Blocked",
    visible: true,
  },
};

// export default inventoryColumns;
