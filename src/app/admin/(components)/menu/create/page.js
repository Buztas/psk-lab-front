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
      router.push("/dashboard");
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

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.optionsContainer}>
            <div className={styles.optionSection}>
              <label className={styles.optionTitle} htmlFor="name">
                Item Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter item name"
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
              <label className={styles.optionTitle} htmlFor="type">
                Item Type
              </label>
              <select
                id="type"
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
            </div>

            <div className={styles.optionSection}>
              <label className={styles.optionTitle} htmlFor="price">
                Base Price (EUR)
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

            <div className={styles.optionSection}>
              <h3 className={styles.optionTitle}>Available Variations</h3>
              <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
                Select variations that can be added to this menu item:
              </p>

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

              {variations.length === 0 && (
                <p style={{ fontSize: "0.9rem", color: "#999", fontStyle: "italic" }}>
                  No variations available. Create variations first to add them to menu items.
                </p>
              )}
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexDirection: "column" }}>
              <button
                type="submit"
                className={styles.addToCartButton}
                disabled={loading}
              >
                {loading ? "Creating..." : "💾 Create Item"}
              </button>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.push("/admin/menu")}
              >
                ← Back to Menu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}