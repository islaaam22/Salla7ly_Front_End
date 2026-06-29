export interface ServiceRequest {
  id: number;
  title: string;
  status: 'open' | 'assigned' | 'inprogress' | 'completed' | 'cancelled';
  urgency: 'low' | 'medium' | 'high';
  isEmergency: boolean;
  scheduledAt: string;
  categoryId: number;
  technicianName?: string;
  price?: number;
  address?: string;
  description?: string;
  customerName?: string;
  imageUrls?: string[];
  categoryName?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface RequestsByCategory {
  category: Category;
  requests: ServiceRequest[];
  totalBids: number;
}
