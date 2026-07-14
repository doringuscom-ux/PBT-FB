import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "PB TADKA - Film News",
  description: "Latest film news, movie reviews, celebrity updates, and more at Pbtadka.",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "pZU5V9lFho27fnQXxHchm3MdmtIiSr3BOdGU8s13r4U",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        
        {/* Google Adsense */}
        <meta name="google-adsense-account" content="ca-pub-6214614018313479" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6214614018313479" crossOrigin="anonymous"></script>
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QVGGSCFLGE"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QVGGSCFLGE');
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
