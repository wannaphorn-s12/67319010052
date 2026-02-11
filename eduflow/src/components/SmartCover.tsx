'use client';
import React from 'react';
import { Video, FileText, Mic, Image as ImageIcon, BookOpen, Heart, Brain, Palette, DollarSign, Activity } from 'lucide-react';

interface SmartCoverProps {
    title: string;
    category?: string;
    contentType?: string;
    className?: string;
}

export default function SmartCover({ title, category, contentType, className = "" }: SmartCoverProps) {
    // Determine gradient based on category or title hash
    const gradients = [
        'from-indigo-500 to-purple-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-orange-500 to-rose-600',
        'from-pink-500 to-rose-600',
        'from-amber-500 to-orange-600',
    ];

    const getHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const hash = getHash(title + (category || ''));
    const gradient = gradients[hash % gradients.length];

    // Determine icon based on category or content type
    const getIcon = () => {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('เทคโนโลยี') || cat.includes('tech')) return <Brain size={48} />;
        if (cat.includes('ศิลปะ') || cat.includes('art')) return <Palette size={48} />;
        if (cat.includes('ธุรกิจ') || cat.includes('business')) return <DollarSign size={48} />;
        if (cat.includes('สุขภาพ') || cat.includes('health')) return <Activity size={48} />;
        if (cat.includes('วิทยาศาสตร์') || cat.includes('science')) return <Heart size={48} />;

        // Fallback to content type icons
        switch (contentType?.toLowerCase()) {
            case 'video': return <Video size={48} />;
            case 'pdf': return <FileText size={48} />;
            case 'audio': return <Mic size={48} />;
            case 'article': return <BookOpen size={48} />;
            default: return <ImageIcon size={48} />;
        }
    };

    return (
        <div className={`relative w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center p-6 overflow-hidden ${className}`}>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center text-white">
                <div className="mb-4 bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30 shadow-xl animate-pulse">
                    {getIcon()}
                </div>
                <h3 className="text-lg font-black leading-tight drop-shadow-md line-clamp-2">
                    {title}
                </h3>
                {category && (
                    <span className="mt-2 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                        {category}
                    </span>
                )}
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
    );
}
