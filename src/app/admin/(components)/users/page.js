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
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
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

  if (authLoading) {
    return (
      <div className={styles.container}>
        <AdminNavbar activeTab="users" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminNavbar activeTab="users" />

      <div className={styles.contentContainer}>
        <div className={styles.usersContainer}>
          <h2 className={styles.pageTitle}>User Management</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {selectedUser && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h3 className={styles.formTitle}>Edit User</h3>

              <label className={styles.formLabel}>
                Email:
                <input
                  type="email"
                  className={styles.formInput}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>

              <label className={styles.formLabel}>
                Role:
                <select
                  className={styles.formInput}
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

              <div className={styles.formButtonGroup}>
                <button type="submit" className={styles.saveButton}>
                  💾 Save
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setSelectedUser(null)}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No users found.</p>
            </div>
          ) : (
            <div className={styles.userList}>
              {users.map(
                (user) =>
                  user?.id && (
                    <div key={user.id} className={styles.userCard}>
                      <div className={styles.userInfo}>
                        <div className={styles.userRole}>{user.roleType}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                      <div className={styles.userActions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditClick(user)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}