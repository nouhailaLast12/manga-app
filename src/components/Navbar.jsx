import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Dices, Heart, Bell, ChevronDown, LogOut, User, X } from 'lucide-react';
import NinouMangaLogo from './NinouMangaLogo';
import { supabase } from '../supabaseClient';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 
  'Fantasy', 'Horror', 'Isekai', 'Mystery', 
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports'
];

export default function Navbar({ session, onOpenAuth }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGenresMenu, setShowGenresMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  
  const navigate = useNavigate();
  const genresRef = useRef(null);
  const userMenuRef = useRef(null);

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genresRef.current && !genresRef.current.contains(event.target)) {
        setShowGenresMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 
  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && searchTerm.trim()) {
      setShowGenresMenu(false);
      setShowMobileSearch(false);
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

 
  const handleGenreSelect = (genre) => {
    setShowGenresMenu(false);
    navigate(`/?search=${encodeURIComponent(genre)}`);
  };

  
  const handleRandomManga = async () => {
    setRandomLoading(true);
    setShowGenresMenu(false);
    try {
      const res = await fetch('http://api.mangadex.org/manga/random');
      const data = await res.json();
      if (data?.data?.id) {
        navigate(`/manga/${data.data.id}`);
      }
    } catch (error) {
      console.error('Error fetching random manga:', error);
    } finally {
      setRandomLoading(false);
    }
  };

  
  const handleFavoritesClick = () => {
    setShowGenresMenu(false);
    if (!session) {
      if (onOpenAuth) onOpenAuth();
    } else {
      navigate('/favorites');
    }
  };

  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  const userEmail = session?.user?.email || '';
  const username = userEmail ? userEmail.split('@')[0] : 'Guest';

  return (
    <nav className="bg-[#0f1117]/90 backdrop-blur-md border-b border-pink-500/10 sticky top-0 z-50 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="cursor-pointer">
          <NinouMangaLogo />
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search titles..."
            className="w-full bg-[#161a23] border border-pink-500/10 focus:border-pink-500/40 rounded-full py-2 pl-4 pr-10 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all"
          />
          <Search 
            onClick={handleSearch}
            className="w-4 h-4 text-pink-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-pink-300 transition-colors" 
          />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          
          {/* Mobile Search Icon Toggle */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden p-1.5 text-gray-300 hover:text-pink-400 transition-colors"
          >
            {showMobileSearch ? <X className="w-5 h-5 text-pink-400" /> : <Search className="w-5 h-5 text-pink-400" />}
          </button>

          {/* Genres Dropdown */}
          <div className="relative" ref={genresRef}>
            <button 
              onClick={() => setShowGenresMenu(!showGenresMenu)}
              className="flex items-center gap-1.5 text-gray-300 hover:text-pink-400 transition-colors cursor-pointer py-1"
            >
              <span>Genres</span>
              <ChevronDown className={`w-4 h-4 text-pink-400/70 transition-transform ${showGenresMenu ? 'rotate-180' : ''}`} />
            </button>

            {showGenresMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#141824] border border-pink-500/20 rounded-2xl shadow-xl p-2 grid grid-cols-1 gap-1 z-50">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className="text-left px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-pink-400 hover:bg-pink-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Random Manga */}
          <button 
            onClick={handleRandomManga}
            disabled={randomLoading}
            className="flex items-center gap-1.5 text-gray-300 hover:text-pink-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Dices className={`w-4 h-4 text-pink-400 ${randomLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Random</span>
          </button>

          {/* Favorites */}
          <button 
            onClick={handleFavoritesClick}
            className="flex items-center gap-1.5 text-gray-300 hover:text-pink-400 transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="hidden md:inline">Favorites</span>
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 text-gray-400 hover:text-pink-400 transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-pink-400/80" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Profile / Auth Button */}
          {session ? (
            <div className="relative" ref={userMenuRef}>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-[#161a23] border border-pink-500/20 py-1 px-2.5 rounded-full cursor-pointer hover:border-pink-500/40 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-pink-500/20 uppercase">
                  {username.charAt(0)}
                </div>
                <div className="text-left text-xs hidden md:block">
                  <p className="font-semibold text-gray-200 leading-tight max-w-[100px] truncate">{username}</p>
                  <p className="text-[10px] text-pink-400 font-medium">Member</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#141824] border border-pink-500/20 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-pink-500/10">
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-pink-400 hover:bg-pink-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-pink-500/20 cursor-pointer"
            >
              <User className="w-4 h-4" /> Login
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div className="sm:hidden mt-3 pt-2 border-t border-pink-500/10 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search titles..."
            className="w-full bg-[#161a23] border border-pink-500/20 rounded-full py-2 pl-4 pr-10 text-sm text-gray-200 placeholder-gray-500 outline-none"
            autoFocus
          />
          <Search 
            onClick={handleSearch}
            className="w-4 h-4 text-pink-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer" 
          />
        </div>
      )}
    </nav>
  );
}