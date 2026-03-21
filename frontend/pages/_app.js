import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import Navbar from '../components/navbar';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const hideNavbar = router.pathname === '/login';

  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>

        {!hideNavbar && <Navbar />}

        {/* 🔥 GLOBAL TOASTER CONFIG */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px'
            },
            success: {
              style: {
                background: '#16a34a'
              }
            },
            error: {
              style: {
                background: '#dc2626'
              }
            }
          }}
        />

        <Component {...pageProps} />

      </ThemeProvider>

      <Analytics />
    </>
  );
}