export type UserRole = 'learner' | 'creator' | 'admin';
export type ContentType = 'video' | 'pdf' | 'article' | 'audio';
export type ContentStatus = 'draft' | 'pending_review' | 'published';

export interface Profile {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Content {
    id: string;
    title: string;
    description?: string;
    content_type: ContentType;
    content_url?: string;
    thumbnail_url?: string;
    status: ContentStatus;
    author_id: string;
    category_id?: string;
    tags?: string[];
    views: number;
    created_at: string;
    updated_at: string;
    author?: Profile; // Joined data
    category?: Category; // Joined data
}

export interface Comment {
    id: string;
    content_id: string;
    user_id: string;
    message: string;
    created_at: string;
    user?: Profile; // Joined data
}

export interface History {
    id: string;
    user_id: string;
    content_id: string;
    accessed_at: string;
    content?: Content; // Joined data
}
