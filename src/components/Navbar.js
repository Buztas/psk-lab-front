import { useRouter } from 'next/navigation';
import styles from '../app/dashboard/dashboard.module.css';

export default function Navbar({ activePage, cartCount, user, onLogout }) {
  const router = useRouter();
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>☕</span>
        <h1 className={styles.logoText}>Kavapp</h1>
      </div>
      <div className={styles.navButtons}>
        <button 
          className={activePage === 'dashboard' ? `${styles.navButton} ${styles.activeNavButton}` : styles.navButton}
          onClick={() => router.push("/dashboard")}
        >
          Menu
        </button>
        <button 
          className={activePage === 'cart' ? `${styles.navButton} ${styles.activeNavButton}` : styles.navButton}
          onClick={() => router.push("/cart")}
        >
          Cart {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </button>
        <button 
          className={activePage === 'orders' ? `${styles.navButton} ${styles.activeNavButton}` : styles.navButton}
          onClick={() => router.push("/orders")}
        >
          Orders
        </button>
        <div className={styles.userInfo}>
          {user && <span className={styles.userEmail}>{user.email}</span>}
          <button onClick={onLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}