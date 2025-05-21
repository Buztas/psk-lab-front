"use client";

import { useEffect, useState } from 'react';
import adminUserService from '../../server_functions/adminUserService';
import styles from "./user.module.css";
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: '', roleType: '' });
  const userData = authService.getCurrentUser()
  
  const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if(!authService.isAuthenticated() && userData?.role !== 'ADMIN') {
                    router.push('/')
                    return
                }
            } catch (err) {
                console.error("Failed checking auth: ", err);
                setError("Failed authenticating admin user.");
                setLoading(false);
            }
        }
        checkAuth();
    }, [router])

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setForm({
      email: user.email,
      roleType: user.roleType || ''
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await adminUserService.deleteUser(id);
        loadUsers();
        setSelectedUser(null);
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminUserService.updateUser(selectedUser.id, {
        email: form.email,
        roleType: form.roleType
      });
      loadUsers();
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to update user');
    }
  };

  if (loading) return <div className={styles.loading}>Loading users...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
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
            <button type="submit" className={styles.saveButton}>Save</button>
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
        {users.map((user) => (
          <div key={user.id} className={styles.userCard}>
            <div>
              <strong>{user.roleType}</strong><br />
              <span className={styles.email}>{user.email}</span>
            </div>
            <div className={styles.cardActions}>
              <button className={styles.editButton} onClick={() => handleEditClick(user)}>Edit</button>
              <button className={styles.deleteButton} onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
