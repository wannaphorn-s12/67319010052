'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Camera, Loader2, Save, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AppLayout from '@/components/AppLayout';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        avatar_url: ''
    });

    const [uploading, setUploading] = useState(false);

    const fetchProfile = useCallback(async (userId: string) => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (data) {
                // Update local cache and state
                localStorage.setItem('user', JSON.stringify(data));
                setUser(data);
                setFormData({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    password: data.password || '',
                    avatar_url: data.avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setFetching(false);
        }
    }, []);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('ขนาดรูปภาพต้องไม่เกิน 2MB');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload image to Supabase Storage Bucket 'avatars'
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            alert('✅ อัปโหลดรูปภาพสำเร็จ! (อย่าลืมกดบันทึกการเปลี่ยนแปลงที่ด้านล่าง)');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('❌ เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message + '\n\n*อย่าลืมสร้าง Bucket ชื่อ "avatars" ใน Supabase และตั้งเป็น Public');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // First set from cache for speed
            setUser(parsedUser);
            setFormData({
                full_name: parsedUser.full_name || '',
                email: parsedUser.email || '',
                password: parsedUser.password || '',
                avatar_url: parsedUser.avatar_url || ''
            });

            // Then fetch fresh data from DB
            if (parsedUser.id) {
                fetchProfile(parsedUser.id);
            } else if (parsedUser.username) {
                // Fallback to fetch by username if ID is missing in cache
                (async () => {
                    const { data } = await supabase.from('profiles').select('*').eq('username', parsedUser.username).single();
                    if (data) fetchProfile(data.id);
                })();
            }
        } else {
            router.push('/login');
        }
    }, [fetchProfile, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('กรุณาเซ็นชื่อเข้าใช้ก่อนดำเนินการ');
            return;
        }

        setLoading(true);
        try {
            console.log('--- Starting Profile Update ---');

            // Map the update data carefully
            const updateData: any = {
                full_name: formData.full_name,
                email: formData.email,
                avatar_url: formData.avatar_url,
            };

            // Only update password if it's not empty
            if (formData.password.trim() !== '') {
                updateData.password = formData.password;
            }

            const query = supabase.from('profiles').update(updateData);

            if (user.id) {
                query.eq('id', user.id);
            } else {
                query.eq('username', user.username);
            }

            const { data, error } = await query.select();

            if (error) {
                console.error('Update Request Error:', error);
                throw new Error(`บันทึกไม่สำเร็จ: ${error.message}`);
            }

            if (!data || data.length === 0) {
                throw new Error('ไม่พบข้อมูลที่จะแก้ไขในฐานข้อมูล หรือไม่มีสิทธิ์แก้ไข');
            }

            const updatedUser = data[0];

            // Update UI and Cache
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            alert('✅ บันทึกข้อมูลส่วนตัวสำเร็จแล้ว!');

        } catch (error: any) {
            console.error('Final Save Error:', error);
            alert('❌ พบปัญหา: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching && !user) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
                <p className="text-gray-500 animate-pulse">กำลังเรียกข้อมูล...</p>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="w-full space-y-6 pb-20 font-sarabun">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">แก้ไขข้อมูลส่วนตัว</h1>
                        <p className="text-gray-500 text-base mt-2">จัดการข้อมูลโปรไฟล์และรหัสผ่านของคุณ</p>
                    </div>
                    {user?.id && (
                        <button
                            onClick={() => fetchProfile(user.id)}
                            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors p-2"
                            title="รีเฟรชข้อมูล"
                        >
                            <RefreshCw size={16} className={`mr-1 ${fetching ? 'animate-spin' : ''}`} />
                            รีเฟรช
                        </button>
                    )}
                </div>

                <div className="bg-white shadow-xl shadow-indigo-100/20 rounded-2xl border border-gray-100 overflow-hidden transition-all">
                    <div className="p-6 md:p-10">
                        <form onSubmit={handleSave} className="space-y-10">
                            {/* Profile Photo Section */}
                            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-50">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 border-4 border-white shadow-xl overflow-hidden ring-1 ring-indigo-100">
                                        {uploading ? (
                                            <Loader2 className="animate-spin h-10 w-10 text-indigo-400" />
                                        ) : formData.avatar_url ? (
                                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={56} className="text-indigo-200" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-1 right-1 h-10 w-10 bg-indigo-600 hover:bg-indigo-700 rounded-full border-2 border-white flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110">
                                        <Camera size={18} className="text-white" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                <div className="text-center md:text-left space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-900">{user?.username}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-100 italic">
                                            {user?.role === 'creator' ? 'ผู้สอน (Creator)' : 'นักเรียน (Learner)'}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full border border-gray-100">
                                            สมาชิกนับตั้งแต่ {new Date(user?.created_at).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Form Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                {/* Full Name */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 flex items-center tracking-wide">
                                        <User size={18} className="mr-2 text-indigo-500" />
                                        ชื่อ-นามสกุล
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                        placeholder="เพิ่มชื่อ-นามสกุลจริงของคุณ"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 flex items-center tracking-wide">
                                        <Mail size={18} className="mr-2 text-indigo-500" />
                                        อีเมลติดต่อ
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                        placeholder="yourname@example.com"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 flex items-center tracking-wide">
                                        <Lock size={18} className="mr-2 text-indigo-500" />
                                        รหัสผ่านพื้นฐาน
                                    </label>
                                    <div className="space-y-1">
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                            placeholder="ปล่อยว่างหากไม่ต้องการเปลี่ยน"
                                        />
                                        <p className="text-[10px] text-gray-400 font-medium pl-1 italic">* ระบบจัดเก็บรหัสเป็น Plain Text (เพื่อการทดสอบ)</p>
                                    </div>
                                </div>

                                {/* Avatar Link */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 flex items-center tracking-wide">
                                        <Camera size={18} className="mr-2 text-indigo-500" />
                                        ลิงก์รูปภาพโปรไฟล์ (URL)
                                    </label>
                                    <input
                                        type="url"
                                        name="avatar_url"
                                        value={formData.avatar_url}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none placeholder:text-gray-400 text-sm"
                                        placeholder="https://images.unsplash.com/your-photo"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-10 border-t border-gray-50 flex flex-col sm:flex-row justify-end items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                    ) : (
                                        <Save size={18} className="mr-3" />
                                    )}
                                    {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Account Management (Danger Zone) */}
                <div className="bg-red-50/30 rounded-2xl border border-red-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-red-800 font-extrabold flex items-center justify-center md:justify-start">
                            <Trash2 size={20} className="mr-2" />
                            ความปลอดภัยของบัญชี
                        </h3>
                        <p className="text-red-600/70 text-sm font-medium">หากคุณต้องการเลิกใช้บริการหรือลบข้อมูลทั้งหมดออกจากระบบ</p>
                    </div>
                    <button className="px-6 py-2.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-all shadow-sm shadow-red-100 uppercase tracking-widest">
                        ลบบัญชีผู้ใช้
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
