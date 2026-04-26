// app/providers.js
'use client'

import { PropsWithChildren } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: '/ingest',
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST as string,
    person_profiles: 'identified_only',
  })
}

export function CSPostHogProvider({ children }: PropsWithChildren) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
