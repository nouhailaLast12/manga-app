import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Comments from '../components/Comments';
import { ArrowLeft, Loader2, RefreshCw, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

export default function MangaViewer({ session: propSession, onOpenAuth }) {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [session, setSession] = useState(propSession);
  const [prevChapterId, setPrevChapterId] = useState(null);
  const [nextChapterId, setNextChapterId] = useState(null);
  const [currentChapterNum, setCurrentChapterNum] = useState('');

  useEffect(() => {
    if (propSession) {
      setSession(propSession);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    }
  }, [propSession]);

  useEffect(() => {
    const fetchChapterAndInfo = async () => {
      if (!chapterId) return;
      setLoading(true);
      setError(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
        if (!res.ok) throw new Error('Failed to load chapter');
        const data = await res.json();
        const baseUrl = data.baseUrl;
        const hash = data.chapter?.hash;
        const pageFiles = data.chapter?.data || [];
        setPages(pageFiles.map((f) => `${baseUrl}/data/${hash}/${f}`));

        const chInfoRes = await fetch(`https://api.mangadex.org/chapter/${chapterId}`);
        const chInfoData = await chInfoRes.json();
        const currentChAttr = chInfoData.data?.attributes;
        setCurrentChapterNum(currentChAttr?.chapter || '');

        const mangaRel = chInfoData.data?.relationships?.find((r) => r.type === 'manga');

        if (mangaRel?.id) {
          const feedRes = await fetch(
            `https://api.mangadex.org/manga/${mangaRel.id}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=500`
          );
          const feedData = await feedRes.json();
          const allChapters = feedData.data || [];

          const uniqueChapters = [];
          const seenChapters = new Set();

          for (const ch of allChapters) {
            const chNum = ch.attributes?.chapter;
            if (chNum && !seenChapters.has(chNum)) {
              seenChapters.add(chNum);
              uniqueChapters.push(ch);
            }
          }

          const currentIndex = uniqueChapters.findIndex((c) => c.id === chapterId);

          if (currentIndex !== -1) {
            setPrevChapterId(currentIndex > 0 ? uniqueChapters[currentIndex - 1].id : null);
            setNextChapterId(currentIndex < uniqueChapters.length - 1 ? uniqueChapters[currentIndex + 1].id : null);
          }
        }
      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterAndInfo();
  }, [chapterId]);

  const scrollToComments = () => {
    const commentsEl = document.getElementById('comments-section');
    if (commentsEl) commentsEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full pb-20 md:pb-10">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-[#141824]/95 backdrop-blur-md border-b border-pink-500/10 px-4 md:px-6 py-2.5 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-pink-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
        </button>

        <span className="text-xs font-bold text-pink-400 truncate max-w-[150px] text-center">
          {currentChapterNum ? `Chapter ${currentChapterNum}` : ''}
        </span>

        <div className="flex items-center gap-2">
          {prevChapterId && (
            <Link
              to={`/read/${prevChapterId}`}
              className="hidden sm:flex items-center gap-1 text-xs bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-lg text-pink-400 hover:bg-pink-500/20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Link>
          )}

          {nextChapterId && (
            <Link
              to={`/read/${nextChapterId}`}
              className="hidden sm:flex items-center gap-1 text-xs bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-all font-bold shadow-md shadow-pink-500/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Pages Container - optimized for zero padding on mobile */}
      <main className="w-full max-w-3xl mx-auto px-0 sm:px-4 py-0 sm:py-6 flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            <p className="text-sm font-medium text-pink-400/80 animate-pulse">Loading chapter pages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-[#141824] border border-pink-500/10 rounded-2xl p-8 max-w-md my-10 mx-4">
            <p className="text-gray-300 text-sm mb-4">Failed to load chapter pages.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 text-pink-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center select-none">
            {pages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Page ${index + 1}`}
                className="w-full h-auto block object-contain sm:rounded-md sm:shadow-lg sm:my-1"
                loading="lazy"
              />
            ))}

            {/* Bottom End Navigation */}
            <div className="flex items-center justify-between w-full px-4 my-8 pt-6 border-t border-pink-500/10">
              {prevChapterId ? (
                <Link
                  to={`/read/${prevChapterId}`}
                  className="flex items-center gap-2 text-xs sm:text-sm bg-[#141824] border border-pink-500/20 px-4 py-2.5 rounded-xl text-pink-400 hover:bg-pink-500/10 transition-all font-bold"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev Chapter
                </Link>
              ) : <div />}

              {nextChapterId ? (
                <Link
                  to={`/read/${nextChapterId}`}
                  className="flex items-center gap-2 text-xs sm:text-sm bg-pink-500 text-white px-4 py-2.5 rounded-xl hover:bg-pink-600 transition-all font-bold shadow-lg shadow-pink-500/20"
                >
                  Next Chapter <ChevronRight className="w-4 h-4" />
                </Link>
              ) : <div />}
            </div>
          </div>
        )}

        {/* Comments Container */}
        {!loading && !error && (
          <div id="comments-section" className="w-full px-4 mt-6 border-t border-pink-500/10 pt-8">
            <Comments mangaId={chapterId} chapterId={chapterId} session={session} onOpenAuth={onOpenAuth} />
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar for Mobile Only */}
      {!loading && !error && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141824]/95 backdrop-blur-lg border-t border-pink-500/20 px-4 py-2 sm:hidden flex items-center justify-between shadow-2xl">
          {prevChapterId ? (
            <Link
              to={`/read/${prevChapterId}`}
              className="flex items-center gap-1 text-xs bg-pink-500/10 border border-pink-500/20 px-3 py-2 rounded-lg text-pink-400 active:scale-95 transition-all font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Link>
          ) : <div className="w-16" />}

          <button
            onClick={scrollToComments}
            className="flex items-center gap-1.5 text-xs bg-[#0a0c10] border border-pink-500/20 px-3 py-2 rounded-lg text-gray-300 active:scale-95 transition-all font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5 text-pink-400" /> Comments
          </button>

          {nextChapterId ? (
            <Link
              to={`/read/${nextChapterId}`}
              className="flex items-center gap-1 text-xs bg-pink-500 text-white px-3 py-2 rounded-lg active:scale-95 transition-all font-bold shadow-md shadow-pink-500/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          ) : <div className="w-16" />}
        </div>
      )}
    </div>
  );
}