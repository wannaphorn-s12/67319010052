'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Query profiles table for matching username and password
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .eq('password', password) // Comparing plain text as requested
                .single();

            if (error || !data) {
                throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
            }

            // Success
            console.log('Login successful:', data);

            // Store user role/info in localStorage for simple session management
            localStorage.setItem('user', JSON.stringify(data));

            // Small delay for UX
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);

        } catch (error: any) {
            console.error('Login error:', error);
            alert(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sarabun bg-white">
            {/* Left Side - Hero/Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-900 justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                {/* Abstract Shapes */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 p-12 text-center text-white max-w-lg">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                            <Sparkles size={32} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-6 tracking-tight">ยินดีต้อนรับสู่ EduFlow</h2>
                    <p className="text-indigo-100 text-lg leading-relaxed">
                        แพลตฟอร์มการเรียนรู้ที่ไร้ขีดจำกัด เชื่อมต่อคุณกับองค์ความรู้ และเปิดประสบการณ์ใหม่ในการพัฒนาตนเอง
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
                {/* Mobile Background decoration */}
                <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50" />

                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">เข้าสู่ระบบ</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            หรือ{' '}
                            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                                สมัครสมาชิกใหม่ฟรี
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">
                                        ชื่อผู้ใช้งาน
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                                            placeholder="ระบุชื่อผู้ใช้งานของคุณ"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                                            รหัสผ่าน
                                        </label>
                                        <div className="text-sm">
                                            <Link href="/forgot-password" title="ลืมรหัสผ่าน?" className="font-medium text-indigo-600 hover:text-indigo-500 text-xs">
                                                ลืมรหัสผ่าน?
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                                    จดจำฉันไว้ในระบบ
                                </label>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            กำลังเข้าสู่ระบบ...
                                        </>
                                    ) : (
                                        <>
                                            เข้าสู่ระบบ
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
