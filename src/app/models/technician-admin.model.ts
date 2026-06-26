// src/app/models/technician-admin.model.ts

export interface TechnicianAdmin {
  id: number;
  userId?: string;
  name: string;
  imageUrl?: string | null;
  specialization?: string | null;
  experienceYears?: number | null;
  overallRating?: number | null;
  completedJobs?: number | null;
  isApproved: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  subscriptionTier?: string;
  phoneNumber?: string | null;
  bio?: string | null;
  certificates?: string[] | null;
  completionRate?: number | null;
}

export interface TechnicianVerification {
  id: number;
  technicianId: number;
  technicianName?: string;
  idNumber?: string;
  /** Array of PDF/image URLs for degree certificates */
  degreeCertificateUrls?: string[];
  /** Front side of national ID */
  documentUrlFront?: string;
  /** Back side of national ID */
  documentUrlBack?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | string;
  rejectionReason?: string | null;
  submittedAt?: string;
  reviewedAt?: string | null;
}

export interface PortfolioItem {
  id: number;
  technicianId: number;
  title?: string;
  description?: string;
  /** API returns imageUrlBefore */
  imageUrlBefore?: string;
  /** API returns imageUrlAfter */
  imageUrlAfter?: string;
  uploadedAt?: string;
}

export interface TechnicianReview {
  id: number;
  customerName?: string;
  qualityScore?: number;
  punctualityScore?: number;
  communicationScore?: number;
  valueScore?: number;
  overallScore?: number;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export interface TechnicianWithVerification extends TechnicianAdmin {
  verification?: TechnicianVerification | null;
  /** Derived UI status */
  uiStatus?: 'approved' | 'pending' | 'rejected' | 'new';
}
