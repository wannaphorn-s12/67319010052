'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, Lock, UserPlus, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'learner'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('รหัสผ่านไม่ตรงกัน');
            return;
        }
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert([
                    {
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                        role: formData.role,
                        full_name: formData.fullName,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`
                    }
                ])
                .select();

            if (error) throw error;

            alert('ลงทะเบียนสำเร็จ! กำลังพาท่านไปหน้าเข้าสู่ระบบ');
            router.push('/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            alert('เกิดข้อผิดพลาดในการลงทะเบียน: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sarabun bg-white selection:bg-indigo-100 selection:text-indigo-900">
            {/* Left Side - Content (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-2/5 relative overflow-hidden bg-indigo-900 justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-900 to-black opacity-95" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -trindigo-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20" />
                <div className="absolute bottom-0 left-0 trindigo-x-1/2 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20" />

                <div className="relative z-10 p-12 text-center text-white max-w-lg">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl animate-bounce-slow">
                            <UserPlus size={40} className="text-indigo-300" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-6 tracking-tight">สร้างบัญชีผู้ใช้</h2>
                    <p className="text-indigo-100/80 text-lg leading-relaxed mb-10">
                        ร่วมเป็นส่วนหนึ่งของคอมมูนิตี้การเรียนรู้ EduFlow เพื่อเข้าถึงบทเรียนและแชร์ความรู้ของคุณกับคนทั่วโลก
                    </p>

                    <div className="space-y-6 text-left max-w-xs mx-auto">
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} className="text-indigo-300" />
                            </div>
                            <span className="text-sm font-medium">ระบบปลอดภัย 100%</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <Sparkles size={20} className="text-indigo-300" />
                            </div>
                            <span className="text-sm font-medium">เข้าถึงคอร์สเรียนฟรี</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form (Scrollable) */}
            <div className="flex-1 flex flex-col justify-center py-10 px-6 sm:px-12 lg:px-20 bg-white relative overflow-y-auto">
                <div className="max-w-md w-full mx-auto py-8">
                    <div className="mb-10 lg:mb-12">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ลงชื่อเข้าร่วม</h1>
                        <p className="mt-3 text-gray-500">
                            เริ่มต้นเดินทางสู่โลกแห่งความรู้กับเราวันนี้
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">ชื่อผู้ใช้งาน</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm font-medium"
                                        placeholder="ระบุชื่อผู้ใช้งาน"
                                    />
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">ชื่อ-นามสกุล</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <ShieldCheck size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        name="fullName"
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm font-medium"
                                        placeholder="เช่น นายสมชาย ใจดี"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">อีเมล</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm font-medium"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>

                            {/* Password Group */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">รหัสผ่าน</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">ยืนยันรหัสผ่าน</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">สถานะผู้ใช้งาน</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label
                                        className={`relative flex items-center justify-center p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${formData.role === 'learner'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                                : 'border-gray-50 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="radio" name="role" value="learner"
                                            className="sr-only"
                                            checked={formData.role === 'learner'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-sm font-bold">ผู้เรียน</span>
                                    </label>
                                    <label
                                        className={`relative flex items-center justify-center p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${formData.role === 'creator'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                                : 'border-gray-50 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="radio" name="role" value="creator"
                                            className="sr-only"
                                            checked={formData.role === 'creator'}
                                            onChange={handleChange}
                                        />
                                        <span className="text-sm font-bold">ผู้สอน</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-600/20 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        กำลังลงทะเบียน...
                                    </>
                                ) : (
                                    <>
                                        สร้างบัญชีทันที
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                มีบัญชีอยู่แล้ว?{' '}
                                <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                                    เข้าสู่ระบบที่นี่
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Mobile Background decoration */}
                <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -z-10 opacity-30" />
            </div>

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
