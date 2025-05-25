"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../AdminNavbar";
import { paymentService } from "@/services/paymentService";
import authService from "@/services/authService";
import styles from "./../../admin-dashboard.module.css";

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const loadPaymentsPage = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        const currentUser = authService.getCurrentUser();
        if (currentUser.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        await fetchPayments();
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Authentication failed.");
        setLoading(false);
      }
    };

    loadPaymentsPage();
  }, [router]);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await paymentService.getAllPayments(0, 100);
      console.log("Fetched payments:", response); // Debug log
      setPayments(response.content || []);
    } catch (err) {
      console.error("Payment fetch failed:", err);
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId, version) => {
    if (!paymentId) {
      console.warn("Missing paymentId for deletion");
      return;
    }

    // Make sure version is provided
    if (version === undefined || version === null) {
      console.warn("Missing version for deletion");
      alert("Version information is missing. Please refresh the page and try again.");
      return;
    }

    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      console.log(`Deleting payment: ${paymentId}, version: ${version}`); // Debug log
      await paymentService.deletePayment(paymentId, version);
      setPayments((prev) => prev.filter((p) => p.paymentId !== paymentId));
      alert("Payment deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Failed to delete payment: ${err.message}`);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus, currentTransactionId) => {
    if (!paymentId) {
      console.warn("Missing paymentId for status update");
      return;
    }

    // Find the current payment to get the current status
    const currentPayment = payments.find(p => p.paymentId === paymentId);
    if (!currentPayment) {
      console.warn("Payment not found in current list");
      return;
    }

    // Don't update if status is the same
    if (currentPayment.status === newStatus) {
      return;
    }

    setUpdating(prev => ({ ...prev, [paymentId]: true }));
    
    try {
      console.log(`Updating payment status: ${paymentId}, status: ${newStatus}, transactionId: ${currentTransactionId}`); // Debug log
      
      await paymentService.updatePaymentStatus(
        paymentId,
        newStatus,
        currentTransactionId || null
      );
      
      // Update local state immediately for better UX
      setPayments(prev => prev.map(p => 
        p.paymentId === paymentId 
          ? { ...p, status: newStatus }
          : p
      ));
      
      // Optionally refetch to ensure consistency
      // await fetchPayments();
      
      console.log("Status updated successfully");
    } catch (err) {
      console.error("Status update failed:", err);
      alert(`Failed to update payment status: ${err.message}`);
      
      // Revert the select to original status on error
      await fetchPayments();
    } finally {
      setUpdating(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const statusOptions = ["PENDING", "COMPLETED", "FAILED", "CANCELLED"];

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="payments" />
      <div className={styles.contentContainer}>
        <h2 className={styles.pageTitle}>All Payments</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className={styles.emptyContainer}>No payments found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Version</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td>{p.paymentId}</td>
                    <td>{p.orderId}</td>
                    <td>{p.transactionId || 'N/A'}</td>
                    <td>
                      <select
                        value={p.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            p.paymentId,
                            e.target.value,
                            p.transactionId
                          )
                        }
                        disabled={updating[p.paymentId]}
                        style={{
                          opacity: updating[p.paymentId] ? 0.5 : 1,
                          cursor: updating[p.paymentId] ? 'wait' : 'pointer'
                        }}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {updating[p.paymentId] && <span> ⏳</span>}
                    </td>
                    <td>{p.amount} €</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>{p.version}</td>
                    <td>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDelete(p.paymentId, p.version)}
                        disabled={updating[p.paymentId]}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}