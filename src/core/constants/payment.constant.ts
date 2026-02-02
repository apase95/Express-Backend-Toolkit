export enum PaymentProvider {
    STRIPE = 'stripe',
    VNPAY = 'vnpay',
    COD = 'cod'
};

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
};

export enum Currency {
    VND = 'VND',
    USD = 'USD'
};