import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminNavbar from "./(components)/AdminNavbar";
import authService from "@/services/authService";

export default function AdminPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null)
    const userData = authService.getCurrentUser()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if(!authService.isAuthenticated() && userData.role !== 'ADMIN') {
                    router.push('/')
                    return
                }

                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                console.error("Failed checking auth: ", err);
                setError("Failed authenticating admin user.");
                setLoading(false);
            }
        }
        checkAuth();
    }, [router])

    return(
        <>
            <AdminNavbar user={user}/>
        </>
    )
}