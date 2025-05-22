"use client";

import { useState } from "react";
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
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Variation name"
              required
              className={styles.quantityInput}
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              rows={3}
              required
              className={styles.menuItemDescription}
              style={{ resize: "vertical" }}
            />

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price (EUR)"
              step="0.01"
              required
              className={styles.quantityInput}
            />

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              required
              className={styles.quantityInput}
            />

            <button
              type="submit"
              className={styles.addToCartButton}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Variation"}
            </button>

            <button
              type="button"
              className={styles.backButton}
              style={{ marginTop: "1rem" }}
              onClick={() => router.push("/admin/variations")}
            >
              ← Back to Variations
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
