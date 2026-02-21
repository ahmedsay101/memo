import './globals.css'
import ClientProviders from '@/components/ClientProviders'

export const metadata = {
  title: 'ميموز بيتزا - اختيارك رقم واحد في البيتزا',
  description: 'استمتع بأفضل أنواع البيتزا مع خدمة توصيل سريعة وجودة عالية من ميموز بيتزا',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;600;700;900&family=Tajawal:wght@200;300;400;500;700;800;900&family=Dancing+Script:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-arabic">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}