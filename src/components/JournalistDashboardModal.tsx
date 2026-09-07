import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  FileText,
  Eye,
  Heart,
  MessageSquare,
  Users,
  CheckCircle2,
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  Clock,
  Image as ImageIcon,
  Video as VideoIcon,
  UploadCloud,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Article, User, MediaRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MediaUploader } from './media/MediaUploader';
import { getThumbnailUrl } from '../services/cloudinary';

interface JournalistDashboardModalProps {
  onClose: () => void;
  onOpenCreateArticle: () => void;
  onOpenEditArticle: (article: Article) => void;
  onOpenArticle: (article: Article) => void;
}

export const JournalistDashboardModal: React.FC<JournalistDashboardModalProps> = ({
  onClose,
  onOpenCreateArticle,
  onOpenEditArticle,
  onOpenArticle,
}) => {
  const { user, refreshUser } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'verification' | 'media'>('articles');

  // Media library state
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [mediaFeedback, setMediaFeedback] = useState<string | null>(null);

  // Verification form state
  const [pressCardNumber, setPressCardNumber] = useState('');
  const [motivation, setMotivation] = useState('');
  const [mediaNameInput, setMediaNameInput] = useState(user?.mediaName || '');
  const [submittingVerif, setSubmittingVerif] = useState(false);
  const [verifMessage, setVerifMessage] = useState<string | null>(null);

  const loadJournalistArticles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getArticles({ authorId: user.id });
      setArticles(res.articles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMediaList = async () => {
    if (!user) return;
    setLoadingMedia(true);
    try {
      const res = await api.getMediaRecords({
        type: mediaFilter === 'all' ? undefined : mediaFilter,
      });
      setMediaList(res.mediaRecords || []);
    } catch (err: any) {
      console.error('Failed to load journalist media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    loadJournalistArticles();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'media') {
      loadMediaList();
    }
  }, [activeTab, mediaFilter, user]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDeleteMedia = async (record: MediaRecord) => {
    if (!confirm(`Supprimer le média "${record.altText || record.publicId}" ? Le serveur vérifiera qu'aucun article actif ne l'utilise.`)) {
      return;
    }
    try {
      await api.deleteMediaRecord(record.publicId);
      setMediaFeedback('Média supprimé avec succès.');
      setTimeout(() => setMediaFeedback(null), 3000);
      loadMediaList();
    } catch (err: any) {
      setMediaFeedback(`Erreur : ${err.message}`);
      setTimeout(() => setMediaFeedback(null), 4000);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Supprimer définitivement cet article ?')) return;
    try {
      await api.deleteArticle(id);
      loadJournalistArticles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pressCardNumber.trim() || !motivation.trim()) return;

    setSubmittingVerif(true);
    setVerifMessage(null);
    try {
      const res = await api.requestVerification({
        pressCardNumber: pressCardNumber.trim(),
        motivation: motivation.trim(),
        mediaName: mediaNameInput.trim() || undefined,
      });
      setVerifMessage(res.message);
      await refreshUser();
    } catch (err: any) {
      setVerifMessage(`Erreur: ${err.message}`);
    } finally {
      setSubmittingVerif(false);
    }
  };

  const totalViews = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.likesCount || 0), 0);
  const totalComments = articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-4 max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar}
              alt={user?.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-stone-200"
            />
            <div>
              <h2 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                <span>Espace Journaliste & Rédaction</span>
                {user?.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" title="Compte officiel vérifié" />
                )}
              </h2>
              <p className="text-xs text-stone-500">
                {user?.mediaName ? `${user.mediaName} • ` : ''}
                {user?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenCreateArticle();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvel article</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 bg-stone-100/60 border-b border-stone-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> Articles
              </div>
              <div className="mt-1 text-xl font-black text-stone-900">{articles.length}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 text-emerald-600" /> Lectures
              </div>
              <div className="mt-1 text-xl font-black text-stone-900">{totalViews.toLocaleString()}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 text-red-600" /> Likes reçus
              </div>
              <div className="mt-1 text-xl font-black text-stone-900">{totalLikes}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Abonnés
              </div>
              <div className="mt-1 text-xl font-black text-stone-900">
                {(user?.followersCount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('articles')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'articles'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Mes Articles ({articles.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Vérification & Badge officiel</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Médiathèque Cloud ({mediaList.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'articles' ? (
            loading ? (
              <div className="p-12 text-center text-stone-400">Chargement de vos publications...</div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center text-stone-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>Vous n'avez pas encore rédigé d'articles.</p>
                <button
                  onClick={() => {
                    onOpenCreateArticle();
                    onClose();
                  }}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Rédiger mon premier article
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            {art.categoryName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              art.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {art.status === 'published' ? 'En ligne' : 'Brouillon'}
                          </span>
                        </div>
                        <h4
                          onClick={() => {
                            onOpenArticle(art);
                            onClose();
                          }}
                          className="mt-1 font-bold text-sm text-stone-900 hover:text-emerald-700 cursor-pointer truncate"
                        >
                          {art.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-xs text-stone-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {art.viewsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" /> {art.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {art.commentsCount}
                          </span>
                          <span>•</span>
                          <span>{new Date(art.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onOpenEditArticle(art);
                          onClose();
                        }}
                        className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-stone-200/60 rounded-lg"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'verification' ? (
            /* TAB: VERIFICATION */
            <div className="max-w-xl space-y-6">
              {user?.isVerified ? (
                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                  <div className="flex items-center gap-2 font-black text-lg">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    <span>Compte Journaliste / Média Certifié</span>
                  </div>
                  <p className="mt-2 text-xs text-blue-800 leading-relaxed">
                    Votre statut professionnel est vérifié par le Conseil Supérieur de la Communication (CSC) et
                    l'administration de FasoInfo. Le badge bleu officiel est actif à côté de votre nom sur tous vos articles.
                  </p>
                </div>
              ) : user?.verificationStatus === 'pending' ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>Demande de vérification en cours d’examen</span>
                  </div>
                  <p className="mt-2 text-xs text-amber-800 leading-relaxed">
                    Vos documents ont été transmis à l’équipe de modération. Vous recevrez une notification dès que
                    l'administration aura validé votre carte de presse.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendVerification} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Demander le badge de vérification officielle</h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Réservé aux journalistes détenteurs d'une carte de presse valide ou aux maisons de presse déclarées.
                    </p>
                  </div>

                  {verifMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                      {verifMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Nom du Média ou Organe de Presse
                    </label>
                    <input
                      type="text"
                      value={mediaNameInput}
                      onChange={(e) => setMediaNameInput(e.target.value)}
                      placeholder="Ex: L'Observateur du Sahel"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Numéro de carte de presse ou récépissé légal *
                    </label>
                    <input
                      type="text"
                      required
                      value={pressCardNumber}
                      onChange={(e) => setPressCardNumber(e.target.value)}
                      placeholder="Ex: BF-PRESS-2026-XXXX"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Motivation & Parcours journalistique *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Indiquez vos spécialités, vos collaborations antérieures et vos engagements déontologiques..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingVerif}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingVerif ? 'Envoi en cours...' : 'Soumettre ma demande à l’administration'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Media Library Tab for Journalist */
            <div className="space-y-4">
              {mediaFeedback && (
                <div className="p-3 bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{mediaFeedback}</span>
                </div>
              )}

              {/* Action and Filter Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      mediaFilter === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Tous ({mediaList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('image')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      mediaFilter === 'image'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    Images
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('video')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      mediaFilter === 'video'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <VideoIcon className="w-3 h-3" />
                    Vidéos
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMediaUploader(!showMediaUploader)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{showMediaUploader ? 'Fermer l’outil d’envoi' : 'Téléverser un média Cloud'}</span>
                </button>
              </div>

              {/* Uploader section */}
              {showMediaUploader && (
                <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-2">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Nouveau téléversement Cloudinary sécurisé
                  </h4>
                  <MediaUploader
                    type="image"
                    usageType="article_gallery"
                    showAltInput={true}
                    showCaptionInput={true}
                    onChange={() => {
                      setMediaFeedback('Fichier téléversé avec succès !');
                      loadMediaList();
                      setShowMediaUploader(false);
                      setTimeout(() => setMediaFeedback(null), 3000);
                    }}
                  />
                </div>
              )}

              {/* Media items grid */}
              {loadingMedia ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  Chargement de vos ressources multimédias...
                </div>
              ) : mediaList.length === 0 ? (
                <div className="py-12 text-center bg-stone-50 rounded-xl border border-stone-200 p-6">
                  <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-700">Aucun média dans votre bibliothèque</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Téléversez vos photos et vidéos de reportage pour les intégrer à vos articles.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs group flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-stone-100 overflow-hidden">
                        {item.resourceType === 'video' ? (
                          <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                            <VideoIcon className="w-6 h-6 text-white/70" />
                          </div>
                        ) : (
                          <img
                            src={getThumbnailUrl(item.url, 280)}
                            alt={item.altText || item.publicId}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        )}

                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs">
                          {item.format ? item.format.toUpperCase() : item.resourceType.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-2.5 space-y-1.5">
                        <p className="text-[11px] font-bold text-stone-800 truncate" title={item.altText || item.publicId}>
                          {item.altText || item.publicId}
                        </p>

                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(item.url)}
                            title="Copier le lien Cloudinary"
                            className="p-1 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded transition flex items-center gap-1 text-[10px] font-medium"
                          >
                            {copiedUrl === item.url ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Lien</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-stone-400 hover:text-stone-700 rounded transition"
                              title="Ouvrir dans un nouvel onglet"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(item)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded transition"
                              title="Supprimer ce média"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
