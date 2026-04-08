'use client'

import { createContext, useContext } from 'react'

interface AdminContextValue {
  isAdmin: boolean
}

const AdminContext = createContext<AdminContextValue>({ isAdmin: false })

export function AdminProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean
  children: React.ReactNode
}) {
  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
