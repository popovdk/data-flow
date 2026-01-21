export const EXAMPLE_DSL = `node WebCheckout {
  sessionId: String
  user {
    id: String
    email: String
  }
  cart {
    id: String
    total: Money
    currency: String
  }
  payment {
    cardToken: String
  }
  shipping {
    address {
      city: String
      country: String
      postalCode: String
    }
  }
}

node PricingService {
  cartId: String
  currency: String
  taxTotal: Money
  discountTotal: Money
  total: Money
}

node OrderService {
  orderId: String
  userId: String
  userEmail: String
  total: Money
  currency: String
  taxTotal: Money
  discountTotal: Money
  paymentToken: String
  transactionId: String
  paymentStatus: String
  fraudDecision: String
  inventoryReservationId: String
  inventoryStatus: String
  shipmentId: String
  shippingCity: String
  shippingCountry: String
  shippingPostalCode: String
  status: String
}

node FraudService {
  orderId: String
  amount: Money
  currency: String
  riskScore: Float
  decision: String
}

node PaymentGateway {
  paymentToken: String
  amount: Money
  currency: String
  transactionId: String
  authStatus: String
}

node InventoryService {
  orderId: String
  reservationId: String
  itemsReserved: Boolean
}

node Fulfillment {
  orderId: String
  shipmentId: String
  carrier: String
  trackingNumber: String
}

node Notifications {
  userEmail: String
  orderId: String
  shipmentId: String
  status: String
  trackingNumber: String
}

node Analytics {
  sessionId: String
  eventType: String
  orderId: String
  revenue: Money
  currency: String
  taxTotal: Money
  discountTotal: Money
  riskScore: Float
  carrier: String
}

node CRM {
  customerId: String
  orderId: String
  lifetimeValue: Money
}

WebCheckout.sessionId -> Analytics.sessionId
WebCheckout.user.id -> OrderService.userId
WebCheckout.user.email -> OrderService.userEmail
WebCheckout.cart.id -> PricingService.cartId
WebCheckout.cart.total -> PricingService.total
WebCheckout.cart.currency -> PricingService.currency
PricingService.cartId -> OrderService.orderId
PricingService.taxTotal -> OrderService.taxTotal
PricingService.discountTotal -> OrderService.discountTotal
PricingService.total -> OrderService.total
PricingService.currency -> OrderService.currency
WebCheckout.payment.cardToken -> OrderService.paymentToken
WebCheckout.shipping.address.city -> OrderService.shippingCity
WebCheckout.shipping.address.country -> OrderService.shippingCountry
WebCheckout.shipping.address.postalCode -> OrderService.shippingPostalCode
OrderService.orderId -> FraudService.orderId
OrderService.total -> FraudService.amount
OrderService.currency -> FraudService.currency
FraudService.decision -> OrderService.fraudDecision
FraudService.riskScore -> Analytics.riskScore
OrderService.paymentToken -> PaymentGateway.paymentToken
OrderService.total -> PaymentGateway.amount
OrderService.currency -> PaymentGateway.currency
PaymentGateway.transactionId -> OrderService.transactionId
PaymentGateway.authStatus -> OrderService.paymentStatus
OrderService.orderId -> InventoryService.orderId
InventoryService.reservationId -> OrderService.inventoryReservationId
InventoryService.itemsReserved -> OrderService.inventoryStatus
OrderService.orderId -> Fulfillment.orderId
Fulfillment.shipmentId -> OrderService.shipmentId
Fulfillment.carrier -> Analytics.carrier
Fulfillment.trackingNumber -> Notifications.trackingNumber
OrderService.userEmail -> Notifications.userEmail
OrderService.orderId -> Notifications.orderId
OrderService.status -> Notifications.status
OrderService.shipmentId -> Notifications.shipmentId
OrderService.orderId -> Analytics.orderId
OrderService.total -> Analytics.revenue
OrderService.currency -> Analytics.currency
OrderService.taxTotal -> Analytics.taxTotal
OrderService.discountTotal -> Analytics.discountTotal
OrderService.status -> Analytics.eventType
OrderService.userId -> CRM.customerId
OrderService.orderId -> CRM.orderId
OrderService.total -> CRM.lifetimeValue
`;
