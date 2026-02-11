/**
 * Extracts YouTube Video ID from various URL formats
 */
export const getYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Gets the high-quality YouTube thumbnail URL for a given video ID
 */
export const getYoutubeThumbnail = (url: string): string | null => {
    const id = getYoutubeId(url);
    if (!id) return null;
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
};
