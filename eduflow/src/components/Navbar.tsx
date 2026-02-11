'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Plus } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            EduFlow
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/browse" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                            คอร์สเรียน
                        </Link>
                        <Link href="/browse" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                            ผู้สอน
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                {user.role === 'creator' && (
                                    <Link
                                        href="/dashboard/create"
                                        className="hidden lg:flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-200 mr-2"
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        สร้างเนื้อหา
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard"
                                    className="hidden sm:flex items-center text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    แดชบอร์ด
                                </Link>
                                <Link
                                    href="/dashboard/settings"
                                    className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                                    title="ตั้งค่าบัญชี"
                                >
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="ออกจากระบบ"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2">
                                    เข้าสู่ระบบ
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    สมัครสมาชิก
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

