'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    MessageCircle,
    Eye,
    ChevronLeft,
    Calendar,
    Search,
    Trash2,
    Loader2,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function ContentStatsPage() {
    const params = useParams();
    const router = useRouter();
    const contentId = params.id as string;

    const [content, setContent] = useState<any>(null);
    const [viewers, setViewers] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'viewers' | 'comments'>('viewers');

    useEffect(() => {
        fetchStats();
    }, [contentId]);

    async function fetchStats() {
        setLoading(true);
        try {
            // 1. Fetch content info
            const { data: contentData } = await supabase
                .from('contents')
                .select('*')
                .eq('id', contentId)
                .single();
            setContent(contentData);

            // 2. Fetch Viewers from history
            const { data: viewersData } = await supabase
                .from('history')
                .select('*, profiles(full_name, username, avatar_url)')
                .eq('content_id', contentId)
                .order('accessed_at', { ascending: false });

            // 3. Fetch Completions
            const { data: completionsData } = await supabase
                .from('completions')
                .select('user_id')
                .eq('content_id', contentId);

            const completedUserIds = new Set(completionsData?.map(c => c.user_id));

            // Filter unique viewers and add completion status
            const seen = new Set();
            const uniqueViewers = viewersData?.filter(item => {
                if (seen.has(item.user_id)) return false;
                seen.add(item.user_id);
                return true;
            }).map(viewer => ({
                ...viewer,
                is_completed: completedUserIds.has(viewer.user_id)
            })) || [];

            setViewers(uniqueViewers);

            // 4. Fetch Comments
            const { data: commentsData } = await supabase
                .from('comments')
                .select('*, profiles(full_name, username, avatar_url)')
                .eq('content_id', contentId)
                .order('created_at', { ascending: false });
            setComments(commentsData || []);

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteComment(id: string) {
        if (!confirm('ยืนยันที่จะลบความคิดเห็นนี้ใช่หรือไม่?')) return;

        try {
            const { error } = await supabase.from('comments').delete().eq('id', id);
            if (error) throw error;
            setComments(comments.filter(c => c.id !== id));
        } catch (error: any) {
            alert('ลบไม่สำเร็จ: ' + error.message);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/manage" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 line-clamp-1">{content?.title}</h1>
                        <p className="text-gray-500 text-sm">สถิติและการตอบรับจากผู้เรียน</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Eye size={28} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{content?.views || 0}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">ยอดชมทั้งหมด</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Users size={28} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{viewers.length}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">จำนวนผู้เข้าเรียน</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{comments.length}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">ความคิดเห็น</div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 p-2">
                    <button
                        onClick={() => setActiveTab('viewers')}
                        className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2 ${activeTab === 'viewers' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Users size={18} /> รายชื่อผู้เข้าเรียน
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2 ${activeTab === 'comments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <MessageCircle size={18} /> จัดการความคิดเห็น
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'viewers' ? (
                        <div className="space-y-4">
                            {viewers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                                <th className="pb-4 pt-2 px-4">ผู้เรียน</th>
                                                <th className="pb-4 pt-2 px-4">วันที่เข้าชมครั้งล่าสุด</th>
                                                <th className="pb-4 pt-2 px-4 text-right">สถานะ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {viewers.map((viewer) => (
                                                <tr key={viewer.id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-white">
                                                                {viewer.profiles?.avatar_url ? (
                                                                    <img src={viewer.profiles.avatar_url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    viewer.profiles?.full_name?.charAt(0) || viewer.profiles?.username?.charAt(0) || 'U'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-gray-900">{viewer.profiles?.full_name || viewer.profiles?.username}</div>
                                                                <div className="text-[10px] text-gray-400 font-bold uppercase lowercase tracking-wider">@{viewer.profiles?.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center text-xs text-gray-500 font-medium">
                                                            <Calendar size={14} className="mr-2 text-indigo-400" />
                                                            {new Date(viewer.accessed_at).toLocaleDateString('th-TH', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        {viewer.is_completed ? (
                                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                                                                เรียนสำเร็จ
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                                                                เข้าเรียน
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">ยังไม่มีผู้เรียนเข้าชมเนื้อหานี้</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.length > 0 ? comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-50/50 border border-gray-100 p-6 rounded-3xl flex items-start gap-4 group hover:bg-white hover:border-indigo-100 transition-all">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-indigo-100 overflow-hidden">
                                        {comment.profiles?.avatar_url ? (
                                            <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            comment.profiles?.full_name?.charAt(0) || comment.profiles?.username?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-gray-900">{comment.profiles?.full_name || comment.profiles?.username}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{new Date(comment.created_at).toLocaleString()}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="ลบคอมเมนต์"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                            {comment.message}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-gray-400">
                                    <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">ยังไม่มีความคิดเห็นสำหรับเนื้อหานี้</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
