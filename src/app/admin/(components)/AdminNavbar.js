import { useRouter } from "next/navigation";
import styles from "./admin-navbar.module.css";
import authService from "@/services/authService";

export default function AdminNavbar({ activeTab }) {
  const router = useRouter();
  const userData = authService.getCurrentUser();

  const handleNavigation = (path) => {
    router.push(`${path}`);
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⚙️</span>
        <h1 className={styles.logoText}>Kavapp Admin</h1>
      </div>

      <div className={styles.navButtons}>
        <button
          className={`${styles.navButton} ${activeTab === "dashboard" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "menu" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/admin/menu")}
        >
          Menu Items
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "orders" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/admin/orders")}
        >
          Orders
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "users" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/admin/users")}
        >
          Users
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "variations" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/admin/variations")}
        >
          Variations
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "payments" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/admin/payments")}
        >
          Payments
        </button>

        <div className={styles.userInfo}>
          {userData && (
            <span className={styles.userEmail}>
              {userData.email}
              <span className={styles.adminBadge}>Admin</span>
            </span>
          )}
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}