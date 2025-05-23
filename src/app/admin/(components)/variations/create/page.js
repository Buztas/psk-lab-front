"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../AdminNavbar";
import styles from "../../menu/menu.module.css";
import { variationsService } from "@/services/variationsService";
import authService from "@/services/authService";

export default function ItemVariationCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

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
  }, [router]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await variationsService.createItemVariation({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      router.push("/admin/variations");
    } catch (err) {
      console.error(err);
      setError("Failed to create variation. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="variations" />

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail}>
          <h2 className={styles.menuItemName}>Create New Variation</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.optionsContainer}>
            <div className={styles.optionSection}>
              <label className={styles.optionTitle} htmlFor="name">
                Variation Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter variation name"
                required
                className={styles.quantityInput}
              />
            </div>

            <div className={styles.optionSection}>
              <label className={styles.optionTitle} htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={3}
                required
                style={{ 
                  resize: "vertical",
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.95rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                  transition: "border 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#8b4513"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            <div className={styles.optionSection}>
              <label className={styles.optionTitle} htmlFor="price">
                Price (EUR)
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className={styles.quantityInput}
              />
            </div>

            <div className={styles.optionSection}>
              <label className={styles.optionTitle} htmlFor="stock">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className={styles.quantityInput}
              />
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexDirection: "column" }}>
              <button
                type="submit"
                className={styles.addToCartButton}
                disabled={loading}
              >
                {loading ? "Creating..." : "💾 Create Variation"}
              </button>

              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.push("/admin/variations")}
              >
                ← Back to Variations
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}