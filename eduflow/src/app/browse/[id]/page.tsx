'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Clock,
    Eye,
    User,
    ChevronLeft,
    Share2,
    MessageSquare,
    Loader2,
    FileText,
    ArrowRight,
    CheckCircle,
    Check
} from 'lucide-react';
import Link from 'next/link';

export default function ContentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const contentId = params.id as string;

    const [content, setContent] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        fetchContentDetails();
    }, [contentId]);

    async function fetchContentDetails() {
        setLoading(true);
        try {
            // 1. Fetch content info
            const { data, error } = await supabase
                .from('contents')
                .select('*, profiles(username, full_name, avatar_url), categories(name)')
                .eq('id', contentId)
                .single();

            if (error) throw error;
            setContent(data);

            // 2. Increment view count (Background)
            supabase.rpc('increment_views', { row_id: contentId }).then();

            // 3. Record History (Background)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                supabase.from('history').insert([
                    { user_id: parsedUser.id, content_id: contentId }
                ]).then();
            }

            // 4. Fetch Recommendations
            const { data: recData } = await supabase
                .from('contents')
                .select('*, profiles(username, full_name), categories(name)')
                .eq('category_id', data.category_id)
                .eq('status', 'published')
                .neq('id', contentId)
                .limit(4);

            setRecommendations(recData || []);

            // 5. Fetch Comments
            fetchComments();

            // 6. Check Completion Status
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const { data: compData } = await supabase
                    .from('completions')
                    .select('*')
                    .eq('user_id', parsedUser.id)
                    .eq('content_id', contentId)
                    .maybeSingle();

                if (compData) setIsCompleted(true);
            }

        } catch (error: any) {
            console.error('Error fetching content:', error);
            // alert('ไม่พบเนื้อหาที่ท่านต้องการ');
            // router.push('/browse');
        } finally {
            setLoading(false);
        }
    }

    async function fetchComments() {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, profiles(username, full_name, avatar_url)')
                .eq('content_id', contentId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    async function handlePostComment() {
        if (!newComment.trim() || !user) return;

        setSubmittingComment(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([
                    {
                        content_id: contentId,
                        user_id: user.id,
                        message: newComment.trim()
                    }
                ])
                .select('*, profiles(username, full_name, avatar_url)')
                .single();

            if (error) throw error;

            setComments([data, ...comments]);
            setNewComment('');
        } catch (error: any) {
            alert('ไม่สามารถส่งความคิดเห็นได้: ' + error.message);
        } finally {
            setSubmittingComment(false);
        }
    }

    async function handleMarkAsCompleted() {
        if (!user || isCompleted) return;

        setMarkingComplete(true);
        try {
            const { error } = await supabase
                .from('completions')
                .insert([
                    { user_id: user.id, content_id: contentId }
                ]);

            if (error) throw error;
            setIsCompleted(true);
        } catch (error: any) {
            console.error('Error marking as completed:', error);
            alert('ไม่สามารถบันทึกสถานะได้: ' + error.message);
        } finally {
            setMarkingComplete(false);
        }
    }

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-gray-500 font-medium animate-pulse">กำลังเตรียมเนื้อหาสำหรับคุณ...</p>
                </div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="min-h-screen flex flex-col pt-24 items-center justify-center bg-gray-50 text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบเนื้อหา</h2>
                <p className="text-gray-500 mb-6">เนื้อหาที่คุณกำลังพยายามเข้าถึงอาจถูกลบหรือไม่มีอยู่จริง</p>
                <Link href="/browse" className="text-indigo-600 font-bold hover:underline flex items-center">
                    <ChevronLeft size={20} className="mr-1" /> กลับไปหน้าค้นหา
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-grow pt-20">
                {/* Media Container (Sticky/Fixed Aspect) */}
                <div className="bg-black w-full aspect-video md:aspect-[21/9] lg:aspect-[21/7] max-h-[70vh] flex items-center justify-center relative shadow-2xl">
                    {content.content_type === 'video' ? (
                        getYoutubeId(content.content_url) ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${getYoutubeId(content.content_url)}`}
                                title={content.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full max-h-full"
                            ></iframe>
                        ) : (
                            <video
                                src={content.content_url}
                                controls
                                className="w-full h-full max-h-full"
                                poster={content.thumbnail_url}
                            />
                        )
                    ) : content.content_type === 'pdf' ? (
                        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white p-10 space-y-6">
                            <div className="h-24 w-24 bg-white/10 rounded-3xl flex items-center justify-center">
                                <FileText size={48} className="text-red-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2">{content.title}</h3>
                                <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">นี่คือเอกสาร PDF คุณสามารถอ่านออนไลน์ผ่านหน้าจอนี้ หรือดาวน์โหลดไปเก็บไว้ได้</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href={content.content_url}
                                        target="_blank"
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center shadow-lg shadow-red-900/40"
                                    >
                                        <Eye size={18} className="mr-2" /> เปิดอ่าน PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white/5 backdrop-blur-3xl flex flex-col items-center justify-center text-white p-10">
                            <img src={content.thumbnail_url} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md" alt="" />
                            <div className="z-10 text-center max-w-2xl px-6">
                                <h3 className="text-3xl font-black mb-6 leading-tight">{content.title}</h3>
                                <p className="text-gray-300 text-lg mb-10 leading-relaxed opacity-80">{content.description}</p>
                                <a
                                    href={content.content_url}
                                    target="_blank"
                                    className="inline-flex items-center px-10 py-4 bg-white text-gray-900 rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl"
                                >
                                    เริ่มเข้าสู่เนื้อหา <ArrowRight size={22} className="ml-2" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Details */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-10">
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <span className="px-5 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                                            {content.categories?.name}
                                        </span>
                                        <span className="flex items-center text-gray-400 text-sm font-bold bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                                            <Eye size={16} className="mr-2 text-indigo-400" /> {content.views?.toLocaleString() || 0} ครั้ง
                                        </span>
                                    </div>

                                    {/* Mark as Completed Button */}
                                    {user && user.role === 'learner' && (
                                        <button
                                            onClick={handleMarkAsCompleted}
                                            disabled={isCompleted || markingComplete}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-lg ${isCompleted
                                                ? 'bg-green-100 text-green-700 shadow-green-100 cursor-default'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
                                                }`}
                                        >
                                            {markingComplete ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : isCompleted ? (
                                                <CheckCircle size={18} />
                                            ) : (
                                                <Check size={18} />
                                            )}
                                            {isCompleted ? 'เรียนสำเร็จแล้ว' : 'กดปุ่มเมื่อเรียนสำเร็จ'}
                                        </button>
                                    )}
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                                    {content.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                                            {content.profiles?.full_name?.charAt(0) || content.profiles?.username?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="text-gray-900 font-black">
                                                {content.profiles?.full_name || content.profiles?.username}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium">เจ้าของเนื้อหา</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 text-sm">
                                        <div className="flex items-center text-gray-500 font-medium">
                                            <Eye size={18} className="mr-2 text-indigo-400" />
                                            {content.views.toLocaleString()} คนเข้าชม
                                        </div>
                                        <div className="flex items-center text-gray-500 font-medium">
                                            <Clock size={18} className="mr-2 text-indigo-400" />
                                            {new Date(content.created_at).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-indigo max-w-none">
                                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                                    <div className="w-1 h-6 bg-indigo-600 mr-4 rounded-full"></div>
                                    รายละเอียดเนื้อหา
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                                    {content.description}
                                </p>
                            </div>

                            {content.tags && content.tags.length > 0 && (
                                <div className="space-y-4 pt-6">
                                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">แท็กที่เกี่ยวข้อง</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {content.tags.map((tag: string) => (
                                            <Link
                                                key={tag}
                                                href={`/browse?q=${tag}`}
                                                className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                                            >
                                                # {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comment Section */}
                            <div className="pt-10 border-t border-gray-100">
                                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
                                    <div className="w-1 h-6 bg-indigo-600 mr-4 rounded-full"></div>
                                    ความคิดเห็น ({comments.length})
                                </h3>

                                {user ? (
                                    <div className="mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                                                {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-grow space-y-3">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="แสดงความคิดเห็นของคุณที่นี่..."
                                                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                                    rows={3}
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handlePostComment}
                                                        disabled={submittingComment || !newComment.trim()}
                                                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center"
                                                    >
                                                        {submittingComment ? <Loader2 size={16} className="animate-spin mr-2" /> : <MessageSquare size={16} className="mr-2" />}
                                                        ส่งความเห็น
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-10 p-6 bg-indigo-50 rounded-3xl text-center border border-indigo-100">
                                        <p className="text-indigo-900 font-bold text-sm mb-4">เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็น</p>
                                        <Link href="/login" className="inline-block px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                            เข้าสู่ระบบ
                                        </Link>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    {comments.length > 0 ? comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            <div className="h-10 w-10 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center font-bold shrink-0 overflow-hidden">
                                                {comment.profiles?.avatar_url ? (
                                                    <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    comment.profiles?.full_name?.charAt(0) || comment.profiles?.username?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-black text-gray-900">
                                                        {comment.profiles?.full_name || comment.profiles?.username}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(comment.created_at).toLocaleDateString('th-TH')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                                                    {comment.message}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10">
                                            <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
                                            <p className="text-gray-400 text-sm">ยังไม่มีความคิดเห็น มาร่วมแสดงความเห็นเป็นคนแรกกัน!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Recommendations */}
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center justify-between">
                                    <span>เนื้อหาแนะนำ</span>
                                    <div className="h-0.5 flex-grow bg-gray-100 ml-6"></div>
                                </h3>

                                <div className="space-y-8">
                                    {recommendations.length > 0 ? recommendations.map((rec) => (
                                        <Link
                                            key={rec.id}
                                            href={`/browse/${rec.id}`}
                                            className="flex gap-4 group"
                                        >
                                            <div className="h-24 w-32 bg-gray-200 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                                <img src={rec.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div className="flex flex-col justify-center min-w-0">
                                                <div className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-1">
                                                    {rec.categories?.name}
                                                </div>
                                                <h4 className="text-gray-900 font-bold text-sm line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                                    {rec.title}
                                                </h4>
                                                <div className="text-[10px] text-gray-400 mt-2 font-medium">
                                                    โดย {rec.profiles?.full_name || rec.profiles?.username}
                                                </div>
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="p-10 bg-gray-50 rounded-3xl text-center border-2 border-dashed border-gray-100">
                                            <p className="text-gray-400 text-sm">ยังไม่มีเนื้อหาแนะนำในหมวดหมู่นี้</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-12 bg-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                                    <div className="z-10 relative">
                                        <h4 className="text-xl font-black mb-4 leading-tight">อยากเรียนรู้อะไรอีกไหม?</h4>
                                        <p className="text-indigo-100 text-sm mb-8 opacity-80 leading-relaxed">มีคอร์สเรียนและสื่อดิจิทัลอีกมากมายรอให้คุณค้นพบในคลังความรู้ของเรา</p>
                                        <Link href="/browse" className="inline-block px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl">
                                            ค้นหาเพิ่มเติม
                                        </Link>
                                    </div>
                                    <div className="absolute top-0 right-0 h-full w-full opacity-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2 bg-white/40 blur-3xl rounded-full"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
