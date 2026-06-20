export interface ServiceRequest {
  id: number;
  title: string;
  status: 'open' | 'completed' | 'cancelled' | 'in_progress';
  urgency: 'low' | 'medium' | 'high';
  isEmergency: boolean;
  scheduledAt: string;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface RequestsByCategory {
  category: Category;
  requests: ServiceRequest[];
  totalBids: number
}
