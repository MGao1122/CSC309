// pages/_app.tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import MobileHeader from '@/components/MobileHeader';
import Background from '@/components/Background';
import { BackgroundProvider } from '@/context/BackgroundContext';
import BackgroundManager from '@/services/BackgroundManager';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <UserProvider>
                <BackgroundProvider>
                    <BackgroundManager>
                        <div className='relative min-h-screen'>
                            <Background className='h-full absolute top-0 left-0 w-full -z-10 pointer-events-none' />
                            <div className='relative flex flex-col min-h-screen'>
                                <div className="sm:hidden h-[72px]">
                                    <MobileHeader />
                                </div>
                                <div className="hidden sm:block h-[72px]">
                                    <Header />
                                </div>
                                <main className='flex-grow h-full'>
                                    <Component {...pageProps} />
                                </main>
                            </div>
                        </div>
                    </BackgroundManager>
                </BackgroundProvider>
            </UserProvider>
        </AuthProvider>
    );
}
