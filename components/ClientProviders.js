'use client'

import TopLoader from './TopLoader'

export default function ClientProviders({ children }) {
  return (
    <>
      <TopLoader />
      {children}
    </>
  )
}