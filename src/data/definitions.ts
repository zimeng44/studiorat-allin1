export type InventoryItem = {
  id?: number;
  mTechBarcode: string;
  make: string;
  model: string;
  category: string;
  description: string;
  accessories: string;
  storageLocation: string;
  comments: string;
  out: boolean;
  broken: boolean;
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
  creationTime: string;
  stuIDCheckout: string;
  stuIDCheckin: string;
  studio: string;
  otherLocation: string;
  creationMonitor: string;
  finishTime: string;
  finishMonitor: string;
  finished: boolean;
  notes: string;
  inventory_items: InventoryItem[];
  studioUser: UserType[];
};

export const studioList = [
  "Other",
  "Studio A",
  "Studio B",
  "Studio C",
  "Studio D",
  "Studio D1",
  "Studio E",
  "Studio F",
  "Dolan",
  "RLab",
  "Floor 8 General",
];

export type UserType = {
  id?: number;
  stuId: string;
  firstName: string;
  lastName: string;
  lastUse?: string;
  email: string;
  userType?: string;
  blocked: boolean;
};
