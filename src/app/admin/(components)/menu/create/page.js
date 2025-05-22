"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./../menu.module.css";
import AdminNavbar from "../../AdminNavbar";
import adminMenuService from "@/services/data_manipulation_services/adminMenuService";
import authService from "@/services/authService";
import { variationsService } from "@/services/variationsService";
import { useEffect } from "react";

export default function CreateMenuItemPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    price: "",
    stock: "",
  });
  const [variations, setVariations] = useState([]);
  const [selectedVariationIds, setSelectedVariationIds] = useState([]);

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
        const data = await variationsService.getItemVariations();
        setVariations(data.content || []);
      } catch (err) {
        console.error("Failed fetching variations");
      }
    };

    loadVariations();
  }, [router]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariationChange = (index, key, value) => {
    const updated = [...variations];
    updated[index][key] = value;
    setVariations(updated);
  };

  const addVariation = () => {
    setVariations([...variations, { name: "", price: "", stock: "" }]);
  };

  const removeVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/");
        return;
      }

      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        variations: selectedVariationIds.map((id) => ({ id })),
      };

      await adminMenuService.createMenuItem(payload);
      router.push("/admin/menu");
    } catch (err) {
      console.error("Error creating item:", err);
      setError("Failed to create menu item. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="menu" />

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail}>
          <h2 className={styles.menuItemName}>Create Menu Item</h2>

          <form onSubmit={handleSubmit} className={styles.optionsContainer}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Item name"
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

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className={styles.quantityInput}
            >
              <option value="" disabled>
                Select type
              </option>
              <option value="DRINK">DRINK</option>
              <option value="FOOD">FOOD</option>
            </select>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Base price (EUR)"
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

            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Variations</h3>

              <div className={styles.checkboxGroup}>
                {variations.map((variation) => (
                  <label key={variation.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={selectedVariationIds.includes(variation.id)}
                      onChange={() => {
                        setSelectedVariationIds((prev) =>
                          prev.includes(variation.id)
                            ? prev.filter((id) => id !== variation.id)
                            : [...prev, variation.id],
                        );
                      }}
                    />
                    <span className={styles.checkboxText}>
                      {variation.name} – €{variation.price.toFixed(2)} – Stock:{" "}
                      {variation.stock}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={styles.addToCartButton}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Item"}
            </button>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/admin/menu")}
              style={{ marginTop: "1rem" }}
            >
              ← Back to Menu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
