
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { Typography } from 'antd'
import { ThemeProvider } from '../components/ThemeProvider'
import { QueryProvider } from '../components/QueryProvider'
import appCss from '../styles.css?url'

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
      <div>
        <Typography.Title level={1}>404</Typography.Title>
        <Typography.Title level={3}>Page not found</Typography.Title>
        <Typography.Paragraph type="secondary">
          The page you're looking for doesn't exist.
        </Typography.Paragraph>
        <a href="/" className="text-green-600 hover:underline">
          Back to SpendLite
        </a>
      </div>
    </main>
  )
}

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <Outlet />
          </QueryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'SpendLite — Personal Finance' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})
