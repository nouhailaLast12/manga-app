import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ImageOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function MangaCard({ manga, session, onOpenAuth }) {
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const title = typeof manga.title === 'string' 
    ? manga.title 
    : manga.attributes?.title?.en || Object.values(manga.attributes?.title || {})[0] || 'Untitled';

  const description = typeof manga.description === 'string'
    ? manga.description
    : manga.attributes?.description?.en || 'No description available.';

 
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session?.user || !manga.id) return;
      try {
        const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('manga_id', manga.id)
          .single();

        if (data) setIsFavorite(true);
      } catch (err) {
        
      }
    };

    checkFavoriteStatus();
  }, [session, manga.id]);


  const toggleFavorite = async () => {
    if (!session?.user) {
      if (onOpenAuth) onOpenAuth(); 
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorite) {
       
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('manga_id', manga.id);

        setIsFavorite(false);
      } else {
        
        await supabase
          .from('favorites')
          .insert([
            {
              user_id: session.user.id,
              manga_id: manga.id,
              manga_title: title,
              manga_cover: manga.cover
            }
          ]);

        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="bg-[#141824] rounded-2xl border border-pink-500/10 p-3 flex flex-col justify-between hover:border-pink-500/30 transition-all group shadow-lg">
      <div>
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-[#0a0c10] flex items-center justify-center">
          {manga.cover && !imgError ? (
            <img
              src={manga.cover}
              alt={title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-600 gap-1 p-2 text-center">
              <ImageOff className="w-8 h-8 text-pink-500/30" />
              <span className="text-[10px] text-gray-500">No Image</span>
            </div>
          )}

          
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-10 ${
              isFavorite
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                : 'bg-black/60 text-pink-400 hover:bg-pink-500/80 hover:text-white'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-white' : 'fill-pink-400/20 group-hover:fill-white'
              }`}
            />
          </button>
        </div>

        <h3 className="font-bold text-white text-base line-clamp-1 mb-1 group-hover:text-pink-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-pink-500/10 pt-3 mt-auto">
        <span className="text-[10px] font-extrabold tracking-wider text-pink-400 uppercase bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">
          {manga.status || 'ONGOING'}
        </span>

        <Link
          to={`/manga/${manga.id}`}
          className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-all"
        >
          Read
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}