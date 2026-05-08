'use client'

import { useEffect } from 'react'

export function OneSignalInit() {
  useEffect(() => {
    // Check if we are in the browser
    if (typeof window !== 'undefined') {
       const onesignalId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "PLACEHOLDER_ID"

       const script = document.createElement('script')
       script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
       script.defer = true
       document.head.appendChild(script)

       script.onload = () => {
          // @ts-ignore
          window.OneSignalDeferred = window.OneSignalDeferred || []
          // @ts-ignore
          window.OneSignalDeferred.push(async (OneSignal) => {
             await OneSignal.init({
                appId: onesignalId,
                safari_web_id: "",
                notifyButton: {
                   enable: false,
                },
                allowLocalhostAsSecureOrigin: true,
             });
          });
       }
    }
  }, [])

  return null
}
