import { Link } from 'react-router-dom';
import { Crown, Sparkle } from 'lucide-react';

function NinouMangaLogo() {
  return (
    <Link to="/" className="flex items-center gap-3 group cursor-pointer select-none">
      <div className="relative flex items-center justify-center">
       
        <Crown 
          className="w-9 h-9 text-pink-500 fill-pink-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.7)]" 
        />

        
        <Sparkle className="w-3.5 h-3.5 text-pink-300 fill-pink-300 absolute -top-1 -right-1 animate-pulse" />
      </div>

      
      <div className="flex items-end">
        <span className="text-2xl font-black tracking-tight text-white group-hover:text-pink-400 transition-colors duration-300">
          Nouha
        </span>
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-rose-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
          Manga
        </span>
        <span className="text-[10px] font-bold text-pink-400 ml-0.5 tracking-wider">.to</span>
      </div>
    </Link>
  );
}

export default NinouMangaLogo;