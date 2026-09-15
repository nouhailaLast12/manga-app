import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Comments from '../components/Comments';

import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function MangaViewer({
  session: propSession,
  onOpenAuth
}) {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [session, setSession] = useState(propSession);

  const [prevChapterId, setPrevChapterId] = useState(null);
  const [nextChapterId, setNextChapterId] = useState(null);

  /* ==========================================
     SESSION
  ========================================== */
  useEffect(() => {
    if (propSession) {
      setSession(propSession);
    } else {
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          setSession(session);
        });
    }
  }, [propSession]);

  /* ==========================================
     FETCH CHAPTER
  ========================================== */
  useEffect(() => {
    const fetchChapterAndInfo = async () => {
      if (!chapterId) return;

      setLoading(true);
      setError(false);
      setPages([]);
      setPrevChapterId(null);
      setNextChapterId(null);

      window.scrollTo(0, 0);

      try {
        /* ==============================
           GET CHAPTER PAGES
        ============================== */
        const res = await fetch(
          `/api/mangadex/at-home/server/${chapterId}`
        );

        if (!res.ok) {
          throw new Error('Failed to load chapter');
        }

        const data = await res.json();

        const baseUrl = data.baseUrl;
        const hash = data.chapter?.hash;
        const pageFiles = data.chapter?.data || [];

        if (!baseUrl || !hash || pageFiles.length === 0) {
          throw new Error('Invalid chapter data');
        }

        const imageUrls = pageFiles.map((fileName) => {
          const imageUrl = `${baseUrl}/data/${hash}/${fileName}`;
          return `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}`;
        });

        setPages(imageUrls);

        /* ==============================
           GET CHAPTER INFO
        ============================== */
        const chInfoRes = await fetch(
          `/api/mangadex/chapter/${chapterId}`
        );

        if (!chInfoRes.ok) {
          throw new Error('Failed to load chapter info');
        }

        const chInfoData = await chInfoRes.json();

        /* ==============================
           FIND MANGA
        ============================== */
        const mangaRel = chInfoData.data?.relationships?.find(
          (relation) => relation.type === 'manga'
        );

        if (!mangaRel?.id) return;

        /* ==============================
           GET ALL CHAPTERS
        ============================== */
        const feedRes = await fetch(
          `/api/mangadex/manga/${mangaRel.id}/feed?translatedLanguage[]=en&translatedLanguage[]=fr&order[chapter]=asc&limit=500`
        );

        if (!feedRes.ok) {
          throw new Error('Failed to load manga chapters');
        }

        const feedData = await feedRes.json();
        const allChapters = feedData.data || [];

        /* ==============================
           SORT CHAPTERS
        ============================== */
        const sortedChapters = [...allChapters].sort((a, b) => {
          const aNum = parseFloat(a.attributes?.chapter || 0);
          const bNum = parseFloat(b.attributes?.chapter || 0);
          return aNum - bNum;
        });

        /* ==============================
           REMOVE DUPLICATE CHAPTER NUMBERS
        ============================== */
        const uniqueChapters = sortedChapters.filter(
          (ch, index, self) =>
            index ===
            self.findIndex(
              (c) =>
                c.attributes?.chapter === ch.attributes?.chapter
            )
        );

        /* ==============================
           FIND CURRENT CHAPTER
        ============================== */
        const currentIndex = uniqueChapters.findIndex(
          (chapter) => chapter.id === chapterId
        );

        if (currentIndex !== -1) {
          setPrevChapterId(
            currentIndex > 0
              ? uniqueChapters[currentIndex - 1].id
              : null
          );

          setNextChapterId(
            currentIndex < uniqueChapters.length - 1
              ? uniqueChapters[currentIndex + 1].id
              : null
          );
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

  /* ==========================================
     UI
  ========================================== */

  return (
    <div className="bg-[#0a0c10] min-h-screen text-white">

      {/* =====================================
          NAVBAR
          - Hna khass tb9a FIXE bach maykounch mkhbi
          - Ila Navbar dyalek deja fixe f component, zid ghir had class hna
      ===================================== */}
      <div className="fixed top-0 left-0 right-0 z-[90]">
        <Navbar session={session} onOpenAuth={onOpenAuth} />
      </div>

      {/* =====================================
          FIXED READER BAR
          - FIXE 100% o matbedel la color
          - Z-index 100 bach tb9a fo9
          - Top-[64px] bach tb9a taht Navbar direct
      ===================================== */}
      <div
        className="
          fixed
          top-[64px]
          sm:top-[72px]
          left-0
          right-0
          z-[100]
          w-full
          min-h-[52px]
          bg-[#141824]/95
          backdrop-blur-md
          border-b
          border-pink-500/20
          shadow-lg
          flex
          items-center
          justify-between
          px-3
          sm:px-6
          py-2
        "
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="
            flex items-center gap-1
            text-xs font-bold
            text-gray-300
            hover:text-pink-400
            transition-colors
            cursor-pointer
            shrink-0
          "
        >
          <ArrowLeft className="w-4 h-4 text-pink-400" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* CENTER TITLE */}
        <div
          className="
            text-xs sm:text-sm
            font-bold
            text-pink-400
            text-center
            truncate
            mx-2
          "
        >
          Chapter
        </div>

        {/* PREV / NEXT */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PREVIOUS */}
          {prevChapterId ? (
            <Link
              to={`/read/${prevChapterId}`}
              className="
                flex items-center justify-center gap-1
                text-xs
                bg-pink-500/10
                border border-pink-500/30
                px-2 sm:px-2.5
                py-1.5
                rounded-lg
                text-pink-400
                hover:bg-pink-500/20
                transition-all
                font-bold
              "
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </Link>
          ) : (
            <span
              className="
                flex items-center justify-center gap-1
                text-xs
                bg-gray-800/40
                border border-gray-700
                px-2 sm:px-2.5
                py-1.5
                rounded-lg
                text-gray-500
                opacity-50
              "
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </span>
          )}

          {/* NEXT */}
          {nextChapterId ? (
            <Link
              to={`/read/${nextChapterId}`}
              className="
                flex items-center justify-center gap-1
                text-xs
                bg-pink-500
                text-white
                px-2.5 sm:px-3
                py-1.5
                rounded-lg
                hover:bg-pink-600
                transition-all
                font-bold
                shadow-sm
              "
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span
              className="
                flex items-center justify-center gap-1
                text-xs
                bg-gray-800/40
                border border-gray-700
                px-2.5 sm:px-3
                py-1.5
                rounded-lg
                text-gray-500
                opacity-50
              "
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* =====================================
          MAIN CONTENT
          - Hna drna pt-[130px] bach lcontenu ybda taht Navbar + Reader Bar
      ===================================== */}
      <main
        className="
          max-w-4xl
          mx-auto
          px-3
          sm:px-4
          py-6
          pt-[130px]
          sm:pt-[145px]
          flex
          flex-col
          items-center
        "
      >
        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            <p className="text-sm font-medium text-pink-400/80 animate-pulse">
              Loading chapter pages...
            </p>
          </div>
        ) : error ? (
          /* ERROR */
          <div className="text-center py-16 bg-[#141824] border border-pink-500/10 rounded-2xl p-8 max-w-md my-10">
            <p className="text-gray-300 text-sm mb-4">
              Failed to load chapter pages.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="
                inline-flex items-center gap-2
                px-4 py-2
                bg-pink-500/10
                border border-pink-500/30
                hover:bg-pink-500/20
                text-pink-400
                rounded-xl
                text-xs font-bold
                transition-all
                cursor-pointer
              "
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : (
          /* CHAPTER PAGES */
          <div className="w-full flex flex-col items-center gap-2">
            {pages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Page ${index + 1}`}
                className="
                  w-full
                  max-w-3xl
                  h-auto
                  rounded-md
                  shadow-lg
                  block
                "
                loading="lazy"
              />
            ))}

            {/* BOTTOM NAVIGATION */}
            <div className="flex items-center justify-between w-full max-w-3xl my-8 pt-6 border-t border-pink-500/10">
              {prevChapterId ? (
                <Link
                  to={`/read/${prevChapterId}`}
                  className="
                    flex items-center gap-2
                    text-sm
                    bg-[#141824]
                    border border-pink-500/20
                    px-4 py-2.5
                    rounded-xl
                    text-pink-400
                    hover:bg-pink-500/10
                    transition-all
                    font-bold
                  "
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous Chapter</span>
                </Link>
              ) : <div />}

              {nextChapterId ? (
                <Link
                  to={`/read/${nextChapterId}`}
                  className="
                    flex items-center gap-2
                    text-sm
                    bg-pink-500
                    text-white
                    px-4 py-2.5
                    rounded-xl
                    hover:bg-pink-600
                    transition-all
                    font-bold
                  "
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : <div />}
            </div>
          </div>
        )}

        {/* COMMENTS */}
        {!loading && !error && (
          <div className="w-full max-w-3xl mt-6 border-t border-pink-500/10 pt-8">
            <Comments
              mangaId={chapterId}
              chapterId={chapterId}
              session={session}
              onOpenAuth={onOpenAuth}
            />
          </div>
        )}
      </main>
    </div>
  );
}