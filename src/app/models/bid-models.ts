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
}

export interface SubmitBidDto {
  price: number;
  proposalMessage: string;
  estimatedDurationMinutes: number;
}