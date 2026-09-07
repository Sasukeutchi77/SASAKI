import React, { useState, useEffect } from 'react';
import { User, Article } from '../types';
import {
  X,
  CheckCircle2,
  UserPlus,
  UserCheck,
  FileText,
  Users,
  Calendar,
  Layers,
  Phone,
  Mail,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArticleCard } from './ArticleCard';

interface MediaProfileModalProps {
  userId: string;
  onClose: () => void;
  onOpenArticle: (article: Article) => void;
  onOpenAuth: () => void;
}

export const MediaProfileModal: React.FC<MediaProfileModalProps> = ({
  userId,
  onClose,
  onOpenArticle,
  onOpenAuth,
}) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'articles' | 'about'>('articles');
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getUserProfile(userId);
      setProfileUser(res.user);
      setArticles(res.articles);
      setIsFollowing(!!res.user.isFollowing);
      setFollowersCount(res.user.followersCount || 0);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) return onOpenAuth();
    try {
      const res = await api.toggleFollow(userId);
      setIsFollowing(res.isFollowing);
      setFollowersCount(res.followersCount);
    } catch (err) {
      console.error(err);
    }
  };

  // Compute main categories of this media
  const mediaCategories = Array.from(new Set(articles.map((a) => a.categoryName)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl sm:my-8 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !profileUser ? (
          <div className="p-16 text-center text-stone-500">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Chargement du profil...</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {/* Banner Cover */}
            <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-emerald-800 via-stone-800 to-amber-700 relative">
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Profile Info Header */}
            <div className="px-4 sm:px-8 pb-6 border-b border-stone-200 relative">
              <div className="flex flex-wrap items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                <div className="flex items-end gap-4">
                  <img
                    src={
                      profileUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={profileUser.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                  />
                  <div className="mb-1">
                    <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                      <span>{profileUser.mediaName || profileUser.name}</span>
                      {profileUser.isVerified && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" title="Média / Journaliste certifié" />
                      )}
                    </h1>
                    {profileUser.mediaName && profileUser.name !== profileUser.mediaName && (
                      <p className="text-xs text-stone-500 font-medium">Représenté par {profileUser.name}</p>
                    )}
                    <span className="mt-1 inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {profileUser.role === 'admin'
                        ? 'Administration'
                        : profileUser.role === 'journalist'
                        ? 'Presse & Journalisme'
                        : 'Lecteur Citoyen'}
                    </span>
                  </div>
                </div>

                {/* Follow Button */}
                {currentUser?.id !== profileUser.id && (
                  <button
                    id="profile-follow-toggle-btn"
                    onClick={handleToggleFollow}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all ${
                      isFollowing
                        ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Abonné</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>S'abonner</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl mt-2">
                  {profileUser.bio}
                </p>
              )}

              {/* Key Stats Bar */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-stone-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-stone-900">{followersCount.toLocaleString()}</span>
                  <span>abonnés</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-stone-900">{articles.length}</span>
                  <span>articles publiés</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Membre depuis {new Date(profileUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Media Categories Pills */}
              {mediaCategories.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-stone-500 font-medium">Rubriques couvertes :</span>
                  {mediaCategories.map((c, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Navigation Tabs */}
            <div className="px-4 sm:px-8 border-b border-stone-200 flex gap-6 bg-stone-50/50">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'articles'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Articles ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'about'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                À propos
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-8">
              {activeTab === 'articles' ? (
                articles.length === 0 ? (
                  <div className="p-12 text-center text-stone-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Aucun article publié pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles.map((art) => (
                      <ArticleCard
                        key={art.id}
                        article={art}
                        onOpenArticle={() => {
                          onOpenArticle(art);
                          onClose();
                        }}
                        onOpenProfile={() => {}}
                        onOpenAuth={onOpenAuth}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4 max-w-xl text-sm text-stone-700">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <h3 className="font-bold text-stone-900 mb-2">Description éditoriale</h3>
                    <p className="leading-relaxed">
                      {profileUser.bio || 'Aucune description fournie.'}
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <h3 className="font-bold text-stone-900 mb-2">Informations de contact & légitimité</h3>
                    <div className="flex items-center gap-2 text-stone-600">
                      <Mail className="w-4 h-4 text-stone-400" />
                      <span>{profileUser.email}</span>
                    </div>
                    {profileUser.phone && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span>{profileUser.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-stone-600 pt-1">
                      <CheckCircle2 className={`w-4 h-4 ${profileUser.isVerified ? 'text-blue-600' : 'text-stone-400'}`} />
                      <span>
                        Statut d'accréditation :{' '}
                        <strong>
                          {profileUser.isVerified
                            ? 'Vérifié officiel (Conseil de Presse)'
                            : 'Enregistrement standard'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
