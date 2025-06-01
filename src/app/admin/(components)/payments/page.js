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
  const [selectedStatuses, setSelectedStatuses] = useState({});

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

        const paymentsData = await fetchPayments();
        setSelectedStatuses(
          paymentsData.reduce((acc, p) => {
            acc[p.id] = p.status;
            return acc;
          }, {}),
        );
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
    const data = response.content || [];
    setPayments(data);
    setSelectedStatuses(
      data.reduce((acc, p) => {
        acc[p.id] = p.status;
        return acc;
      }, {})
    );
    return data;
  } catch (err) {
    console.error("Payment fetch failed:", err);
    setError("Failed to load payments.");
    return [];
  } finally {
    setLoading(false);
  }
};


  const handleStatusUpdate = async (
    id,
    newStatus,
    currentTransactionId,
  ) => {
    if (!id) {
      console.warn("Missing id for status update");
      return;
    }

    // Find the current payment to get the current status
    const currentPayment = payments.find((p) => p.id === id);
    if (!currentPayment) {
      console.warn("Payment not found in current list");
      return;
    }

    // Don't update if status is the same
    if (currentPayment.status === newStatus) {
      return;
    }

    setUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      console.log(
        `Updating payment status: ${id}, status: ${newStatus}, transactionId: ${currentTransactionId}`,
      ); // Debug log

      await paymentService.updatePaymentStatus(
        id,
        newStatus,
        currentTransactionId || null,
      );

      // Update local state immediately for better UX
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: newStatus } : p,
        ),
      );

      // Optionally refetch to ensure consistency
      // await fetchPayments();

      console.log("Status updated successfully");
    } catch (err) {
      console.error("Status update failed:", err);
      alert(`Failed to update payment status: ${err.message}`);

      // Revert the select to original status on error
      await fetchPayments();
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const statusOptions = ["PENDING", "COMPLETED", "PROCESSING", "CANCELLED"];

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
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={`payment-${p.id}`}>
                    <td>{p.id}</td>
                    <td>{p.orderId}</td>
                    <td>{p.transactionId || "N/A"}</td>
                    <td>
                      <select
                        value={selectedStatuses[p.id] ?? p.paymentStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setSelectedStatuses((prev) => ({
                            ...prev,
                            [p.id]: newStatus,
                          }));
                          handleStatusUpdate(
                            p.id,
                            newStatus,
                            p.transactionId,
                          );
                        }}
                        disabled={updating[p.id]}
                        style={{
                          opacity: updating[p.id] ? 0.5 : 1,
                          cursor: updating[p.id] ? "wait" : "pointer",
                        }}
                      >
                        {statusOptions.map((opt) => (
                          <option key={`${p.id}-${opt}`} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      {updating[p.id] && <span> ⏳</span>}
                    </td>
                    <td>{p.amount} €</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>{p.version}</td>
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
