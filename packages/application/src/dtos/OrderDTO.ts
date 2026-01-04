export interface OrderDTO {
  id: string;
  userId: string;
  status: string;
  statusDisplay: string;
  statusColor: string;
  totalAmount: number;
  totalFormatted: string;
  itemCount: number;
  deliveryAddress: string;
  deliveryNotes: string | null;
  estimatedDeliveryTime: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  userId: string;
  items: {
    foodId: string;
    quantity: number;
    notes?: string;
  }[];
  deliveryAddress: string;
  deliveryNotes?: string;
}

export interface UpdateOrderStatusDTO {
  orderId: string;
  newStatus: string;
  updatedBy: string;
}