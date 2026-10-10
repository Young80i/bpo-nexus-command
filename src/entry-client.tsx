import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, queryClient } from './router'

const router = createRouter()

const rootElement = document.getElementById('root')!

const app = (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
)

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(app)
} else {
  ReactDOM.hydrateRoot(rootElement, app)
}