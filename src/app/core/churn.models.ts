export type PreferredLoginDevice = 'Mobile Phone' | 'Phone' | 'Computer';
export type PreferredPaymentMode = 'Credit Card' | 'Debit Card' | 'E wallet' | 'Cash on Delivery' | 'UPI';
export type Gender = 'Male' | 'Female';
export type PreferedOrderCat = 'Mobile Phone' | 'Fashion' | 'Grocery' | 'Laptop & Accessory' | 'Others';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced';

/** Data pelanggan mentah -- field & nama harus sama persis dengan api/schemas.py (CustomerData) di backend. */
export interface CustomerData {
  Tenure: number;
  PreferredLoginDevice: PreferredLoginDevice;
  CityTier: number;
  WarehouseToHome: number;
  PreferredPaymentMode: PreferredPaymentMode;
  Gender: Gender;
  HourSpendOnApp: number;
  NumberOfDeviceRegistered: number;
  PreferedOrderCat: PreferedOrderCat;
  SatisfactionScore: number;
  MaritalStatus: MaritalStatus;
  NumberOfAddress: number;
  Complain: 0 | 1;
  OrderAmountHikeFromlastYear: number;
  CouponUsed: number;
  OrderCount: number;
  DaySinceLastOrder: number;
  CashbackAmount: number;
}

export interface PredictionResponse {
  churn: boolean;
  churn_probability: number;
  risk_level: 'Tinggi' | 'Aman';
}

export interface ModelInfo {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
}
