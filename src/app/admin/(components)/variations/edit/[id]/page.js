"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNavbar from "../../../AdminNavbar";
import { variationsService } from "@/services/variationsService";
import styles from "./../../../menu/menu.module.css";
import authService from "@/services/authService";

export default function ItemVariationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    version: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVariation = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/");
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (currentUser.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }

      try {
        const data = await variationsService.getItemVariationById(id);
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          version: data.version,
        });
      } catch (err) {
        setError("Failed to load variation.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadVariation();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await variationsService.updateItemVariation(id, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      router.push("/admin/variations");
    } catch (err) {
      console.error(err);
      setError("Failed to update variation. Please check all fields.");
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="variations" />

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail}>
          <h2 className={styles.menuItemName}>Edit Variation</h2>

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

            <button type="submit" className={styles.addToCartButton}>
              Save Changes
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
