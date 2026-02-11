'use client';
import { useEffect, useState } from 'react';
import { Book, Clock, Video, FileText, Loader2, Search, Eye, Award, TrendingUp, Zap, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import SmartCover from '@/components/SmartCover';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

export default function Dashboard() {
    const [contents, setContents] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        published: 0,
        drafts: 0,
        views: 0,
        learning: 0,
        finished: 0
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchDashboardData(parsedUser);
        }
    }, []);

    async function fetchDashboardData(currentUser: any) {
        setLoading(true);
        try {
            // 1. Fetch Recommendations
            const { data: recData } = await supabase
                .from('contents')
                .select('*, profiles(full_name, username), categories(name)')
                .eq('status', 'published')
                .limit(4);
            setContents(recData || []);

            if (currentUser.role === 'creator') {
                // 2. Fetch Creator Stats
                const { data: creatorStats } = await supabase
                    .from('contents')
                    .select('status, views')
                    .eq('author_id', currentUser.id);

                if (creatorStats) {
                    const published = creatorStats.filter(c => c.status === 'published').length;
                    const drafts = creatorStats.filter(c => c.status === 'draft').length;
                    const totalViews = creatorStats.reduce((acc, curr) => acc + (curr.views || 0), 0);
                    setStats((prev: any) => ({ ...prev, published, drafts, views: totalViews }));
                }
            } else {
                // 3. Fetch Learner Stats & History
                const { data: rawHistory } = await supabase
                    .from('history')
                    .select('*, contents(*, profiles(full_name), categories(name))')
                    .eq('user_id', currentUser.id)
                    .order('accessed_at', { ascending: false });

                // Deduplicate history items (Latest per content)
                const seenContent = new Set();
                const uniqueHistory = (rawHistory || []).filter(item => {
                    if (seenContent.has(item.content_id) || !item.contents) return false;
                    seenContent.add(item.content_id);
                    return true;
                }).slice(0, 4);

                setHistory(uniqueHistory);

                // Fetch total unique courses from history
                const uniqueContentIds = new Set((rawHistory || []).map(h => h.content_id));
                const learningCount = uniqueContentIds.size;

                // Fetch total completed courses
                const { count: finishedCount } = await supabase
                    .from('completions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id);

                // Fetch total comments by user
                const { count: commentCount } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id);

                // Calculate Points: Finish (50), Comment (10), Unique Access (5)
                const totalPoints = (learningCount * 5) + ((finishedCount || 0) * 50) + ((commentCount || 0) * 10);

                // Calculate Time: Finish (30m), Unique Access (5m)
                const totalMinutes = (learningCount * 5) + ((finishedCount || 0) * 30);
                const timeString = totalMinutes >= 60
                    ? `${(totalMinutes / 60).toFixed(1)} ชม.`
                    : `${totalMinutes} นาที`;

                setStats((prev: any) => ({
                    ...prev,
                    learning: learningCount,
                    finished: finishedCount || 0,
                    points: totalPoints,
                    time: timeString
                }));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sarabun">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-gray-500 font-bold animate-pulse">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8 font-sarabun">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            สวัสดี, <span className="text-indigo-600">{user?.full_name}</span> 👋
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            {user?.role === 'learner'
                                ? 'พร้อมเรียนรู้อะไรใหม่ๆ หรือยัง? มาดูความคืบหน้าของคุณกันเถอะ'
                                : 'จัดการเนื้อหาและติดตามสถิติผู้เรียนของคุณได้ที่นี่'}
                        </p>
                    </div>
                    {user?.role === 'creator' && (
                        <div className="flex gap-3">
                            <Link href="/dashboard/create" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                                <Video size={18} /> สร้างเนื้อหาใหม่
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {user?.role === 'learner' ? (
                        // Learner Stats
                        [
                            { label: 'กำลังเรียน', value: stats.learning, icon: Book, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                            { label: 'เรียนจบแล้ว', value: stats.finished, icon: Award, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                            { label: 'เวลาทั้งหมด', value: stats.time || '0 นาที', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                            { label: 'คะแนนสะสม', value: stats.points || 0, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                        ].map((stat, idx) => (
                            <div key={idx} className={`bg-white p-5 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32`}>
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                    <stat.icon className={stat.color} size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Instructor Stats
                        [
                            { label: 'ยอดวิวรวม', value: stats.views.toLocaleString(), icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                            { label: 'สื่อที่เผยแพร่', value: stats.published, icon: Video, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { label: 'ฉบับร่าง', value: stats.drafts, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                            { label: 'ผู้ติดตาม', value: '128', icon: User, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }, // Placeholder
                        ].map((stat, idx) => (
                            <div key={idx} className={`bg-white p-5 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32`}>
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                    <stat.icon className={stat.color} size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Continue Learning / Recent Uploads */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="text-indigo-600" size={20} />
                                {user?.role === 'learner' ? 'เรียนต่อจากที่ค้างไว้' : 'งานของคุณล่าสุด'}
                            </h2>

                            {user?.role === 'learner' ? (
                                history.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {history.map((item) => (
                                            <Link key={item.id} href={`/browse/${item.content_id}`} className="group bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-lg transition-all flex gap-4 items-center">
                                                <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden relative bg-gray-100">
                                                    {item.contents?.thumbnail_url && !item.contents?.thumbnail_url.includes('placehold.co') ? (
                                                        <img
                                                            src={item.contents.thumbnail_url}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).parentElement?.querySelector('.smart-cover-fallback')?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`smart-cover-fallback w-full h-full ${item.contents?.thumbnail_url && !item.contents?.thumbnail_url.includes('placehold.co') ? 'hidden' : ''}`}>
                                                        <SmartCover title={item.contents?.title} category={item.contents?.categories?.name} contentType={item.contents?.content_type} className="scale-75" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{item.contents?.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{item.contents?.categories?.name}</p>
                                                    <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 w-2/3 rounded-full"></div> {/* Placeholder Progress */}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">ยังไม่มีประวัติการเรียน</p>
                                        <Link href="/browse" className="text-indigo-600 font-bold hover:underline text-sm mt-2 inline-block">ค้นหาคอร์สเรียน</Link>
                                    </div>
                                )
                            ) : (
                                // Instructor Recent Content (To be implemented fully, reusing history structure for now)
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">ยังไม่มีเนื้อหาล่าสุด</p>
                                    <Link href="/dashboard/create" className="text-indigo-600 font-bold hover:underline text-sm mt-2 inline-block">สร้างเนื้อหาแรกของคุณ</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="space-y-8">
                        {/* Recommended / Tips */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-2">{user?.role === 'learner' ? 'เคล็ดลับการเรียน 💡' : 'เคล็ดลับผู้สอน 💡'}</h3>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                                    {user?.role === 'learner'
                                        ? 'การจดบันทึกระหว่างเรียนจะช่วยให้จำได้แม่นขึ้น 2.5 เท่า! ลองสรุปเนื้อหาหลังจบแต่ละบทดูสิ'
                                        : 'วิดีโอที่สั้นกว่า 10 นาทีมักได้รับความสนใจมากกว่า ลองแบ่งเนื้อหาเป็นตอนสั้นๆ ดูนะ!'}
                                </p>
                                <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all backdrop-blur-sm">
                                    อ่านเพิ่มเติม
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Categories Interest (Placeholder) */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                                <span>หมวดหมู่ยอดนิยม</span>
                                <TrendingUp size={16} className="text-gray-400" />
                            </h3>
                            <div className="space-y-3">
                                {['Technology', 'Business', 'Design', 'Science'].map((cat, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">{i + 1}</span>
                                            <span className="text-gray-600 font-medium group-hover:text-gray-900">{cat}</span>
                                        </div>
                                        <span className="text-gray-400 text-xs">+{Math.floor(Math.random() * 100)} คอร์ส</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
