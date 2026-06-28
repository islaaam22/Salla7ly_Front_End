export interface TechnicianAdmin {
  id: number;
  userId: string;
  name: string;
  imageUrl?: string;
  specialization?: string;
  experienceYears?: number;
  overallRating?: number;
  completedJobs?: number;
  isApproved: boolean;
  isActive: boolean;
  phoneNumber?: string;
  bio?: string;
  certificates?: string[];
  completionRate?: number;
}

export interface TechnicianVerification {
  id: number;
  technicianId: number;
  status?: 'Pending' | 'Approved' | 'Rejected' | string;
  rejectionReason?: string;
  createdAt?: string;
  // Identity document images
  documentUrlFront?: string;
  documentUrlBack?: string;
  // Degree / certificate images (array)
  degreeCertificateUrls?: string[];
  // Legacy single-image fields (kept for compatibility)
  nationalIdImageUrl?: string;
  certificateImageUrl?: string;
}

export interface PortfolioItem {
  id: number;
  technicianId: number;
  title?: string;
  description?: string;
  // The service document uses these field names
  imageUrlBefore?: string;
  imageUrlAfter?: string;
  // Legacy field names kept for compatibility
  beforeImageUrl?: string;
  afterImageUrl?: string;
  createdAt?: string;
}

export interface TechnicianReview {
  id: number;
  // The API may return any of these field names for the rating
  overallScore?: number;
  rating?: number;
  qualityScore?: number;
  punctualityScore?: number;
  communicationScore?: number;
  valueScore?: number;
  comment?: string;
  customerName?: string;
  createdAt?: string;
}

export interface TechnicianWithVerification extends TechnicianAdmin {
  verification: TechnicianVerification | null;
  uiStatus: 'approved' | 'pending' | 'rejected' | 'new';
}
