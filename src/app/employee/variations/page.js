"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { variationsService } from "@/services/variationsService";
import EmployeeNavbar from "../components/EmployeeNavbar";
import styles from "./employee-variations.module.css";
import authService from "@/services/authService";

export default function EmployeeVariationsPage() {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/");
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (currentUser.role !== "EMPLOYEE") {
      router.push("/dashboard");
      return;
    }
    
    const loadVariations = async () => {
      try {
        const result = await variationsService.getItemVariations();
        setVariations(result.content || []);
      } catch (err) {
        setError("Failed to load variations.");
      } finally {
        setLoading(false);
      }
    };
    loadVariations();
  }, []);

  return (
    <div className={styles.container}>
      <EmployeeNavbar activeTab="variations" />

      <div className={styles.contentContainer}>
        <div className={styles.variationsContainer}>
          <h2 className={styles.pageTitle}>Variations</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading variations...</p>
            </div>
          ) : variations.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No variations found.</p>
            </div>
          ) : (
            <div className={styles.variationsList}>
              {variations.map((variation) => (
                <div key={variation.id} className={styles.variationCard}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.variationName}>{variation.name}</div>
                    <div className={styles.variationDescription}>
                      {variation.description}
                    </div>
                    <div className={styles.variationPrice}>
                      €{variation.price.toFixed(2)} — {variation.stock} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}