
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { StatsProvider } from '@/providers/StatsProvider';
import { TimerProvider } from '@/providers/TimerProvider';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { TimetableNotificationHandler } from '@/components/TimetableNotificationHandler';
import { AlarmHandler } from '@/components/AlarmHandler'; // Added import

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['600', '700'], // Using 600 for semi-bold and 700 for bold
});

export const metadata: Metadata = {
  title: 'FocusFlow – Pomodoro Timer',
  description: 'Increase productivity with the Pomodoro technique.',
  manifest: '/manifest.json', // Essential for PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <StatsProvider>
              <TimerProvider>
                <TimetableNotificationHandler />
                <AlarmHandler /> {/* Added AlarmHandler here */}
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow container mx-auto px-4 py-8">
                    {children}
                  </main>
                  <footer className="text-center py-4 text-muted-foreground text-sm">
                    FocusFlow – Pomodoro Timer
                    {/* 
                      AdMob Integration Placeholder:
                      Ensure you have the necessary SDKs and configurations.
                      This is a conceptual placeholder. Actual implementation will vary.
                      <div id="admob-banner-placeholder" style={{ width: '100%', textAlign: 'center', padding: '10px 0' }}>
                        [ Your Ad Unit Here ]
                      </div>
                    */}
                  </footer>
                </div>
                <Toaster />
              </TimerProvider>
            </StatsProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
