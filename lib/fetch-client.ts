import queryString from 'query-string'

import { apiConfig } from '@/lib/tmdbConfig'

export const fetchClient = {
  get: async <T>(
    url: string,
    params?: Record<string, string | number>,
    isHeaderAuth = false,
    nextConfig?: RequestInit['next'] & { cache?: RequestCache }
  ): Promise<T> => {
    const useHeaderAuth = isHeaderAuth && !!apiConfig.headerKey;
    const query = {
      ...params,
      ...(!useHeaderAuth && { api_key: apiConfig.apiKey! }),
    }

    try {
      const res = await fetch(
        `${apiConfig.baseUrl}${queryString.stringifyUrl({ url, query })}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(useHeaderAuth && {
              Authorization: `Bearer ${apiConfig.headerKey}`,
            }),
          },
          ...(nextConfig?.cache ? { cache: nextConfig.cache } : { next: nextConfig || { revalidate: 3600 } }),
        }
      )

      if (!res.ok) {
        throw new Error(`TMDB API error: ${res.status}`)
      }
      return await res.json()
    } catch (error: any) {
      console.error(error)
      throw error
    }
  },
  post: async <T>(url: string, body = {}): Promise<T> => {
    try {
      const res = await fetch(`${apiConfig.baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiConfig.apiKey}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(`TMDB API error: ${res.status}`)
      }
      return await res.json()
    } catch (error: any) {
      console.error(error)
      throw error
    }
  },
}
