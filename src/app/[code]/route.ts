import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const host = request.headers.get('host') || '';
    
    // Check if the host matches any domain in our database
    const domainRecord = await prisma.domain.findUnique({
      where: { host }
    });

    // We look for a URL where shortCode matches and domainId matches either the found domain or null (default domain)
    const url = await prisma.url.findFirst({
      where: {
        shortCode: code,
        domainId: domainRecord ? domainRecord.id : null,
      },
    });

    if (url) {
      // Log visit and increment click count in a transaction to ensure both happen
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const referer = request.headers.get('referer') || 'unknown';
      const country = request.headers.get('cf-ipcountry') || 'Unknown';

      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name || 'Unknown';
      const os = parser.getOS().name || 'Unknown';
      const deviceType = parser.getDevice().type;
      const device = deviceType === 'mobile' || deviceType === 'tablet' || deviceType === 'wearable' ? 'Mobile' : 'Desktop';

      // 1. Expiration Check
      if (url.expiresAt && new Date() > url.expiresAt) {
        return NextResponse.redirect(new URL('/expired', request.url));
      }

      await prisma.$transaction([
        prisma.url.update({
          where: { id: url.id },
          data: { clicks: { increment: 1 } },
        }),
        prisma.visit.create({
          data: {
            urlId: url.id,
            ip: ip.split(',')[0].trim(),
            userAgent,
            referer,
            country,
            browser,
            os,
            device
          }
        })
      ]);

      // 2. Pixel Injection Logic
      if (url.fbPixelId || url.googleTagId) {
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="1;url=${url.originalUrl}">
  <script>
    setTimeout(function() {
      window.location.href = "${url.originalUrl}";
    }, 1000);
  </script>
  ${url.fbPixelId ? `
  <!-- Meta Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${url.fbPixelId}');
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${url.fbPixelId}&ev=PageView&noscript=1"/></noscript>
  ` : ''}
  ${url.googleTagId ? `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${url.googleTagId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${url.googleTagId}');
  </script>
  ` : ''}
</head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#ffffff;color:#666;">
  Redirecting...
</body>
</html>`;
        return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
      }

      // 3. Standard Redirect
      return NextResponse.redirect(url.originalUrl);
    } else {
      // Redirect to home if code is not found
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Error finding URL:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
