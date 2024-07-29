export type InventoryItem = {
  id?: number;
  mTechBarcode?: string;
  make?: string;
  model?: string;
  category?: string;
  description?: string;
  accessories?: string;
  storageLocation?: string;
  comments?: string;
  out?: boolean;
  broken?: boolean;
};

// export type CheckoutSessionSent = {
//   creationTime: string;
//   stuIDCheckout: string;
//   stuIDCheckin: string;
//   studio: string;
//   otherLocation: string;
//   creationMonitor: string;
//   finishTime: string;
//   finishMonitor: string;
//   finished: boolean;
//   notes: string;
//   inventory_items: number[];
//   studioUser: number[];
// };

export type CheckoutSessionType = {
  id?: number;
  creationTime?: Date | string;
  stuIDCheckout?: string;
  stuIDCheckin?: string;
  studio?: string;
  otherLocation?: string;
  creationMonitor?: string;
  finishTime?: Date | string;
  finishMonitor?: string;
  finished?: boolean;
  notes?: string;
  inventory_items?:
    | InventoryItem[]
    | number[]
    | undefined
    | { data: InventoryItem[] };
  user?: UserType;
};

export type BookingType = {
  id?: number;
  startTime?: Date | string;
  endTime?: Date | string;
  // studio?: string;
  user?: UserType;
  useLocation?: string;
  type?: string;
  bookingCreator?: UserType;
  notes?: string;
  inventory_items?:
    | InventoryItem[]
    | number[]
    | undefined
    | { data: InventoryItem[] };
};

export type UserType = {
  id?: number;
  stuId?: string;
  firstName?: string;
  lastName?: string;
  lastUse?: string;
  email?: string;
  userType?: string;
  blocked?: boolean;
};

export const studioList = [
  "Other",
  "Floor 8 General",
  "Studio A",
  "Studio B",
  "Studio C",
  "Studio D",
  "Studio D1",
  "Studio E",
  "Studio F",
  "Dolan",
  "RLab",
];

export const bookingLocationList: string[] = [
  "Outside",
  "Studio A",
  "Studio B",
  "Studio C",
  "Studio D",
  "Studio D1",
  "Studio E",
  "Studio F",
  "Dolan",
  "RLab",
  "Paulson",
];

export const bookingTypeList = [
  "Same Day",
  "Overnight",
  "Weekend",
  "Exception",
];

export const bookingTimeList = [
  "08:00 AM",
  "08:15 AM",
  "08:30 AM",
  "08:45 AM",
  "09:00 AM",
  "09:15 AM",
  "09:30 AM",
  "09:45 AM",
  "10:00 AM",
  "10:15 AM",
  "10:30 AM",
  "10:45 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
  "12:15 PM",
  "12:30 PM",
  "12:45 PM",
  "01:00 PM",
  "01:15 PM",
  "01:30 PM",
  "01:45 PM",
  "02:00 PM",
  "02:15 PM",
  "02:30 PM",
  "02:45 PM",
  "03:00 PM",
  "03:15 PM",
  "03:30 PM",
  "03:45 PM",
  "04:00 PM",
  "04:15 PM",
  "04:30 PM",
  "04:45 PM",
  "05:00 PM",
  "05:15 PM",
  "05:30 PM",
  "05:45 PM",
  "06:00 PM",
  "06:15 PM",
  "06:30 PM",
  "06:45 PM",
  "07:00 PM",
  "07:15 PM",
  "07:30 PM",
  "07:45 PM",
  "08:00 PM",
  "08:15 PM",
  "08:30 PM",
  "08:45 PM",
  "09:00 PM",
  "09:15 PM",
  "09:30 PM",
  "09:45 PM",
  "10:00 PM",
  "10:15 PM",
  "10:30 PM",
  "10:45 PM",
];
