"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { variationsService } from "@/services/variationsService";
import AdminNavbar from "../AdminNavbar";
import styles from "./variations.module.css";
import authService from "@/services/authService";

export default function VariationsPage() {
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
    if (currentUser.role !== "ADMIN") {
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

  const handleEdit = (id) => {
    router.push(`/admin/variations/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this variation?")) return;
    try {
      await variationsService.deleteItemVariation(id);
      setVariations((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert("Failed to delete variation.");
    }
  };

  const handleCreate = () => {
    router.push("/admin/variations/create");
  };

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="variations" />

      <div className={styles.contentContainer}>
        <div className={styles.variationsContainer}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 className={styles.pageTitle}>Manage Variations</h2>
            <button className={styles.createButton} onClick={handleCreate}>
              + Add Variation
            </button>
          </div>

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
                  <div style={{ flex: 1, marginRight: "2rem", maxWidth: "calc(100% - 140px)" }}>
                    <div className={styles.variationName}>{variation.name}</div>
                    <div className={styles.variationDescription}>
                      {variation.description}
                    </div>
                    <div className={styles.variationPrice}>
                      €{variation.price.toFixed(2)} — {variation.stock} in stock
                    </div>
                  </div>

                  <div className={styles.variationActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(variation.id)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(variation.id)}
                    >
                      🗑️ Delete
                    </button>
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