export interface Bid {
  id: number;
  serviceRequestId: number;
  technicianId: number;
  technicianName: string;
  technicianImage: string | null;
  price: number;
  proposalMessage: string;
  estimatedDurationMinutes: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  validUntil: string;
  submittedAt: string;
  respondedAt: string | null;
  // Optional technician metadata — only present if the backend includes it
  // on the bid DTO. UI must fall back gracefully (never invent values) when absent.
  technicianRating?: number;
  technicianCompletedJobs?: number;
  technicianIsVerified?: boolean;
}

export interface SubmitBidDto {
  price: number;
  proposalMessage: string;
  estimatedDurationMinutes: number;
}
