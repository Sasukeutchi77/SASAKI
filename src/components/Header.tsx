import React, { useState } from 'react';
import {
  Search,
  Bell,
  Bookmark,
  PenSquare,
  Shield,
  User as UserIcon,
  LogOut,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onSearchChange: (search: string) => void;
  searchQuery: string;
  onOpenSearchPage?: () => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
  onOpenCreateArticle: () => void;
  onOpenAdmin: () => void;
  onOpenJournalistDashboard: () => void;
  onOpenNotifications: () => void;
  onOpenBookmarks: () => void;
  onOpenProfile: (userId: string) => void;
  onOpenMyProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchQuery,
  onOpenSearchPage,
  onOpenAuth,
  onOpenCreateArticle,
  onOpenAdmin,
  onOpenJournalistDashboard,
  onOpenNotifications,
  onOpenBookmarks,
  onOpenProfile,
  onOpenMyProfile,
}) => {
  const { user, isAuthenticated, logout, unreadNotifs, bookmarksCount, quickSwitch } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => {
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-sm tracking-tight group-hover:scale-105 transition-transform">
                F
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-stone-900">
                    Faso<span className="text-emerald-600">Info</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    BF
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-stone-500 font-medium">Journalisme & Actualités Sociales</p>
              </div>
            </button>
          </div>

          {/* Search bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="search-input-desktop"
                type="text"
                placeholder="Rechercher des articles, journalistes, médias, tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onOpenSearchPage) {
                    onOpenSearchPage();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-transparent focus:border-emerald-600 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all text-stone-900 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {onOpenSearchPage && (
              <button
                id="header-open-discovery-btn"
                onClick={onOpenSearchPage}
                className="px-3 py-2 text-xs font-semibold text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-full shrink-0 transition-colors"
                title="Ouvrir la recherche avancée & découverte"
              >
                Explorer
              </button>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Toggle Button */}
            <button
              id="mobile-search-toggle"
              onClick={() => {
                if (onOpenSearchPage) {
                  onOpenSearchPage();
                } else {
                  setMobileSearchOpen(!mobileSearchOpen);
                }
              }}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                id="quick-demo-role-btn"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                title="Basculer rapidement entre les rôles de démonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Rôle Démo</span>
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100">
                    Tester avec un rôle :
                  </div>
                  <div className="mt-1 space-y-1">
                    <button
                      id="demo-switch-admin"
                      onClick={() => {
                        quickSwitch('admin');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-emerald-50 text-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-emerald-800 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" /> Administrateur
                        </div>
                        <div className="text-[11px] text-stone-500">Modération, vérifications, gestion</div>
                      </div>
                    </button>
                    <button
                      id="demo-switch-media"
                      onClick={() => {
                        quickSwitch('burkinanews');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-blue-50 text-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-blue-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Burkina News (Média vérifié)
                        </div>
                        <div className="text-[11px] text-stone-500">125k abonnés, publication, stats</div>
                      </div>
                    </button>
                    <button
                      id="demo-switch-journalist"
                      onClick={() => {
                        quickSwitch('salif');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-amber-50 text-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-amber-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Salif O. (Journaliste vérifié)
                        </div>
                        <div className="text-[11px] text-stone-500">Enquêtes, économie, articles</div>
                      </div>
                    </button>
                    <button
                      id="demo-switch-reader"
                      onClick={() => {
                        quickSwitch('aminata');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-stone-100 text-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-stone-800 flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5" /> Aminata T. (Lectrice)
                        </div>
                        <div className="text-[11px] text-stone-500">Abonnements, likes, commentaires</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            {isAuthenticated && (
              <button
                id="notifications-header-btn"
                onClick={onOpenNotifications}
                className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            )}

            {/* Bookmarks Button (Desktop) */}
            {isAuthenticated && (
              <button
                id="bookmarks-header-btn"
                onClick={onOpenBookmarks}
                className="hidden sm:flex relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Articles enregistrés"
              >
                <Bookmark className="w-5 h-5" />
                {bookmarksCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-stone-800 text-[10px] font-bold text-white rounded-full">
                    {bookmarksCount}
                  </span>
                )}
              </button>
            )}

            {/* Journalist Dashboard / Create Article Button */}
            {isAuthenticated && (user?.role === 'journalist' || user?.role === 'admin') && (
              <button
                id="header-create-article-btn"
                onClick={onOpenCreateArticle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-full shadow-sm transition-all"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Rédiger</span>
              </button>
            )}

            {/* Admin Control Center Button */}
            {isAuthenticated && user?.role === 'admin' && (
              <button
                id="header-admin-portal-btn"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Administration</span>
              </button>
            )}

            {/* User Account Menu / Login Trigger */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-stone-100 transition-colors focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-stone-200"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1 leading-tight">
                      {user.name.split(' ')[0]}
                      {user.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />}
                    </span>
                    <span className="text-[10px] text-stone-500 capitalize">
                      {user.role === 'admin' ? 'Administrateur' : user.role === 'journalist' ? 'Journaliste' : 'Lecteur'}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2.5 border-b border-stone-100">
                      <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                        {user.name}
                        {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="text-xs text-stone-500 truncate">{user.email}</div>
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                        {user.role === 'admin' ? 'Super Administrateur' : user.role === 'journalist' ? (user.mediaName || 'Journaliste') : 'Lecteur'}
                      </div>
                    </div>

                    <button
                      id="menu-open-my-profile-btn"
                      onClick={() => {
                        onOpenMyProfile();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" /> Mon compte & Photo
                    </button>

                    <button
                      id="menu-open-profile-btn"
                      onClick={() => {
                        onOpenProfile(user.id);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-stone-400" /> Voir ma page publique
                    </button>

                    {(user.role === 'journalist' || user.role === 'admin') && (
                      <button
                        id="menu-open-journalist-dash"
                        onClick={() => {
                          onOpenJournalistDashboard();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4 text-stone-500" /> Tableau de bord Journaliste
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        id="menu-open-admin-portal"
                        onClick={() => {
                          onOpenAdmin();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 font-medium"
                      >
                        <Shield className="w-4 h-4 text-amber-600" /> Administration plateforme
                      </button>
                    )}

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      id="menu-logout-btn"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Connexion
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-stone-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="search-input-mobile"
                type="text"
                placeholder="Rechercher des articles, journalistes, médias..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-9 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
