'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Video, Mic, File, Edit, Trash2, ExternalLink, Loader2, Plus, Clock, CheckCircle, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

export default function ManageContentPage() {
    const router = useRouter();
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchMyContents(parsedUser.id);
        } else {
            router.push('/login');
        }
    }, []);

    const fetchMyContents = async (userId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('contents')
                .select('*, categories(name)')
                .eq('author_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContents(data || []);
        } catch (error: any) {
            console.error('Error fetching contents:', error);
            alert('ไม่สามารถโหลดข้อมูลสื่อได้: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสื่อเรื่อง "${title}"?`)) return;

        try {
            const { error } = await supabase
                .from('contents')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setContents(contents.filter(c => c.id !== id));
            alert('ลบสื่อเรียบร้อยแล้ว');
        } catch (error: any) {
            alert('ลบไม่สำเร็จ: ' + error.message);
        }
    };

    const handlePublish = async (id: string, title: string) => {
        if (!confirm(`คุณต้องการเผยแพร่สื่อเรื่อง "${title}" ทันทีหรือไม่?`)) return;

        try {
            const { error } = await supabase
                .from('contents')
                .update({ status: 'published' })
                .eq('id', id);

            if (error) throw error;

            setContents(contents.map(c => c.id === id ? { ...c, status: 'published' } : c));
            alert('เผยแพร่สื่อเรียบร้อยแล้ว!');
        } catch (error: any) {
            alert('เผยแพร่ไม่สำเร็จ: ' + error.message);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100"><CheckCircle size={12} className="mr-1" /> เผยแพร่แล้ว</span>;
            case 'pending_review':
                return <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100"><Clock size={12} className="mr-1" /> รอตรวจสอบ</span>;
            default:
                return <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100"><Edit size={12} className="mr-1" /> ฉบับร่าง</span>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video size={18} />;
            case 'pdf': return <File size={18} />;
            case 'article': return <FileText size={18} />;
            case 'audio': return <Mic size={18} />;
            default: return <File size={18} />;
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
                    <p className="text-gray-500 animate-pulse font-sarabun">กำลังโหลดรายการสื่อของคุณ...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8 font-sarabun">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">จัดการสื่อการเรียนรู้</h1>
                        <p className="text-gray-500">ดู แก้ไข และติดตามสถานะสื่อที่คุณสร้าง</p>
                    </div>
                    <Link
                        href="/dashboard/create"
                        className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={20} className="mr-2" />
                        สร้างสื่อใหม่
                    </Link>
                </div>

                {contents.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center space-y-4">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <FileText size={32} className="text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">ยังไม่มีสื่อการเรียนรู้</h3>
                            <p className="text-gray-500">เริ่มต้นสร้างสื่อการเรียนรู้ชิ้นแรกของคุณเพื่อแบ่งปันความรู้</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {contents.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                <div className="flex flex-col md:flex-row">
                                    {/* Thumbnail */}
                                    <div className="md:w-64 h-40 md:h-auto relative bg-gray-100 shrink-0">
                                        {item.thumbnail_url ? (
                                            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                {getTypeIcon(item.content_type)}
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
                                                <span className="mr-2">{getTypeIcon(item.content_type)}</span>
                                                {item.content_type} • {item.categories?.name || 'ทั่วไป'}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                                        </div>

                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <Clock size={14} className="mr-1" />
                                                    {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center text-xs text-indigo-400 font-bold">
                                                    <Eye size={14} className="mr-1" />
                                                    {item.views || 0} views
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {item.status !== 'published' && (
                                                    <button
                                                        onClick={() => handlePublish(item.id, item.title)}
                                                        className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                                                    >
                                                        <CheckCircle size={14} className="mr-1" />
                                                        เผยแพร่ทันที
                                                    </button>
                                                )}

                                                <Link
                                                    href={`/dashboard/stats/${item.id}`}
                                                    className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                >
                                                    <BarChart3 size={14} className="mr-1" />
                                                    ดูสถิติ
                                                </Link>

                                                <Link
                                                    href={`/dashboard/edit/${item.id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                    title="แก้ไขข้อมูล"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.title)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <Link
                                                    href={`/browse/${item.id}`}
                                                    className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    ดูตัวอย่าง
                                                    <ExternalLink size={14} className="ml-2" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
