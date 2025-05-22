"use client";

import { useEffect, useState } from "react";
import adminUserService from "../../server_functions/adminUserService";
import styles from "./user.module.css";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import AdminNavbar from "../AdminNavbar";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true); // General loading
  const [authLoading, setAuthLoading] = useState(true); // Auth check loading
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: "", roleType: "" });
  const [userData, setUserData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;

      if (!authService.isAuthenticated()) {
        router.push("/");
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (currentUser.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }

      setUserData(currentUser);
      setAuthLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!authLoading) {
      loadUsers();
    }
  }, [authLoading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllUsers();
      const validUsers = Array.isArray(data)
        ? data.filter((u) => u && u.id)
        : [];
      setUsers(validUsers);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    if (!user?.id) return;
    setSelectedUser(user);
    setForm({
      email: user.email,
      roleType: user.roleType || "",
    });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await adminUserService.deleteUser(id);
        loadUsers();
        setSelectedUser(null);
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser?.id) return;

    try {
      await adminUserService.updateUser(selectedUser.id, {
        email: form.email,
        roleType: form.roleType,
      });
      loadUsers();
      setSelectedUser(null);
    } catch (err) {
      alert("Failed to update user");
    }
  };

  // Wait until auth check completes
  if (authLoading)
    return <div className={styles.loading}>Checking permissions...</div>;

  if (loading) return <div className={styles.loading}>Loading users...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <AdminNavbar activeTab={"users"} />
      <h1 className={styles.title}>User Management</h1>

      {selectedUser && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>Edit User</h2>

          <label>
            Email:
            <input
              type="email"
              className={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label>
            Role:
            <select
              className={styles.input}
              value={form.roleType}
              onChange={(e) => setForm({ ...form, roleType: e.target.value })}
              required
            >
              <option value="">Select role</option>
              <option value="ADMIN">Admin</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </label>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.saveButton}>
              Save
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.userList}>
        {users.map(
          (user) =>
            user?.id && (
              <div key={user.id} className={styles.userCard}>
                <div>
                  <strong>{user.roleType}</strong>
                  <br />
                  <span className={styles.email}>{user.email}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ),
        )}
      </div>
    </>
  );
}
