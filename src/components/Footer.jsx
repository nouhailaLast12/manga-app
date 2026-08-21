import { Link } from 'react-router-dom';
import { Sparkles, ArrowUp, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#141824] border-t border-pink-500/10 text-gray-400 text-sm mt-16 relative">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Section */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-white tracking-wider">
            <span className="text-pink-500">NOUHA</span>MANGA
          </Link>
          <p className="text-xs text-gray-400 leading-relaxed">
            Read your favorite manga online for free in high quality. Updated daily with the latest releases.
          </p>
          <div className="flex items-center gap-3 text-gray-400">
            <a href="#" className="hover:text-pink-400 transition-colors"><Globe className="w-4 h-4" /></a>
            <a href="#" className="hover:text-pink-400 transition-colors"><Share2 className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-pink-500 pl-2">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-pink-400 transition-colors">Home</Link></li>
            <li><Link to="/favorites" className="hover:text-pink-400 transition-colors">Favorites</Link></li>
            <li>
              <Link to="/random" className="hover:text-pink-400 transition-colors flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" /> Random Manga
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories / Genres */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-pink-500 pl-2">
            Popular Genres
          </h4>
          <ul className="space-y-2 text-xs">
            <li><span className="hover:text-pink-400 cursor-pointer transition-colors">Action</span></li>
            <li><span className="hover:text-pink-400 cursor-pointer transition-colors">Romance</span></li>
            <li><span className="hover:text-pink-400 cursor-pointer transition-colors">Fantasy</span></li>
            <li><span className="hover:text-pink-400 cursor-pointer transition-colors">Comedy</span></li>
          </ul>
        </div>

        {/* Legal & Back to Top */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-pink-500 pl-2">
              Disclaimer
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              nouhamanga does not store any files on its server. All contents are provided by non-affiliated third parties (MangaDex API).
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="mt-6 self-start flex items-center gap-2 text-xs font-bold bg-pink-500/10 border border-pink-500/20 text-pink-400 px-3 py-2 rounded-xl hover:bg-pink-500/20 transition-all cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" /> Back to top
          </button>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-pink-500/5 bg-[#0a0c10] py-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} <span className="text-pink-400 font-bold">nouhamanga</span>. All rights reserved.
      </div>
    </footer>
  );
}