'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Upload,
    Video,
    Settings,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    const navigation = [
        { name: 'ภาพรวม (Dashboard)', href: '/dashboard', icon: LayoutDashboard },
        { name: 'คอร์สเรียนของฉัน', href: '/dashboard/my-learning', icon: BookOpen },
        {
            name: 'จัดการสื่อของฉัน',
            href: '/dashboard/manage',
            icon: Video,
            role: 'creator'
        },
        {
            name: 'สร้างเนื้อหาใหม่',
            href: '/dashboard/create',
            icon: Upload,
            role: 'creator'
        },
        { name: 'ตั้งค่าบัญชี', href: '/dashboard/settings', icon: Settings },
    ];

    const filteredNavigation = navigation.filter(item => !item.role || item.role === user?.role);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        EduFlow
                    </Link>
                    <button
                        type="button"
                        className="md:hidden text-gray-500 hover:text-gray-900"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex flex-col flex-1 h-0 overflow-y-auto">
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {filteredNavigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            className="md:hidden p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex-1 flex justify-end">
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-700 hidden sm:block">
                                    <span className="text-gray-400">เข้าใช้งานโดย: </span>
                                    <span className="font-semibold text-gray-900">{user?.full_name || user?.username || 'กำลังโหลด...'}</span>
                                </div>
                                <Link
                                    href="/dashboard/settings"
                                    className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all"
                                    title="ตั้งค่าบัญชี"
                                >
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
