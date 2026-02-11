'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Video as VideoIcon, Mic, File, Loader2, Save, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Category } from '@/types';
import { getYoutubeThumbnail } from '@/lib/youtube';
import AppLayout from '@/components/AppLayout';

export default function CreateContentPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [contentType, setContentType] = useState('video');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCats, setFetchingCats] = useState(true);
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
        tags: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }

        fetchCategories();
    }, []);

    async function fetchCategories() {
        setFetchingCats(true);
        try {
            const { data, error } = await supabase.from('categories').select('*');
            if (data) setCategories(data);
        } finally {
            setFetchingCats(false);
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

    const validateStep = (step: number) => {
        if (step === 2) {
            return formData.title.trim() !== '' && formData.description.trim() !== '' && formData.category_id !== '';
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            window.scrollTo(0, 0);
        } else {
            alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนไปขั้นตอนถัดไป');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent, status: 'published' | 'draft' | 'pending_review') => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('contents')
                .insert([
                    {
                        title: formData.title,
                        description: formData.description,
                        content_type: contentType,
                        category_id: formData.category_id || null,
                        content_url: formData.content_url || null,
                        preview_url: formData.preview_url || null,
                        thumbnail_url: formData.thumbnail_url || null,
                        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                        status: status,
                        author_id: user.id
                    }
                ])
                .select();

            if (error) throw error;

            let msg = 'บันทึกเรียบร้อยแล้ว!';
            if (status === 'published') msg = 'เผยแพร่เนื้อหาเรียบร้อยแล้ว!';
            if (status === 'pending_review') msg = 'ส่งเนื้อหาให้เจ้าหน้าที่ตรวจสอบแล้ว';
            if (status === 'draft') msg = 'บันทึกเป็นฉบับร่างแล้ว';

            alert(msg);
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Error creating content:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm mr-3 font-extrabold">1</span>
                เลือกประเภทสื่อการเรียนรู้
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { id: 'video', label: 'วิดีโอ', icon: VideoIcon, color: 'text-red-600', bg: 'bg-red-50', desc: 'บทเรียนในรูปแบบวิดีโอ' },
                    { id: 'pdf', label: 'เอกสาร PDF', icon: File, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'หนังสือหรือเอกสารประกอบ' },
                    { id: 'article', label: 'บทความ', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'บทความความรู้ทั่วไป' },
                    { id: 'audio', label: 'ไฟล์เสียง/Podcast', icon: Mic, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'เรียนรู้ผ่านการฟัง' },
                ].map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => setContentType(type.id)}
                        className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all h-full ${contentType === type.id
                            ? `border-indigo-600 ${type.bg} ring-4 ring-indigo-50 shadow-lg`
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <type.icon className={`h-12 w-12 mb-4 ${contentType === type.id ? 'text-indigo-600' : 'text-gray-300'}`} />
                        <span className={`text-base font-bold mb-1 ${contentType === type.id ? 'text-indigo-900' : 'text-gray-700'}`}>{type.label}</span>
                        <span className="text-xs text-gray-400 font-medium text-center">{type.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm mr-3 font-extrabold">2</span>
                รายละเอียดข้อมูลสื่อ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-bold text-gray-700 ml-1">ชื่อเรื่อง <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                            placeholder="เช่น เรียนรู้การเขียนโปรแกรม Next.js เบื้องต้น"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-bold text-gray-700 ml-1">คำอธิบาย <span className="text-red-500">*</span></label>
                        <textarea
                            id="description"
                            name="description"
                            rows={6}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-gray-400 resize-none"
                            placeholder="อธิบายรายละเอียดเกี่ยวกับเนื้อหา ประเภทความรู้ และสิ่งที่เป็นประโยชน์..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="category_id" className="text-sm font-bold text-gray-700 ml-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                        <select
                            id="category_id"
                            name="category_id"
                            required
                            value={formData.category_id}
                            onChange={handleChange}
                            disabled={fetchingCats}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                        >
                            <option value="">{fetchingCats ? 'กำลังโหลด...' : 'เลือกหมวดหมู่...'}</option>
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
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                            placeholder="เช่น react, web, coding"
                        />
                        <p className="text-xs text-gray-400 pl-1">คั่นด้วยเครื่องหมายจุลภาค (,)</p>
                    </div>

                    {/* Preview Box (Optional - to show what's being built) */}
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-2">ตัวอย่างการแสดงผล</h4>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div className="h-24 bg-gray-200 rounded-md mb-2 flex items-center justify-center text-gray-400 text-xs">Thumbnail</div>
                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-in slide-in-from-right-10 fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm mr-3 font-extrabold">3</span>
                อัปโหลดไฟล์และตรวจสอบ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Media File */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-gray-700 ml-1">สื่อหลัก ({contentType.toUpperCase()})</label>
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
                        <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white hover:border-indigo-300 transition-all h-[200px]">
                            {uploading.media ? (
                                <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                            ) : formData.content_url ? (
                                <div className="text-center">
                                    <FileText className="h-10 w-10 text-green-500 mx-auto mb-2" />
                                    <p className="text-xs text-green-600 font-bold truncate max-w-[150px]">อัปโหลดสำเร็จ!</p>
                                    <button onClick={() => setFormData(prev => ({ ...prev, content_url: '' }))} className="text-[10px] text-red-500 hover:underline mt-1">ลบไฟล์</button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-gray-300 mb-3 group-hover:text-indigo-400 transition-colors" />
                                    <p className="text-xs text-gray-500 text-center">ลากไฟล์ลงที่นี่ หรือคลิกเพื่อเลือก</p>
                                </>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'media')} />
                        </div>
                    ) : (
                        <div className="space-y-4">
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

                {/* Thumbnail */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">รูปหน้าปก (Thumbnail)</label>
                    <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white hover:border-indigo-300 transition-all overflow-hidden h-[200px]">
                        {uploading.thumbnails ? (
                            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                        ) : formData.thumbnail_url ? (
                            <img src={formData.thumbnail_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-xs text-gray-500 text-center font-medium">ภาพปกหน้าเนื้อหา</p>
                            </>
                        )}
                        {!uploading.thumbnails && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'thumbnails')} accept="image/*" />}
                    </div>
                </div>

                {/* Preview File */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">ไฟล์ตัวอย่าง / ไฮไลท์</label>
                    <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white hover:border-indigo-300 transition-all h-[200px]">
                        {uploading.previews ? (
                            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                        ) : formData.preview_url ? (
                            <div className="text-center">
                                <VideoIcon className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
                                <p className="text-xs text-indigo-600 font-bold">วิดีโอ/ภาพตัวอย่าง</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-xs text-gray-500 text-center">ใช้สำหรับโหมด Preview ฟรี</p>
                            </>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'previews')} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout>
            <div className="w-full space-y-8 pb-12 font-sarabun">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">สร้างเนื้อหาใหม่</h1>
                        <p className="text-gray-500 mt-1">อัปโหลดสื่อการเรียนรู้ดิจิทัลของคุณเข้าสู่ระบบ (ขั้นตอน {currentStep}/3)</p>
                    </div>
                </div>

                <div className="bg-white shadow-xl shadow-indigo-100/20 rounded-3xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2">
                        <div
                            className="bg-indigo-600 h-2 transition-all duration-500 ease-in-out"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="p-8 md:p-12 flex-grow flex flex-col">
                        <form onSubmit={(e) => handleSubmit(e, 'published')} className="flex-grow flex flex-col justify-between">
                            <div className="mb-8">
                                {currentStep === 1 && renderStep1()}
                                {currentStep === 2 && renderStep2()}
                                {currentStep === 3 && renderStep3()}
                            </div>

                            <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                                {/* Back Button */}
                                <div>
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center"
                                        >
                                            <ArrowLeft size={18} className="mr-2" />
                                            ย้อนกลับ
                                        </button>
                                    )}
                                </div>

                                {/* Next / Submit Buttons */}
                                <div className="flex gap-3">
                                    {currentStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center"
                                        >
                                            ถัดไป
                                            <ArrowRight size={18} className="ml-2" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={(e) => handleSubmit(e, 'draft')}
                                                disabled={loading || Object.values(uploading).some(Boolean)}
                                                className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all"
                                            >
                                                บันทึกแบบร่าง
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || Object.values(uploading).some(Boolean)}
                                                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:-translate-y-0.5 transition-all flex items-center"
                                            >
                                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle2 size={18} className="mr-2" />}
                                                เผยแพร่ทันที
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
