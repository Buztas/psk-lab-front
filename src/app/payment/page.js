"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import styles from "./payment.module.css";
import { authService } from "../../services/authService";
import { paymentService } from "../../services/paymentService";
import Navbar from "../../components/Navbar.js";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const cardElementRef = useRef(null);

  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    // Check if Stripe is already loaded
    console.log("Reached use effect for stripe");
    if (window.Stripe && !stripe) {
      handleStripeLoad();
      console.log("LOADED STRIPE");
    }
  }, [stripe]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        if (!orderId) {
          setError("Order ID is required");
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        const existingPayment =
          await paymentService.getPaymentByOrderId(orderId);

        console.log("Data: ", existingPayment.success, existingPayment.data);
        if (existingPayment.success && existingPayment.data) {
          const payment = existingPayment.data;

          setClientSecret(payment.clientSecret);
          setPaymentId(payment.id);
          setOrderInfo({
            orderId,
            amount: payment.amount,
            status: payment.paymentStatus,
          });

          return;
        }

        const paymentData = await paymentService.createPayment(orderId);
        if (paymentData.success && paymentData.data) {
          const { clientSecret, payment } = paymentData.data;

          setClientSecret(clientSecret);
          setPaymentId(payment.id);
          setOrderInfo({
            orderId,
            amount: payment.amount,
            status: payment.paymentStatus,
          });
        } else {
          setError("Unable to create payment.");
        }
      } catch (err) {
        console.error("Error loading payment data:", err);
        setError("Failed to initialize payment. Please try again.");
      }
    };

    loadData();
  }, [orderId]);

  const handleStripeLoad = () => {
    console.log("Stripe script loaded, window.Stripe:", !!window.Stripe);
    if (window.Stripe && !stripe) {
      try {
        const stripeInstance = window.Stripe(
          "pk_test_51RRyaqFNJgeQJYSon9GUdJZnPCfw2wXjqmRobo58hdWrSZywgalQkC7Ynh8NEJRpCYHcX4Y5M6lwuqvVMEU3S4dO00h3nyDRC7",
        );
        setStripe(stripeInstance);
        setStripeLoaded(true);
        console.log("Stripe initialized successfully");
      } catch (error) {
        console.error("Error initializing Stripe:", error);
        setError("Failed to initialize payment system");
      }
    }
  };

  useEffect(() => {
    if (stripeLoaded && stripe && clientSecret && !elements && !cardElement) {
      const elementsInstance = stripe.elements();
      const cardElementInstance = elementsInstance.create("card", {
        style: {
          base: {
            fontSize: "16px",
            color: "#424770",
            "::placeholder": {
              color: "#aab7c4",
            },
          },
          invalid: {
            color: "#9e2146",
          },
        },
      });

      if (cardElementRef.current) {
        cardElementInstance.mount(cardElementRef.current);
      }

      setElements(elementsInstance);
      setCardElement(cardElementInstance);
    }
  }, [stripeLoaded, stripe, clientSecret, elements, cardElement]);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !cardElement || !clientSecret) {
      setError("Payment system not ready. Please wait.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.username || "Customer",
            },
          },
        },
      );

      if (error) {
        console.error("Payment error:", error);
        setError(error.message);
        await paymentService.updatePaymentStatus(
          paymentId,
          "CANCELLED",
          clientSecret,
        );
      } else if (paymentIntent.status === "succeeded") {
        await paymentService.updatePaymentStatus(
          paymentId,
          "COMPLETED",
          paymentIntent.id,
        );
        router.push(`/orders/${orderId}?payment=success`);
      } else if (paymentIntent.status === "processing") {
        await paymentService.updatePaymentStatus(
          paymentId,
          "PROCESSING",
          paymentIntent.id,
        );
        setError("Payment is being processed. Please wait...");
      } else {
        setError("Payment was not completed. Please try again.");
        await paymentService.updatePaymentStatus(
          paymentId,
          "CANCELLED",
          paymentIntent.id || clientSecret,
        );
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("Payment processing failed. Please try again.");
      try {
        await paymentService.updatePaymentStatus(
          paymentId,
          "CANCELLED",
          clientSecret,
        );
      } catch (updateError) {
        console.error("Failed to update payment status:", updateError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  const handleCancel = () => {
    router.push("/cart");
  };

  return (
    <>
      {/* <meta
        httpEquiv="Content-Security-Policy"
        content="
    default-src *;
    script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
    style-src * 'unsafe-inline' data:;
    img-src * data: blob:;
    connect-src * data: blob:;
    frame-src *;
"
      /> */}
      <Script
        src="https://js.stripe.com/v3/"
        strategy="afterInteractive"
        onLoad={handleStripeLoad}
      />

      <div className={styles.container}>
        <Navbar activePage="payment" user={user} onLogout={handleLogout} />

        <div className={styles.paymentContainer}>
          <div className={styles.paymentContent}>
            <h2 className={styles.paymentTitle}>Complete Your Payment</h2>

            {orderInfo && (
              <div className={styles.orderSummary}>
                <h3>Order Summary</h3>
                <div className={styles.orderDetails}>
                  <p>
                    <strong>Order ID:</strong> {orderInfo.orderId}
                  </p>
                  <p>
                    <strong>Amount:</strong> €{orderInfo.amount}
                  </p>
                  <p>
                    <strong>Status:</strong> {orderInfo.status}
                  </p>
                </div>
              </div>
            )}

            {error && <div className={styles.errorMessage}>{error}</div>}

            {!stripeLoaded && (
              <div className={styles.loadingMessage}>
                Loading payment system...
              </div>
            )}

            {stripeLoaded && clientSecret && (
              <form onSubmit={handlePayment} className={styles.paymentForm}>
                <div className={styles.cardContainer}>
                  <label htmlFor="card-element" className={styles.cardLabel}>
                    Credit or Debit Card
                  </label>
                  <div
                    ref={cardElementRef}
                    className={styles.cardElement}
                  ></div>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.payButton}
                    disabled={loading || !stripeLoaded}
                  >
                    {loading
                      ? "Processing..."
                      : `Pay €${orderInfo?.amount || "0.00"}`}
                  </button>
                </div>
              </form>
            )}

            <div className={styles.securityNote}>
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
