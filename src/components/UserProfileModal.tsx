import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  Shield,
  Clock,
  Calendar,
  Mail,
  User as UserIcon,
  Phone,
  Edit3,
  Save,
  FileCheck,
  AlertCircle,
  LogOut,
  UploadCloud,
  Check,
  Building2,
  FileText,
  BadgeAlert,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl, validateMediaFile } from '../services/cloudinary';

interface UserProfileModalProps {
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const {
    user,
    logout,
    updateUserProfile,
    uploadAvatar,
    uploadCover,
    removeAvatar,
    removeCover,
    requestJournalistVerification,
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const cardDocInputRef = useRef<HTMLInputElement>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [saveLoading, setSaveLoading] = useState(false);

  // Avatar Upload State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Cover Image State
  const [coverUploading, setCoverUploading] = useState(false);

  // Journalist Accreditation Request Modal / Form
  const [showAccreditationForm, setShowAccreditationForm] = useState(false);
  const [mediaName, setMediaName] = useState(user?.mediaName || '');
  const [pressCardNumber, setPressCardNumber] = useState('');
  const [motivation, setMotivation] = useState('');
  const [cardDocFile, setCardDocFile] = useState<File | null>(null);
  const [cardDocUploading, setCardDocUploading] = useState(false);
  const [accreditationLoading, setAccreditationLoading] = useState(false);

  // Feedback Messages
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!user) return null;

  // Handle avatar file selection
  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file, 'image');
    if (!validation.isValid) {
      setFeedback({ type: 'error', message: validation.error || 'Fichier image invalide.' });
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setFeedback(null);
  };

  // Confirm upload to Cloudinary & update Firestore
  const handleConfirmAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setFeedback(null);

    try {
      const media = await uploadAvatar(avatarFile);
      setAvatarPreview(null);
      setAvatarFile(null);
      setFeedback({
        type: 'success',
        message: 'Photo de profil mise à jour et optimisée avec succès sur Cloudinary !',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Échec de l’envoi de la photo vers Cloudinary.',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Cancel selected avatar
  const handleCancelAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove avatar entirely
  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      setFeedback({ type: 'success', message: 'Photo de profil réinitialisée avec succès.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Impossible de supprimer la photo.' });
    }
  };

  // Select and upload cover image (banner)
  const handleSelectCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file, 'image');
    if (!validation.isValid) {
      setFeedback({ type: 'error', message: validation.error || 'Image de couverture invalide.' });
      return;
    }

    setCoverUploading(true);
    setFeedback(null);
    try {
      await uploadCover(file);
      setFeedback({ type: 'success', message: 'Image de couverture mise à jour avec succès sur Cloudinary !' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Échec du téléversement de la bannière.' });
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Remove cover image
  const handleRemoveCover = async () => {
    try {
      await removeCover();
      setFeedback({ type: 'success', message: 'Bannière de profil supprimée.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Impossible de supprimer la bannière.' });
    }
  };

  // Save editable profile fields
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setFeedback(null);

    try {
      await updateUserProfile({
        name: editName.trim(),
        username: editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        bio: editBio.trim(),
        phone: editPhone.trim(),
      });
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Vos informations de profil ont été enregistrées.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit Journalist Accreditation Request
  const handleSubmitAccreditation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pressCardNumber.trim() || !motivation.trim()) {
      setFeedback({
        type: 'error',
        message: 'Le numéro de carte de presse et votre motivation sont obligatoires.',
      });
      return;
    }

    setAccreditationLoading(true);
    setFeedback(null);

    try {
      let documentUrl: string | undefined;

      // If document attached, upload to Cloudinary
      if (cardDocFile) {
        setCardDocUploading(true);
        const { uploadMediaToCloudinary } = await import('../services/cloudinary');
        const media = await uploadMediaToCloudinary(cardDocFile, {
          type: 'image',
          folder: 'fasoinfo/press_cards',
        });
        documentUrl = media.url;
        setCardDocUploading(false);
      }

      await requestJournalistVerification({
        mediaName: mediaName.trim(),
        pressCardNumber: pressCardNumber.trim(),
        motivation: motivation.trim(),
        documentUrl,
      });

      setShowAccreditationForm(false);
      setFeedback({
        type: 'success',
        message:
          'Votre dossier d’accréditation a bien été transmis aux administrateurs pour vérification officielle.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors de la soumission de l’accréditation.',
      });
    } finally {
      setAccreditationLoading(false);
      setCardDocUploading(false);
    }
  };

  // Display user role label
  const roleLabel =
    user.role === 'admin'
      ? 'Administrateur Central'
      : user.role === 'journalist'
      ? 'Journaliste / Rédaction de Presse'
      : 'Lecteur Citoyen';

  const roleBadgeColor =
    user.role === 'admin'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : user.role === 'journalist'
      ? 'bg-blue-100 text-blue-900 border-blue-300'
      : 'bg-emerald-100 text-emerald-900 border-emerald-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-4 max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-stone-900">Mon Profil Utilisateur</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`px-6 py-3 text-xs flex items-center gap-2 font-semibold border-b ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Profile Header Block: Cover Banner + Overlapping Avatar */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
            {/* Cover Banner */}
            <div className="relative w-full h-36 sm:h-44 bg-gradient-to-r from-emerald-800 via-teal-900 to-stone-900 overflow-hidden group">
              {user.coverImage ? (
                <img
                  src={user.coverImage}
                  alt="Bannière de profil"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-mono">
                  Bannière de profil personnalisée
                </div>
              )}

              {/* Cover input & actions */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleSelectCover}
                className="hidden"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                  className="px-2.5 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {coverUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Téléversement...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>{user.coverImage ? 'Changer la bannière' : 'Ajouter une bannière'}</span>
                    </>
                  )}
                </button>

                {user.coverImage && !coverUploading && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs transition cursor-pointer"
                    title="Supprimer la bannière"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Avatar & User Meta Section */}
            <div className="p-4 sm:p-5 pt-0 sm:pt-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-14 mb-3">
                {/* Overlapping Avatar */}
                <div className="relative shrink-0 group">
                  <img
                    src={
                      avatarPreview ||
                      getOptimizedImageUrl(user.avatar, { width: 240, height: 240, crop: 'fill', gravity: 'face' }) ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-stone-200"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleSelectAvatar}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    title="Changer de photo via Cloudinary"
                    className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md border-2 border-white transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* User Info Header */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-black text-stone-900">{user.name}</h3>
                    {user.isVerified && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" title="Compte vérifié officiel" />
                    )}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                      {roleLabel}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 font-mono">
                    @{user.username || user.email.split('@')[0]} • UID: {user.uid || user.id.slice(0, 14)}...
                  </p>
                </div>

                {user.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-[11px] text-stone-400 hover:text-red-600 transition"
                  >
                    Réinitialiser l'avatar
                  </button>
                )}
              </div>

              {/* User contact details */}
              <div className="text-xs text-stone-600 flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 border-t border-stone-200">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    {user.phone}
                  </span>
                )}
              </div>

              {/* Cloudinary Avatar Upload Action Confirmation */}
              {avatarFile && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-xs text-emerald-800 font-medium truncate">
                    Nouvelle photo sélectionnée : {avatarFile.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleConfirmAvatarUpload}
                      disabled={avatarUploading}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {avatarUploading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Upload Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Confirmer</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAvatar}
                      disabled={avatarUploading}
                      className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Security & Non-Tampering Notice */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3 text-xs text-stone-600">
            <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-800">Sécurité & Contrôle d'Accès Côté Serveur (RBAC)</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Les privilèges administratifs et de rédaction presse sont strictement vérifiés par le serveur et Firestore Security Rules. Un utilisateur ne peut pas modifier son propre rôle depuis le client.
              </p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="border border-stone-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Informations Personnelles
              </h4>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-stone-500 hover:underline font-medium"
                >
                  Annuler
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Nom complet / Signature
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Nom d'utilisateur (@)
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+226 XX XX XX XX"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Biographie
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Présentez-vous brièvement..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveLoading ? 'Enregistrement...' : 'Sauvegarder les modifications'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-400 block font-bold uppercase text-[10px]">Biographie</span>
                  <p className="text-stone-700 mt-0.5">{user.bio || 'Aucune biographie rédigée.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-stone-400 block font-bold uppercase text-[10px]">Date d’inscription</span>
                    <span className="text-stone-700 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-bold uppercase text-[10px]">Statut du compte</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Actif & Vérifié
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section Demande d'Accréditation Journaliste (si Lecteur / USER) */}
          {user.role === 'user' || user.role === 'reader' ? (
            <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <FileCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-blue-950">
                      Devenir Journaliste Professionnel / Organe de Presse
                    </h4>
                    <p className="text-xs text-blue-800 mt-0.5">
                      FasoInfo offre un espace de publication exclusif aux journalistes titulaires d'une carte de presse reconnue par le Conseil Supérieur de la Communication.
                    </p>
                  </div>
                </div>
              </div>

              {user.verificationStatus === 'pending' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-bold">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Votre dossier d’accréditation est actuellement en cours d’examen par l’administration.</span>
                </div>
              ) : user.verificationStatus === 'approved' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Votre compte a été vérifié avec succès par l'administration.</span>
                </div>
              ) : !showAccreditationForm ? (
                <button
                  type="button"
                  onClick={() => setShowAccreditationForm(true)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Déposer une demande d’accréditation
                </button>
              ) : (
                <form onSubmit={handleSubmitAccreditation} className="p-4 bg-white rounded-xl border border-blue-200 space-y-3">
                  <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Formulaire d’accréditation presse
                  </h5>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Nom de votre Organe de presse / Rédaction *
                    </label>
                    <input
                      type="text"
                      required
                      value={mediaName}
                      onChange={(e) => setMediaName(e.target.value)}
                      placeholder="Ex: Le Quotidien de Ouaga"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Numéro officiel de Carte de Presse *
                    </label>
                    <input
                      type="text"
                      required
                      value={pressCardNumber}
                      onChange={(e) => setPressCardNumber(e.target.value)}
                      placeholder="Ex: CSC-BF-2024-8849"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Motivation & Sujets couverts *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Décrivez brièvement votre expérience journalistique et les rubriques que vous souhaitez couvrir sur FasoInfo..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Photo ou scan de la carte de presse (Cloudinary)
                    </label>
                    <input
                      ref={cardDocInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setCardDocFile(e.target.files?.[0] || null)}
                      className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAccreditationForm(false)}
                      className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-xs font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={accreditationLoading || cardDocUploading}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      {accreditationLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Transmission...</span>
                        </>
                      ) : (
                        <span>Soumettre ma demande d’accréditation</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* Logout Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter de FasoInfo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
