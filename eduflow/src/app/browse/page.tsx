'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, Loader2, Play, BookOpen, Clock, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Category } from '@/types';
import Link from 'next/link';
import SmartCover from '@/components/SmartCover';
import AppLayout from '@/components/AppLayout';

export default function BrowsePage() {
    const [contents, setContents] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchContents();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategoryId, sortBy]);

    async function fetchCategories() {
        const { data, error } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    }

    async function fetchContents() {
        setLoading(true);
        try {
            let query = supabase
                .from('contents')
                .select('*, profiles(username, full_name, avatar_url), categories(name)')
                .eq('status', 'published');

            if (searchQuery) {
                // Search in title OR tags
                query = query.or(`title.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
            }

            if (selectedCategoryId) {
                query = query.eq('category_id', selectedCategoryId);
            }

            // Sorting logic
            if (sortBy === 'latest') {
                query = query.order('created_at', { ascending: false });
            } else if (sortBy === 'views') {
                query = query.order('views', { ascending: false });
            }

            const { data, error } = await query;
            if (error) throw error;
            setContents(data || []);
        } catch (error) {
            console.error('Error fetching contents:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout>
            <div className="space-y-8 font-sarabun pb-12">
                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden bg-indigo-900 shadow-2xl shadow-indigo-200">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600 opacity-90"></div>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-5blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
                    </div>

                    <div className="relative z-10 px-8 py-16 md:py-20 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-2xl space-y-6">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                สำรวจโลกแห่ง<br />
                                <span className="text-indigo-200">การเรียนรู้ไร้ขีดจำกัด</span>
                            </h1>
                            <p className="text-indigo-100 text-lg md:text-xl font-light leading-relaxed max-w-lg">
                                ค้นพบคอร์สเรียน วิดีโอ และสื่อการเรียนรู้คุณภาพสูงจากผู้เชี่ยวชาญ ที่คัดสรรมาเพื่อพัฒนาทักษะของคุณ
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button onClick={() => document.getElementById('browse-content')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3.5 bg-white text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center">
                                    <Play size={20} className="mr-2 fill-indigo-900" />
                                    เริ่มสำรวจ
                                </button>
                                <Link href="/dashboard/create" className="px-8 py-3.5 bg-indigo-800/50 text-white font-bold rounded-xl backdrop-blur-sm border border-indigo-500/30 hover:bg-indigo-700/50 transition-all flex items-center">
                                    <BookOpen size={20} className="mr-2" />
                                    สร้างสื่อการเรียนรู้
                                </Link>
                            </div>
                        </div>

                        {/* Abstract Decor */}
                        <div className="hidden lg:block relative w-80 h-80">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full opacity-20 animate-pulse blur-2xl"></div>
                            <div className="relative w-full h-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl rotate-3 flex flex-col justify-between transform hover:rotate-6 transition-all duration-500">
                                <div className="space-y-4">
                                    <div className="h-4 w-1/3 bg-white/20 rounded-full"></div>
                                    <div className="h-32 w-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl relative overflow-hidden group">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                                <Play size={24} className="text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-full bg-white/20 rounded-full"></div>
                                        <div className="h-3 w-2/3 bg-white/20 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-400/50 border border-white/30"></div>
                                    <div className="h-3 w-24 bg-white/20 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="browse-content" className="scroll-mt-24">
                    {/* Search & Filter Bar */}
                    <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-xl py-4 -mx-4 px-4 sm:px-0 sm:mx-0 mb-8 border-b border-gray-200/50 transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 border-2 border-transparent bg-white rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm transition-all shadow-sm group-hover:shadow-md"
                                    placeholder="ค้นหาชื่อเรื่อง, ผู้สอน หรือแท็ก..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide items-center">
                                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mr-2 shrink-0">
                                    <button
                                        onClick={() => setSortBy('latest')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'latest' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        ใหม่ล่าสุด
                                    </button>
                                    <button
                                        onClick={() => setSortBy('views')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'views' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        ยอดนิยม
                                    </button>
                                </div>

                                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedCategoryId(null)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!selectedCategoryId
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                            : 'bg-white text-gray-600 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                                    >
                                        ทั้งหมด
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategoryId(cat.id)}
                                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedCategoryId === cat.id
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                                : 'bg-white text-gray-600 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-32 space-y-4">
                            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                            <p className="text-gray-400 font-medium animate-pulse">กำลังค้นหาสื่อการเรียนรู้...</p>
                        </div>
                    ) : contents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                            {contents.map((item) => (
                                <Link
                                    href={`/browse/${item.id}`}
                                    key={item.id}
                                    className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
                                >
                                    {/* Card Image */}
                                    <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors z-10"></div>
                                        {item.thumbnail_url && !item.thumbnail_url.includes('placehold.co') ? (
                                            <img
                                                src={item.thumbnail_url}
                                                alt={item.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement?.querySelector('.smart-cover-fallback')?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`smart-cover-fallback w-full h-full ${item.thumbnail_url && !item.thumbnail_url.includes('placehold.co') ? 'hidden' : ''}`}>
                                            <SmartCover title={item.title} category={item.categories?.name} contentType={item.content_type} />
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
                                            <span className="bg-white/95 backdrop-blur-md text-gray-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                                {item.content_type}
                                            </span>
                                        </div>

                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Play size={20} className="text-indigo-600 fill-indigo-600 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col flex-grow relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wide">
                                                {item.categories?.name || 'General'}
                                            </span>
                                            {item.views > 0 && (
                                                <div className="flex items-center text-[10px] text-gray-400 font-bold">
                                                    <Star size={12} className="text-amber-400 fill-amber-400 mr-1" />
                                                    {item.views.toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                            {item.title}
                                        </h3>

                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-2 ring-2 ring-white shadow-sm">
                                                    {item.profiles?.full_name?.charAt(0) || item.profiles?.username?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">
                                                        {item.profiles?.full_name || item.profiles?.username}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">Instructor</span>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium flex items-center bg-gray-50 px-2 py-1 rounded-full">
                                                <Clock size={10} className="mr-1" />
                                                {new Date(item.created_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center p-8">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">ไม่พบเนื้อหาที่ค้นหา</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะ</p>
                            <button onClick={() => { setSearchQuery(''); setSelectedCategoryId(null); }} className="mt-6 text-indigo-600 font-bold text-sm hover:underline">
                                ล้างตัวกรองทั้งหมด
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

