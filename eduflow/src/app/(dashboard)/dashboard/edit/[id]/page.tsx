'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, FileText, Video as VideoIcon, Mic, File, Loader2, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Category } from '@/types';
import { getYoutubeThumbnail } from '@/lib/youtube';
import Link from 'next/link';

export default function EditContentPage() {
    const router = useRouter();
    const params = useParams();
    const contentId = params.id as string;

    const [contentType, setContentType] = useState('video');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        content_url: '',
        preview_url: '',
        thumbnail_url: '',
        tags: '',
        status: 'draft'
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }

        fetchCategories();
        fetchContentData();
    }, [contentId]);

    async function fetchCategories() {
        try {
            const { data } = await supabase.from('categories').select('*');
            if (data) setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    async function fetchContentData() {
        setFetchingData(true);
        try {
            const { data, error } = await supabase
                .from('contents')
                .select('*')
                .eq('id', contentId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    category_id: data.category_id || '',
                    content_url: data.content_url || '',
                    preview_url: data.preview_url || '',
                    thumbnail_url: data.thumbnail_url || '',
                    tags: data.tags ? data.tags.join(', ') : '',
                    status: data.status
                });
                setContentType(data.content_type);
                // Simple check: if URL starts with http and doesn't contain supabase storage bucket path, consider it a link
                if (data.content_url && data.content_url.startsWith('http') && !data.content_url.includes('supabase.co')) {
                    setUploadMethod('link');
                } else if (data.content_url && !data.content_url.startsWith('http')) {
                    // This might be a relative path or something else
                    setUploadMethod('file');
                } else {
                    setUploadMethod('file');
                }
            }
        } catch (error: any) {
            alert('ไม่สามารถโหลดข้อมูลสื่อได้: ' + error.message);
            router.push('/dashboard/manage');
        } finally {
            setFetchingData(false);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'thumbnails' | 'previews') => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(type)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(type)
                .getPublicUrl(filePath);

            const urlKey = type === 'media' ? 'content_url' : type === 'thumbnails' ? 'thumbnail_url' : 'preview_url';
            setFormData(prev => ({ ...prev, [urlKey]: publicUrl }));

        } catch (error: any) {
            console.error(`Error uploading ${type}:`, error);
            alert(`เกิดข้อผิดพลาดในการอัปโหลด ${type}: ` + error.message);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let newFormData = { ...formData, [name]: value };

        // Auto-fetch YouTube thumbnail if it's the content_url field and contentType is video
        if (name === 'content_url' && contentType === 'video') {
            const thumb = getYoutubeThumbnail(value);
            if (thumb) {
                newFormData.thumbnail_url = thumb;
            }
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent, status: string) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('contents')
                .update({
                    title: formData.title,
                    description: formData.description,
                    content_type: contentType,
                    category_id: formData.category_id || null,
                    content_url: formData.content_url || null,
                    preview_url: formData.preview_url || null,
                    thumbnail_url: formData.thumbnail_url || null,
                    tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', contentId);

            if (error) throw error;

            alert('บันทึกการแก้ไขเรียบร้อยแล้ว!');
            router.push('/dashboard/manage');
        } catch (error: any) {
            console.error('Error updating content:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
                <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-12 font-sarabun">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                    <Link href="/dashboard/manage" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">แก้ไขสื่อการเรียนรู้</h1>
                        <p className="text-gray-500 mt-1">ปรับปรุงข้อมูลและจัดการไฟล์สื่อของคุณ</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-xl shadow-indigo-100/20 rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-10 space-y-10">
                    {/* Content Type Selector */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            เลือกประเภทสื่อ: <span className="text-indigo-600 ml-2">{contentType.toUpperCase()}</span>
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'video', label: 'วิดีโอ', icon: VideoIcon, bg: 'bg-red-50' },
                                { id: 'pdf', label: 'เอกสาร PDF', icon: File, bg: 'bg-orange-50' },
                                { id: 'article', label: 'บทความ', icon: FileText, bg: 'bg-blue-50' },
                                { id: 'audio', label: 'ไฟล์เสียง', icon: Mic, bg: 'bg-purple-50' },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setContentType(type.id)}
                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all ${contentType === type.id
                                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/10'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <type.icon className={`h-6 w-6 mb-2 ${contentType === type.id ? 'text-indigo-600' : 'text-gray-300'}`} />
                                    <span className={`text-xs font-bold ${contentType === type.id ? 'text-indigo-900' : 'text-gray-500'}`}>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={(e) => handleSubmit(e, formData.status)} className="space-y-10">
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="title" className="text-sm font-bold text-gray-700 ml-1">ชื่อเรื่อง</label>
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            required
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="description" className="text-sm font-bold text-gray-700 ml-1">คำอธิบาย</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={5}
                                            required
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-gray-400 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="category_id" className="text-sm font-bold text-gray-700 ml-1">หมวดหมู่</label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                                        >
                                            <option value="">เลือกหมวดหมู่...</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="tags" className="text-sm font-bold text-gray-700 ml-1">แท็ก (Tags)</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            id="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                                            placeholder="react, coding..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 pt-4">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">จัดการไฟล์สื่อ</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Thumbnail */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 ml-1">รูปหน้าปก</label>
                                    <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white hover:border-indigo-300 transition-all overflow-hidden h-[140px]">
                                        {uploading.thumbnails ? (
                                            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                                        ) : formData.thumbnail_url ? (
                                            <img src={formData.thumbnail_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-gray-300" />
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'thumbnails')} accept="image/*" />
                                    </div>
                                </div>

                                {/* Main Media */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-bold text-gray-700 ml-1">ไฟล์สื่อหลัก ({contentType.toUpperCase()})</label>
                                        {contentType === 'video' && (
                                            <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadMethod('file')}
                                                    className={`px-2 py-1 rounded-md transition-all ${uploadMethod === 'file' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                                                >
                                                    ไฟล์
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadMethod('link')}
                                                    className={`px-2 py-1 rounded-md transition-all ${uploadMethod === 'link' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                                                >
                                                    ลิงก์
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {uploadMethod === 'file' ? (
                                        <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white hover:border-indigo-300 transition-all h-[140px]">
                                            {uploading.media ? (
                                                <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                                            ) : (
                                                <div className="text-center">
                                                    <FileText className={`h-8 w-8 mb-2 ${formData.content_url ? 'text-indigo-600' : 'text-gray-300'}`} />
                                                    <p className="text-[10px] text-gray-400">{formData.content_url ? 'อัปโหลดแล้ว (คลิกเพื่อเปลี่ยน)' : 'คลิกเพื่อเลือกไฟล์'}</p>
                                                </div>
                                            )}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'media')} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pt-2">
                                            <input
                                                type="url"
                                                name="content_url"
                                                placeholder="เช่น https://www.youtube.com/watch?v=..."
                                                value={formData.content_url}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border-2 border-indigo-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                                            />
                                            <p className="text-[10px] text-gray-400 px-2 font-medium italic">* รองรับ YouTube URL สำหรับการเล่นแบบฝังตัว</p>
                                        </div>
                                    )}
                                </div>

                                {/* Preview */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 ml-1">ไฟล์ตัวอย่าง</label>
                                    <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white hover:border-indigo-300 transition-all h-[140px]">
                                        {uploading.previews ? (
                                            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                                        ) : (
                                            <div className="text-center">
                                                <VideoIcon className={`h-8 w-8 mb-2 ${formData.preview_url ? 'text-indigo-600' : 'text-gray-300'}`} />
                                                <p className="text-[10px] text-gray-400">คลิกเพื่อเปลี่ยนไฟล์</p>
                                            </div>
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'previews')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-4">
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'draft')}
                                disabled={loading || Object.values(uploading).some(Boolean)}
                                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                บันทึกเป็นฉบับร่าง
                            </button>
                            <button
                                type="submit"
                                onClick={(e) => handleSubmit(e, 'published')}
                                disabled={loading || Object.values(uploading).some(Boolean)}
                                className="w-full sm:w-auto px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Save className="mr-3" size={18} />}
                                บันทึกและเผยแพร่
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
