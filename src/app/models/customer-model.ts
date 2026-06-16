export interface CustomerProfileDetails {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl: string;
  mainAddress: string;
  totalRequests: number;
  totalReviews: number;
  memberSinceYear: number;
}
export interface CustomerProfileUpdate {
  name: string;
  phoneNumber: string;
  mainAddress: string;
}
