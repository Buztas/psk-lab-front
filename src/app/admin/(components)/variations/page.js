"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { variationsService } from "@/services/variationsService";
import AdminNavbar from "../AdminNavbar";
import styles from "./../menu/menu.module.css";

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
      router.push("/");
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

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail}>
          <h2 className={styles.menuItemName}>Manage Variations</h2>

          <button
            className={styles.addToCartButton}
            style={{ marginBottom: "1.5rem" }}
            onClick={handleCreate}
          >
            + Create Variation
          </button>

          {loading ? (
            <div className={styles.loadingContainer}>Loading...</div>
          ) : error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : (
            <div className={styles.menuAdminList}>
              {variations.map((variation) => (
                <div key={variation.id} className={styles.menuAdminCard}>
                  <div>
                    <div className={styles.menuItemName}>{variation.name}</div>
                    <div className={styles.menuItemDescription}>
                      {variation.description}
                    </div>
                    <div className={styles.menuItemBasePrice}>
                      €{variation.price.toFixed(2)} | Stock: {variation.stock}
                    </div>
                  </div>

                  <div className={styles.menuAdminActions}>
                    <button
                      className={`${styles.viewButton}`}
                      onClick={() => handleEdit(variation.id)}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.backButton}`}
                      onClick={() => handleDelete(variation.id)}
                    >
                      Delete
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
