"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../services/authService'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated()
      
      if (!isAuthenticated) {
        router.push('/')
      }
    }
    
    checkAuth()
  }, [router])
  
  return children
}