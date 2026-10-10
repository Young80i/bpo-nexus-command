import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, queryClient } from './router'
import './styles.css'
import { ThemeProvider } from '@/lib/theme' // <-- Updated to point to your theme.tsx file

const router = createRouter()

const rootElement = document.getElementById('root')!

const app = (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </ThemeProvider>
)

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(app)
} else {
  ReactDOM.hydrateRoot(rootElement, app)
}