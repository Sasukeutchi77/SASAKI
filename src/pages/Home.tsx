import React, { useState, useEffect } from 'react';
import { Article, Category, User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryBar } from '../components/CategoryBar';
import { ArticleCard } from '../components/ArticleCard';
import {
  Flame,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  UserCheck,
  PlusCircle,
  Search,
  Filter,
  Tag,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';

interface HomeProps {
  onOpenArticle: (article: Article) => void;
  onOpenProfile: (userId: string) => void;
  onOpenAuth: () => void;
  onOpenCreateArticle: () => void;
  onOpenSearch?: () => void;
  onOpenCategoryPage?: (catSlug: string) => void;
  searchQuery: string;
  selectedCategory: string | null;
  onSelectCategory: (catSlug: string | null) => void;
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
}

export const Home: React.FC<HomeProps> = ({
  onOpenArticle,
  onOpenProfile,
  onOpenAuth,
  onOpenCreateArticle,
  onOpenSearch,
  onOpenCategoryPage,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  selectedTag: externalTag,
  onSelectTag: externalSetTag,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [feedTab, setFeedTab] = useState<'foryou' | 'trending' | 'latest' | 'following'>('foryou');
  const [internalTag, setInternalTag] = useState<string | null>(null);

  const selectedTag = externalTag !== undefined ? externalTag : internalTag;
  const setSelectedTag = (tag: string | null) => {
    if (externalSetTag) externalSetTag(tag);
    else setInternalTag(tag);
  };

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [topJournalists, setTopJournalists] = useState<User[]>([]);
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Load initial global data
  useEffect(() => {
    api.getCategories().then((res) => {
      setCategories(res.categories);
    });
    api.getJournalists().then((res) => {
      setTopJournalists(res.journalists);
    });
    api.getTags().then((res) => {
      setPopularTags(res.tags);
    });
  }, []);

  // Fetch first page of articles when filter criteria change
  const fetchInitialArticles = async () => {
    setLoading(true);
    setPage(1);
    try {
      const params: Parameters<typeof api.getArticles>[0] = {
        feed: feedTab,
        page: 1,
        limit: 10,
      };

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedTag) {
        params.tag = selectedTag;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const res = await api.getArticles(params);
      setArticles(res.articles);
      setHasMore(res.hasMore);

      // Select featured article on main feed if not searching / filtering
      if (!selectedCategory && !selectedTag && !searchQuery && feedTab === 'foryou' && res.articles.length > 0) {
        setFeaturedArticle(res.articles[0]);
      } else {
        setFeaturedArticle(null);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialArticles();
  }, [feedTab, selectedCategory, selectedTag, searchQuery, isAuthenticated]);

  // Load next page
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params: Parameters<typeof api.getArticles>[0] = {
        feed: feedTab,
        page: nextPage,
        limit: 10,
      };

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedTag) {
        params.tag = selectedTag;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const res = await api.getArticles(params);
      setArticles((prev) => [...prev, ...res.articles]);
      setPage(nextPage);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error('Failed to load more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleFollow = async (journalistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return onOpenAuth();
    try {
      const res = await api.toggleFollow(journalistId);
      setTopJournalists((prev) =>
        prev.map((j) =>
          j.id === journalistId
            ? { ...j, isFollowing: res.isFollowing, followersCount: res.followersCount }
            : j
        )
      );
      // If currently on following tab, reload to reflect followed creator's articles
      if (feedTab === 'following') {
        fetchInitialArticles();
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  const handleSelectTagFilter = (tag: string) => {
    const clean = tag.replace(/^#/, '').trim();
    setSelectedTag(clean);
  };

  // Regular articles excluding featured article (if shown)
  const regularArticles = featuredArticle
    ? articles.filter((a) => a.id !== featuredArticle.id)
    : articles;

  return (
    <div className="min-h-screen bg-stone-100/70 pb-20 md:pb-12">
      {/* Horizontal Category Bar */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedTag(null);
          onSelectCategory(slug);
        }}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Category active banner */}
        {selectedCategory && selectedCategory !== 'all' && (
          <div className="mb-4 p-3.5 bg-white rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-stone-900">
                Rubrique : {categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name || selectedCategory}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenCategoryPage && (
                <button
                  onClick={() => onOpenCategoryPage(selectedCategory)}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 transition-colors"
                >
                  Page complète de la rubrique →
                </button>
              )}
              <button
                onClick={() => onSelectCategory(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
                title="Toutes les rubriques"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Bar (Search or Tag) */}
        {(searchQuery || selectedTag) && (
          <div className="mb-4 p-3 bg-white rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery && (
                <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recherche : <strong>« {searchQuery} »</strong></span>
                </div>
              )}
              {selectedTag && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>#{selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="ml-1 text-emerald-700 hover:text-emerald-950 cursor-pointer"
                    title="Retirer ce filtre"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="font-bold text-stone-900">{articles.length} article(s) trouvé(s)</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed Column (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Feed Tabs Bar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-1.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto">
                <button
                  id="tab-feed-foryou"
                  onClick={() => setFeedTab('foryou')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    feedTab === 'foryou'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pour vous</span>
                </button>

                <button
                  id="tab-feed-trending"
                  onClick={() => setFeedTab('trending')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    feedTab === 'trending'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Tendances</span>
                </button>

                <button
                  id="tab-feed-latest"
                  onClick={() => setFeedTab('latest')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    feedTab === 'latest'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Dernières minutes</span>
                </button>

                <button
                  id="tab-feed-following"
                  onClick={() => {
                    if (!isAuthenticated) {
                      onOpenAuth();
                    } else {
                      setFeedTab('following');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    feedTab === 'following'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Abonnements</span>
                </button>
              </div>
            </div>

            {/* Featured Article Hero Banner (Only on main "Pour vous" feed with no search or tag) */}
            {featuredArticle && !selectedCategory && !selectedTag && !searchQuery && feedTab === 'foryou' && (
              <div
                id="featured-article-hero"
                onClick={() => onOpenArticle(featuredArticle)}
                className="group relative rounded-2xl overflow-hidden bg-stone-900 text-white shadow-md cursor-pointer aspect-[16/10] sm:aspect-[21/9]"
              >
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-stone-950">
                      À la Une • {featuredArticle.categoryName}
                    </span>
                    <span className="text-xs text-stone-300 font-medium">
                      {new Date(featuredArticle.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black leading-tight text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {featuredArticle.title}
                  </h2>
                  {featuredArticle.summary && (
                    <p className="mt-1.5 text-xs sm:text-sm text-stone-300 line-clamp-2 max-w-2xl leading-relaxed">
                      {featuredArticle.summary}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">
                        {featuredArticle.mediaName || featuredArticle.authorName}
                      </span>
                      {featuredArticle.isAuthorVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                    <span>•</span>
                    <span>{featuredArticle.viewsCount} vues</span>
                    <span>•</span>
                    <span>{featuredArticle.likesCount} likes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Articles List / Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-200" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-24 bg-stone-200 rounded-sm" />
                        <div className="h-2.5 w-16 bg-stone-200 rounded-sm" />
                      </div>
                    </div>
                    <div className="aspect-[16/9] w-full bg-stone-200 rounded-xl" />
                    <div className="h-4 w-3/4 bg-stone-200 rounded-sm" />
                    <div className="h-3 w-full bg-stone-200 rounded-sm" />
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="p-10 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <Filter className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <h3 className="font-bold text-stone-800 text-sm">Aucun article trouvé</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {feedTab === 'following'
                    ? "Vous n'êtes abonné à aucun journaliste ou média pour le moment. Abonnez-vous à vos sources d'information préférées ci-dessous pour composer votre fil personnalisé !"
                    : 'Aucune publication ne correspond à vos critères de recherche.'}
                </p>

                {feedTab === 'following' && topJournalists.length > 0 && (
                  <div className="mt-6 max-w-md mx-auto text-left border-t border-stone-100 pt-4">
                    <p className="text-xs font-bold text-stone-700 mb-3 text-center">
                      Suggestions de médias et journalistes à suivre :
                    </p>
                    <div className="space-y-2">
                      {topJournalists.slice(0, 3).map((j) => (
                        <div
                          key={j.id}
                          className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={j.avatar}
                              alt={j.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {j.mediaName || j.name}
                              </p>
                              <p className="text-[10px] text-stone-500 truncate">
                                {j.followersCount || 0} abonnés
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleToggleFollow(j.id, e)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Suivre
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedCategory || selectedTag || searchQuery) && (
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      setSelectedTag(null);
                    }}
                    className="mt-4 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {regularArticles.map((art) => (
                    <ArticleCard
                      key={art.id}
                      article={art}
                      onOpenArticle={onOpenArticle}
                      onOpenProfile={onOpenProfile}
                      onOpenAuth={onOpenAuth}
                      onSelectTag={handleSelectTagFilter}
                      onSelectCategory={onSelectCategory}
                    />
                  ))}
                </div>

                {/* Pagination: Load More Button */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      id="load-more-articles-btn"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-full shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Chargement des articles...</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 text-emerald-700" />
                          <span>Afficher plus d'actualités</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar Column (4 cols on desktop, hidden on small screens) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-5">
            {/* Journalist Write Callout */}
            {isAuthenticated && (user?.role === 'journalist' || user?.role === 'admin') ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-stone-900 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Espace de Publication</h3>
                    <p className="text-[11px] text-stone-300">Journaliste / Média accrédité</p>
                  </div>
                </div>
                <p className="text-xs text-stone-200 leading-relaxed mt-2 mb-3">
                  Partagez une dépêche urgente, une enquête d'investigation ou une analyse citoyenne.
                </p>
                <button
                  id="sidebar-create-article-btn"
                  onClick={onOpenCreateArticle}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Rédiger un nouvel article</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <h3 className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                  <span>Rejoignez l'élite des médias</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-1.5">
                  Vous êtes journaliste professionnel ou directeur d'un organe de presse ? Créez votre profil
                  et demandez votre badge officiel.
                </p>
                <button
                  onClick={onOpenAuth}
                  className="mt-3 w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Déclarer un média ou journaliste
                </button>
              </div>
            )}

            {/* Recommended & Verified Media */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Médias & Journalistes de référence</span>
                </h3>
              </div>

              <div className="divide-y divide-stone-100">
                {topJournalists.slice(0, 5).map((j) => (
                  <div key={j.id} className="py-3 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onOpenProfile(j.id)}
                      className="flex items-center gap-2.5 text-left group min-w-0 cursor-pointer"
                    >
                      <img
                        src={j.avatar}
                        alt={j.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-stone-200 group-hover:ring-2 group-hover:ring-emerald-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-900 group-hover:text-emerald-700 truncate flex items-center gap-1">
                          <span>{j.mediaName || j.name}</span>
                          {j.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {j.followersCount || 0} abonnés
                        </div>
                      </div>
                    </button>

                    {user?.id !== j.id && (
                      <button
                        onClick={(e) => handleToggleFollow(j.id, e)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          j.isFollowing
                            ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={j.isFollowing ? 'Abonné' : "S'abonner"}
                      >
                        {j.isFollowing ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Tags & Topics Widget */}
            {popularTags.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Sujets & Tags populaires</span>
                  </h3>
                  {onOpenSearch && (
                    <button
                      onClick={onOpenSearch}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      Explorer tout
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.slice(0, 12).map((t) => (
                    <button
                      key={t.tag}
                      onClick={() => handleSelectTagFilter(t.tag)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-lg text-xs font-semibold transition-colors group cursor-pointer"
                    >
                      <span className="text-emerald-600">#</span>
                      <span>{t.tag}</span>
                      <span className="text-[10px] text-stone-400 group-hover:text-emerald-600">
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick About FasoInfo */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 space-y-2">
              <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                Charte d'éthique et de transparence
              </div>
              <p className="leading-relaxed">
                FasoInfo promeut un journalisme certifié, indépendant et vérifié au Burkina Faso et en Afrique de
                l'Ouest. Chaque article est soumis au contrôle déontologique de la rédaction et aux retours des
                citoyens.
              </p>
              <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-400">
                <span>© 2026 FasoInfo</span>
                <span>•</span>
                <span>Conditions d'utilisation</span>
                <span>•</span>
                <span>Conseil de Presse</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
