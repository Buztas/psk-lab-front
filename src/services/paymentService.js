import { authService } from "./authService";

const API_BASE_URL = "http://localhost:8080";

export const paymentService = {
  async createPayment(orderId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment");
      }

      return { success: true, data: await response.json() };
    } catch (error) {
      console.error("Error creating payment:", error);
      return { success: false, status: error };
    }
  },

  async updatePaymentStatus(paymentId, status, transactionId) {
    try {
      const token = authService.getToken();
      
      console.log("Updating payment status:", { paymentId, status, transactionId }); // Debug log
      
      const requestBody = {
        status: status,
        transactionId: transactionId
      };
      
      console.log("Request body:", requestBody); // Debug log
      
      const response = await fetch(
        `${API_BASE_URL}/api/payments/${paymentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        let errorMessage = "Failed to update payment status";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("Error response:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response");
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Update successful:", result); // Debug log
      return result;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  },

  async getPayment(paymentId) {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to get payment");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting payment:", error);
      throw error;
    }
  },

  async getPaymentByOrderId(orderId) {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/payments/my-payments?page=0&size=100&sort=paymentDate`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to get user payments");
      }

      const paymentsResponse = await response.json();
      const payments = paymentsResponse.content || [];

      const payment = payments.find(
        (p) => p.order?.orderId === orderId || p.orderId === orderId,
      );

      if (!payment) {
        return { success: false };
      }

      return { success: true, data: payment };
    } catch (error) {
      console.error("Error getting payment by order ID:", error);
      throw error;
    }
  },

  async getAllPayments(page = 0, size = 50, sort = "paymentDate,desc") {
    try {
      const token = authService.getToken();
      console.log("Fetching payments with token:", token ? "Present" : "Missing"); // Debug log
      
      const response = await fetch(
        `${API_BASE_URL}/api/payments?page=${page}&size=${size}&sort=${sort}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Get all payments response status:", response.status); // Debug log

      if (!response.ok) {
        let errorMessage = "Failed to get all payments";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("Error response:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response");
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Fetched payments successfully:", result); // Debug log
      return result; // Will return a Page<PaymentViewDto> object
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw error;
    }
  },

  async deletePayment(paymentId, version) {
    try {
      const token = authService.getToken();
      
      console.log("Deleting payment:", { paymentId, version }); // Debug log
      
      const response = await fetch(
        `${API_BASE_URL}/api/payments/${paymentId}?version=${version}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Delete response status:", response.status); // Debug log

      if (!response.ok) {
        let errorMessage = "Failed to delete payment";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("Delete error response:", errorData);
        } catch (parseError) {
          console.error("Could not parse delete error response");
        }
        throw new Error(errorMessage);
      }

      console.log("Payment deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  },
};