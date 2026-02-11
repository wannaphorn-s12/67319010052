'use client';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50 font-sarabun">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-xs">EF</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <Menu />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="md:pl-64 pt-20 md:pt-0 min-h-screen transition-all duration-300">
                <div className="w-full p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
