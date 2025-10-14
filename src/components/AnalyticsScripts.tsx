import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";

export const AnalyticsScripts = () => {
  const { data: settings } = useAnalytics();

  useEffect(() => {
    // Facebook Pixel initialization
    if (settings?.facebook_pixel_enabled && settings?.facebook_pixel_id) {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );
      (window as any).fbq('init', settings.facebook_pixel_id);
      (window as any).fbq('track', 'PageView');
    }

    // Microsoft Clarity initialization
    if (settings?.microsoft_clarity_enabled && settings?.microsoft_clarity_id) {
      (function(c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
        c[a] = c[a] || function() {
          (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", settings.microsoft_clarity_id);
    }

    // Hotjar initialization
    if (settings?.hotjar_enabled && settings?.hotjar_site_id) {
      (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
        h.hj = h.hj || function() {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
        h._hjSettings = { hjid: settings.hotjar_site_id, hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }
  }, [settings]);

  if (!settings) return null;

  return (
    <Helmet>
      {/* Google Analytics 4 */}
      {settings.google_analytics_enabled && settings.google_analytics_id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}
          />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.google_analytics_id}');
            `}
          </script>
        </>
      )}

      {/* Google Tag Manager */}
      {settings.google_tag_manager_enabled && settings.google_tag_manager_id && (
        <>
          <script>
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
            `}
          </script>
          <noscript>
            {`<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.google_tag_manager_id}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`}
          </noscript>
        </>
      )}
    </Helmet>
  );
};
