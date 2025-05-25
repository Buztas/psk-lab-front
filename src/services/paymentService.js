import { authService } from './authService'

const API_BASE_URL = 'http://localhost:8080'

export const paymentService = {
  async createPayment(orderId) {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create payment')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  },

  async updatePaymentStatus(paymentId, status, transactionId) {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status,
          transactionId: transactionId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update payment status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  },

  async getPayment(paymentId) {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get payment')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting payment:', error)
      throw error
    }
  },

  async getPaymentByOrderId(orderId) {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/api/payments/my-payments?page=0&size=100&sort=paymentDate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get user payments')
      }

      const paymentsResponse = await response.json()
      const payments = paymentsResponse.content || []
      
      const payment = payments.find(p => p.order?.orderId === orderId || p.orderId === orderId)
      
      if (!payment) {
        throw new Error('No payment found for this order')
      }
      
      return payment
    } catch (error) {
      console.error('Error getting payment by order ID:', error)
      throw error
    }
  }
}