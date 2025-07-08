// File: /components/Layout.js
// A layout component for consistent navigation and structure.
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';

export default function Layout({ children }) {
    const router = useRouter();
    const auth = getAuth();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    const navLinks = [
        { href: '/profile', label: 'Profile' },
        { href: '/quests', label: 'Quests' },
        { href: '/packs', label: 'Packs' },
        { href: '/trade', label: 'Trade' },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-lg">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/profile">
                                <a className="text-xl font-bold text-purple-400">Event Companion</a>
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navLinks.map((link) => (
                                    <Link key={link.label} href={link.href}>
                                        <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            router.pathname === link.href
                                                ? 'bg-purple-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}>{link.label}</a>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:block">
                             <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}