import { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import MangaCard from './components/MangaCard';
import MangaDetails from './pages/MangaDetails';
import Auth from './components/Authh';
import { Sparkles, X, Loader2 } from 'lucide-react';
import ChapterRead from './pages/ChapterRead';
import Favorites from './pages/Favorites';
import Footer from './components/Footer';

function Home({ session, setShowAuthModal }) {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const getMangas = async () => {
      setLoading(true);
      try {
        const titleParam = searchQuery ? `&title=${encodeURIComponent(searchQuery)}` : '';
        const url = `/api/mangadex/manga?limit=20${titleParam}&includes[]=cover_art&contentRating[]=safe`;
          
        const response = await fetch(url);
        const data = await response.json();
        
        const formattedData = (data.data || []).map((item) => {
          const coverRel = item.relationships?.find((r) => r.type === 'cover_art');
          const coverFileName = coverRel?.attributes?.fileName;

          const titleObj = item.attributes?.title || {};
          const title = titleObj.en || titleObj['ja-ro'] || titleObj.ja || Object.values(titleObj)[0] || 'Untitled';

          const descObj = item.attributes?.description || {};
          const description = descObj.en || Object.values(descObj)[0] || 'No description available.';

          // رابط Supabase Storage بالاعتماد على الـ coverFileName الحقيقي المرفوع
          const directCover = coverFileName 
            ? `https://ttgjavukktyzelercrgq.supabase.co/storage/v1/object/public/covers/${coverFileName}`
            : null;

          return {
            id: item.id,
            title,
            description,
            status: item.attributes?.status?.toUpperCase() || 'ONGOING',
            cover: directCover
          };
        });

        setMangas(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    getMangas();
  }, [searchQuery]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {searchQuery ? `Search results for: "${searchQuery}"` : "Latest Manga Updates"}
        </h1>
        <Sparkles className="w-7 h-7 text-pink-400 animate-pulse" />
      </div>
      
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          <p className="text-sm font-medium text-pink-400/80 animate-pulse">Loading manga...</p>
        </div>
      ) : mangas.length === 0 ? (
        <div className="text-center py-16 bg-[#141824]/50 border border-pink-500/10 rounded-2xl">
          <p className="text-gray-400 text-lg font-medium">No manga found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {mangas.map((manga) => (
            <MangaCard 
              key={manga.id} 
              manga={manga} 
              session={session}
              onOpenAuth={() => setShowAuthModal(true)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuthModal(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="bg-[#0a0c10] min-h-screen text-white font-sans antialiased">
     
      <Navbar 
        session={session} 
        onOpenAuth={() => setShowAuthModal(true)} 
      />

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md bg-[#141824] border border-pink-500/20 rounded-2xl shadow-2xl p-6">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-pink-400 transition-colors p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <Auth />
          </div>
        </div>
      )}
      
      <Routes>
        <Route 
          path="/" 
          element={<Home session={session} setShowAuthModal={setShowAuthModal} />} 
        />
        <Route 
          path="/manga/:id" 
          element={
            <MangaDetails 
              session={session} 
              onOpenAuth={() => setShowAuthModal(true)} 
            />
          } 
        />
        <Route 
          path="/favorites" 
          element={<Favorites session={session} onOpenAuth={() => setShowAuthModal(true)} />} 
        />
        <Route 
          path="/read/:chapterId" 
          element={<ChapterRead session={session} onOpenAuth={() => setShowAuthModal(true)} />} 
        />
        <Route 
          path="/chapter/:chapterId" 
          element={<ChapterRead session={session} onOpenAuth={() => setShowAuthModal(true)} />} 
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;