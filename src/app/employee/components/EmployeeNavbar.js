import { useRouter } from "next/navigation";
import styles from "./employee-navbar.module.css";
import authService from "@/services/authService";

export default function EmployeeNavbar({ activeTab }) {
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
        <span className={styles.logoIcon}>👨‍💼</span>
        <h1 className={styles.logoText}>Kavapp Employee</h1>
      </div>

      <div className={styles.navButtons}>
        <button
          className={`${styles.navButton} ${activeTab === "dashboard" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/employee/dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "menu" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/employee/menu")}
        >
          Menu Items
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "orders" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/employee/orders")}
        >
          Orders
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "variations" ? styles.activeNavButton : ""}`}
          onClick={() => handleNavigation("/employee/variations")}
        >
          Variations
        </button>

        <div className={styles.userInfo}>
          {userData && (
            <span className={styles.userEmail}>
              {userData.email}
              <span className={styles.employeeBadge}>Employee</span>
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