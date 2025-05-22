"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./../../menu.module.css";
import AdminNavbar from "../../../AdminNavbar";
import menuService from "@/services/menuService";
import adminMenuService from "@/services/data_manipulation_services/adminMenuService";
import authService from "@/services/authService";
import { useParams } from "next/navigation";

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    price: "",
    stock: "",
  });
  const [variations, setVariations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuItem, setMenuItem] = useState(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/")
          return
        }

        const currentUser = authService.getCurrentUser()
        if (currentUser.role !== "ADMIN") {
          router.push("/")
          return
        }
        const item = await menuService.getMenuItemById(id);
        setForm({
          name: item.name,
          description: item.description,
          type: item.type,
          price: item.price,
          stock: item.stock,
        });

        setMenuItem(item);

        setVariations(item.variations || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load menu item.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadItem();
  }, [id, router]);

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
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        version: menuItem.version,
        variations: variations.map((v) => ({
          id: v.id || undefined,
          name: v.name,
          price: parseFloat(v.price),
          stock: parseInt(v.stock, 10),
        })),
      };

      await adminMenuService.updateMenuItem(id, payload);
      router.push("/admin/menu");
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update menu item. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="menu" />

      <div className={styles.detailContainer}>
        <div className={styles.itemDetail}>
          <h2 className={styles.menuItemName}>Edit Menu Item</h2>

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
                Select Type
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
                {variations.map((variation, index) => (
                  <div
                    key={index}
                    className={styles.selectedVariationsSection}
                    style={{ gap: "0.75rem" }}
                  >
                    <input
                      type="text"
                      placeholder="Variation name"
                      value={variation.name}
                      onChange={(e) =>
                        handleVariationChange(index, "name", e.target.value)
                      }
                      className={styles.quantityInput}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price (EUR)"
                      value={variation.price}
                      onChange={(e) =>
                        handleVariationChange(index, "price", e.target.value)
                      }
                      step="0.01"
                      className={styles.quantityInput}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={variation.stock}
                      onChange={(e) =>
                        handleVariationChange(index, "stock", e.target.value)
                      }
                      className={styles.quantityInput}
                      required
                    />
                    <button
                      type="button"
                      className={styles.backButton}
                      onClick={() => removeVariation(index)}
                      style={{ marginTop: "0.5rem" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.addToCartButton}
                onClick={addVariation}
              >
                + Add Variation
              </button>
            </div>

            <button
              type="submit"
              className={styles.addToCartButton}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
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
