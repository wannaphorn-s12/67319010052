'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Compass, BookOpen, PenTool, LogOut, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
    };

    const menuItems = [
        { name: 'ภาพรวม', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'คลังความรู้', icon: Compass, href: '/browse' },
    ];

    const creatorItems = [
        { name: 'สร้างเนื้อหา', icon: PenTool, href: '/dashboard/create' },
        { name: 'จัดการสื่อ', icon: BookOpen, href: '/dashboard/manage' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col z-50 hidden md:flex font-sarabun">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform rotate-3">
                        <BookOpen className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tight">EduFlow</span>
                </div>
            </div>

            {/* User Profile Snippet */}
            {user ? (
                <div className="px-6 py-6">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group">
                        <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{user.full_name}</p>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {user.role === 'creator' ? 'ผู้สอน' : 'ผู้เรียน'}
                            </span>
                        </div>
                    </Link>
                </div>
            ) : (
                <div className="px-6 py-6">
                    <Link href="/login" className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm group-hover:bg-white group-hover:scale-110 transition-all">
                            <User size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-indigo-900">เข้าสู่ระบบ</p>
                            <p className="text-xs text-indigo-500">เพื่อเริ่มเรียนรู้</p>
                        </div>
                    </Link>
                </div>
            )}

            {/* Menu Items */}
            <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-4">
                {/* Main Menu */}
                <div className="space-y-1">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">เมนูหลัก</p>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive(item.href)
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} className={isActive(item.href) ? 'text-white' : 'text-gray-400'} />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Creator Menu */}
                {user?.role === 'creator' && (
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">สำหรับผู้สอน</p>
                        {creatorItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive(item.href)
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} className={isActive(item.href) ? 'text-white' : 'text-gray-400'} />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-50 space-y-1">
                {user ? (
                    <>
                        <Link
                            href="/dashboard/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive('/dashboard/settings')
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Settings size={20} className={isActive('/dashboard/settings') ? 'text-white' : 'text-gray-400'} />
                            ตั้งค่า
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                        >
                            <LogOut size={20} />
                            ออกจากระบบ
                        </button>
                    </>
                ) : (
                    <Link
                        href="/register"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-200"
                    >
                        สมัครสมาชิกฟรี
                    </Link>
                )}
            </div>
        </aside>
    );
}
