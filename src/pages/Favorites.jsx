import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Bookmark, Loader2, Trash2, BookOpen } from 'lucide-react';

export default function Favorites({ session: propSession, onOpenAuth }) {
  const [session, setSession] = useState(propSession);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    setSession(propSession);
  }, [propSession]);

 
  useEffect(() => {
    let isMounted = true;

    const fetchFavorites = async () => {
      
      if (!session?.user?.id) {
        if (isMounted) {
          setFavorites([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
      
        const { data: dbData, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!dbData || dbData.length === 0) {
          if (isMounted) {
            setFavorites([]);
            setLoading(false);
          }
          return;
        }

        
        const enrichedFavorites = await Promise.all(
          dbData.map(async (item) => {
            try {
              const res = await fetch(
                `/api/mangadex/manga/${item.manga_id}?includes[]=cover_art`
              );
              const json = await res.json();
              const mangaData = json.data;

              const coverRel = mangaData?.relationships?.find((r) => r.type === 'cover_art');
              const coverFileName = coverRel?.attributes?.fileName;
              const titleObj = mangaData?.attributes?.title || {};
              const title =
                titleObj.en ||
                titleObj['ja-ro'] ||
                titleObj.ja ||
                Object.values(titleObj)[0] ||
                'Untitled Manga';

              return {
                ...item,
                manga_title: title,
                manga_cover: coverFileName
                  ? `/api/uploads/covers/${item.manga_id}/${coverFileName}.256.jpg`
                  : null
              };
            } catch (err) {
              console.error(`Error fetching info for manga ${item.manga_id}:`, err);
              return {
                ...item,
                manga_title: 'Manga Details Unavailable',
                manga_cover: null
              };
            }
          })
        );

        if (isMounted) setFavorites(enrichedFavorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  
  const removeFavorite = async (e, mangaId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('manga_id', mangaId);

      if (error) throw error;

      
      setFavorites((prev) => prev.filter((item) => item.manga_id !== mangaId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-pink-500/10 pb-4">
        <Bookmark className="w-8 h-8 text-pink-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">My Favorite Manga</h1>
          <p className="text-xs text-gray-400">Your saved titles for quick access</p>
        </div>
      </div>

      
      {!session ? (
        <div className="text-center py-20 bg-[#141824] rounded-2xl border border-pink-500/10 max-w-md mx-auto my-8 p-8">
          <Bookmark className="w-12 h-12 text-pink-500/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Sign in to view favorites</h3>
          <p className="text-xs text-gray-400 mb-6">
            You need to be logged in to save and sync your favorite manga list.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20 cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      ) : loading ? (
       
        <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          <p className="text-sm font-medium text-pink-400/80 animate-pulse">
            Fetching your favorites...
          </p>
        </div>
      ) : favorites.length === 0 ? (
        
        <div className="text-center py-20 bg-[#141824] rounded-2xl border border-pink-500/10 max-w-md mx-auto my-8 p-8">
          <BookOpen className="w-12 h-12 text-pink-500/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No favorites added yet</h3>
          <p className="text-xs text-gray-400 mb-6">
            Explore manga and click "Add to Favorites" on any title to save it here.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Browse Manga
          </Link>
        </div>
      ) : (
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favorites.map((fav) => (
            <div key={fav.id || fav.manga_id} className="relative group">
              <Link
                to={`/manga/${fav.manga_id}`}
                className="block bg-[#141824] rounded-2xl border border-pink-500/10 overflow-hidden hover:border-pink-500/40 transition-all hover:-translate-y-1 shadow-lg"
              >
                <div className="aspect-[3/4] bg-[#0a0c10] relative overflow-hidden">
                  {fav.manga_cover ? (
                    <img
                      src={fav.manga_cover}
                      alt={fav.manga_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      No Cover
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-pink-400 transition-colors">
                    {fav.manga_title}
                  </h3>
                </div>
              </Link>

             
              <button
                onClick={(e) => removeFavorite(e, fav.manga_id)}
                title="Remove from favorites"
                className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}