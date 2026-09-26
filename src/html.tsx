import type { HtmlProps } from '@tanstack/react-start'
import { jsx } from 'react/jsx-runtime'

export default function Html({ children }: HtmlProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BPO Nexus</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
