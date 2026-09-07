import React from 'react';
import { Home, Compass, Bookmark, Bell, User, PlusCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch?: () => void;
  onOpenCreateArticle: () => void;
  onOpenNotifications: () => void;
  onOpenBookmarks: () => void;
  onOpenProfile: (userId?: string) => void;
  onOpenMyProfile: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenCreateArticle,
  onOpenNotifications,
  onOpenBookmarks,
  onOpenProfile,
  onOpenMyProfile,
  onOpenAuth,
  onOpenAdmin,
}) => {
  const { user, isAuthenticated, unreadNotifs } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 safe-area-bottom">
      <div className="flex items-center justify-around h-15 px-2">
        {/* Accueil */}
        <button
          id="mobile-nav-home"
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'feed' ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Accueil</span>
        </button>

        {/* Explorer / Recherche */}
        <button
          id="mobile-nav-explore"
          onClick={() => {
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              onTabChange('search');
            }
          }}
          className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'search' || activeTab === 'trending' ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explorer</span>
        </button>

        {/* Center action: Publier (if journalist/admin) or Enregistrés */}
        {isAuthenticated && (user?.role === 'journalist' || user?.role === 'admin') ? (
          <button
            id="mobile-nav-create-article"
            onClick={onOpenCreateArticle}
            className="flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium text-emerald-700"
          >
            <div className="w-9 h-9 -mt-3 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-emerald-800 font-semibold mt-0.5">Rédiger</span>
          </button>
        ) : (
          <button
            id="mobile-nav-bookmarks"
            onClick={isAuthenticated ? onOpenBookmarks : onOpenAuth}
            className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'bookmarks' ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-5 h-5 mb-0.5" />
            <span>Signets</span>
          </button>
        )}

        {/* Notifications */}
        <button
          id="mobile-nav-notifications"
          onClick={isAuthenticated ? onOpenNotifications : onOpenAuth}
          className="relative flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <div className="relative">
            <Bell className="w-5 h-5 mb-0.5" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full ring-1 ring-white" />
            )}
          </div>
          <span>Alertes</span>
        </button>

        {/* Profil / Connexion */}
        <button
          id="mobile-nav-profile"
          onClick={() => {
            if (isAuthenticated && user) {
              onOpenMyProfile();
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'profile' ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover mb-0.5 border border-stone-300"
            />
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span>{isAuthenticated ? 'Profil' : 'Compte'}</span>
        </button>
      </div>
    </nav>
  );
};
