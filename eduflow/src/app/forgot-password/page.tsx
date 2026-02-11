'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, KeyRound, User, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Verify, 2: Reset
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [userId, setUserId] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', formData.username.trim())
                .eq('email', formData.email.trim())
                .single();

            if (fetchError || !data) {
                throw new Error('ไม่พบข้อมูลผู้ใช้งาน หรือชื่อผู้ใช้และอีเมลไม่ตรงกัน');
            }

            setUserId(data.id);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    password: formData.newPassword,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError('เกิดข้อผิดพลาด: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-200 shadow-xl">
                        <KeyRound className="text-white" size={32} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-black text-gray-900">
                    ลืมรหัสผ่านใช่ไหม?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500 font-medium">
                    ยืนยันตัวตนของคุณเพื่อกำหนดรหัสผ่านใหม่
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 shadow-2xl shadow-indigo-100 sm:rounded-3xl sm:px-10 border border-gray-100">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="text-green-500 h-16 w-16 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">เปลี่ยนรหัสผ่านสำเร็จ!</h3>
                            <p className="text-gray-500 font-medium">คุณจะถูกพาไปยังหน้าเข้าสู่ระบบใน 3 วินาที...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={handleVerify} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ชื่อผู้ใช้งาน (Username)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="ระบุชื่อผู้ใช้งานของคุณ"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">อีเมล (Email)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-100 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all uppercase tracking-widest"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'ถัดไป'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleReset} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">รหัสผ่านใหม่</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                <KeyRound size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="••••••••"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ยืนยันรหัสผ่านใหม่</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                <KeyRound size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-green-100 text-sm font-black text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-all uppercase tracking-widest"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'บันทึกรหัสผ่านใหม่'}
                                    </button>
                                </form>
                            )}

                            <div className="text-center pt-4">
                                <Link href="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                                    กลับไปหน้าเข้าสู่ระบบ
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
