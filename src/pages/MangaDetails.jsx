import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Comments from '../components/Comments';
import { BookOpen, ExternalLink, Loader2, Sparkles, ImageOff, Heart } from 'lucide-react';

export default function MangaDetails({ session: propSession, onOpenAuth }) {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [session, setSession] = useState(propSession);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  
  useEffect(() => {
    if (propSession) {
      setSession(propSession);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [propSession]);

 
  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!session?.user?.id || !id) return;
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('manga_id', id)
          .maybeSingle();

        if (error) throw error;
        setIsFavorite(!!data);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };

    checkIfFavorite();
  }, [id, session?.user?.id]);

 
  useEffect(() => {
    const getMangaDetails = async () => {
      setLoading(true);
      try {
        const mangaRes = await fetch(
          `https://api.mangadex.org/manga/${id}?includes[]=cover_art`
        );
        const mangaData = await mangaRes.json();
        const item = mangaData.data;

        const titleObj = item?.attributes?.title || {};
        const title = titleObj.en || titleObj['ja-ro'] || titleObj.ja || Object.values(titleObj)[0] || 'Untitled';
        
        const descObj = item?.attributes?.description || {};
        const description = descObj.en || Object.values(descObj)[0] || 'No description available.';

        const coverRel = item?.relationships?.find((r) => r.type === 'cover_art');
        const coverFileName = coverRel?.attributes?.fileName;
        const cover = coverFileName
          ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}.512.jpg`
          : null;

        const genres = item?.attributes?.tags
          ?.filter((tag) => tag.attributes?.group === 'genre')
          .map((tag) => tag.attributes?.name?.en) || [];

        setManga({
          id: item.id,
          title,
          description,
          status: item?.attributes?.status?.toUpperCase() || 'ONGOING',
          cover,
          genres
        });

        const chaptersRes = await fetch(
          `https://api.mangadex.org/manga/${id}/feed?translatedLanguage[]=en&translatedLanguage[]=fr&order[chapter]=asc&limit=100`
        );
        const chaptersData = await chaptersRes.json();
        setChapters(chaptersData.data || []);

      } catch (error) {
        console.error('Error fetching manga details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) getMangaDetails();
  }, [id]);


  const toggleFavorite = async () => {
    if (!session) {
      onOpenAuth();
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('manga_id', id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: session.user.id, manga_id: id }]);

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
        <p className="text-sm font-medium text-pink-400/80 animate-pulse">
          Loading manga details...
        </p>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-400 text-lg">Manga not found.</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header / Info Section */}
      <div className="bg-[#141824] rounded-2xl border border-pink-500/10 p-6 mb-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 aspect-[3/4] bg-[#0a0c10] rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-pink-500/10">
          {manga.cover && !imgError ? (
            <img
              src={manga.cover}
              alt={manga.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-600 gap-2">
              <ImageOff className="w-10 h-10 text-pink-500/30" />
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold tracking-wider text-pink-400 uppercase bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded">
                {manga.status}
              </span>

              
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isFavorite
                    ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20'
                    : 'bg-[#0a0c10] text-gray-300 border-pink-500/20 hover:border-pink-500/50 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'In Favorites' : 'Add to Favorites'}
              </button>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              {manga.title}
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-h-48 overflow-y-auto pr-2">
              {manga.description}
            </p>
          </div>

          {manga.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-pink-500/10">
              <span className="text-xs font-bold text-pink-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> GENRES:
              </span>
              {manga.genres.map((genre, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#0a0c10] border border-pink-500/10 text-gray-300 px-3 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chapters Section */}
      <div className="bg-[#141824] rounded-2xl border border-pink-500/10 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-pink-400" />
          <h2 className="text-xl font-bold text-white">Chapters List</h2>
        </div>

        {chapters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                to={`/read/${ch.id}`}
                className="flex items-center justify-between p-3.5 bg-[#0a0c10] border border-pink-500/10 hover:border-pink-500/40 rounded-xl transition-all hover:bg-pink-500/5 group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-pink-400 transition-colors">
                    Chapter {ch.attributes?.chapter || 'Oneshot'}
                  </span>
                  {ch.attributes?.title && (
                    <span className="text-[11px] text-gray-500 truncate max-w-[180px]">
                      {ch.attributes.title}
                    </span>
                  )}
                </div>
                <span className="text-xs text-pink-400 font-bold uppercase shrink-0">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#0a0c10]/50 rounded-xl border border-pink-500/10">
            <p className="text-gray-400 text-sm mb-4">
              No translated chapters available via API for this title.
            </p>
            <a
              href={`https://mangadex.org/title/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 text-pink-400 rounded-xl text-xs font-bold transition-all"
            >
              Read directly on MangaDex
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <Comments 
        mangaId={id} 
        chapterId={id}
        session={session} 
        onOpenAuth={onOpenAuth} 
      />
    </main>
  );
}