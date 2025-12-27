import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Camera, ChevronDown, Check, X } from 'lucide-react';
import { validateAvatarFile } from '../utils/avatarUtils';

export const Settings = () => {
  const {
    signOut,
    user,
    updateDisplayName,
    updateEmail,
    updatePassword,
    uploadAvatar,
    getDisplayName,
    getAvatarUrl,
  } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(getDisplayName());
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showSecuritySection, setShowSecuritySection] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveName = async () => {
    if (nameInput.trim() && nameInput.trim() !== getDisplayName()) {
      try {
        await updateDisplayName(nameInput.trim());
        showStatus('success', 'Name updated');
      } catch {
        showStatus('error', 'Failed to update name');
      }
    }
    setEditingName(false);
  };

  const handleSaveEmail = async () => {
    if (emailInput.trim() && emailInput.trim() !== user?.email) {
      try {
        await updateEmail(emailInput.trim());
        showStatus('success', 'Email updated');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update email';
        showStatus('error', message);
      }
    }
    setEditingEmail(false);
  };

  const handleSavePassword = async () => {
    if (passwordInput.length >= 8) {
      try {
        await updatePassword(passwordInput);
        setPasswordInput('');
        setShowPasswordSection(false);
        showStatus('success', 'Password updated');
      } catch {
        showStatus('error', 'Failed to update password. Please try again.');
      }
    } else {
      showStatus('error', 'Password must be at least 8 characters');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      showStatus('error', validation.error!);
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      showStatus('success', 'Avatar uploaded');
    } catch {
      showStatus('error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      showStatus('error', 'Failed to sign out');
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5]">
      {/* Header */}
      <motion.header
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-[12px] uppercase tracking-wide mb-3 text-[#6F6F6F]">PREFERENCES</p>
        <h1 className="text-[28px] font-semibold tracking-tight">Settings</h1>
      </motion.header>

      {/* Profile */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4 text-[#6F6F6F]">
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()!}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-[18px] font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {getDisplayName().slice(0, 2).toUpperCase()}
              </div>
            )}

            <label
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <Camera size={14} color="#0B0B0B" />
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div>
            <p className="text-[15px] text-[#F5F5F5]">
              {getDisplayName()}
            </p>
            <p className="text-[13px] text-[#6F6F6F]">
              {uploadingAvatar ? 'Uploading...' : 'Click camera to change'}
            </p>
          </div>
        </div>

        {/* Name */}
        <div
          className="flex items-center justify-between py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-[15px] text-[#A0A0A0]">Display Name</span>
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="text-right w-48 bg-transparent border-b border-white/20 outline-none text-[15px] text-[#F5F5F5]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setNameInput(getDisplayName());
                setEditingName(true);
              }}
              className="text-[15px] hover:opacity-70 transition-opacity text-[#F5F5F5]"
            >
              {getDisplayName()}
            </button>
          )}
        </div>
      </motion.section>

      {/* Account Security */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <button
          onClick={() => setShowSecuritySection(!showSecuritySection)}
          className="flex items-center justify-between w-full mb-4 hover:opacity-70 transition-opacity"
        >
          <h2 className="text-[12px] uppercase tracking-wide text-[#6F6F6F]">
            Account Security
          </h2>
          <ChevronDown
            size={16}
            className="text-[#6F6F6F]"
            style={{
              transform: showSecuritySection ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        <AnimatePresence>
          {showSecuritySection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Email */}
                <div
                  className="flex items-center justify-between py-4 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="text-[15px] text-[#A0A0A0]">Email</span>
                  {editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="text-right w-48 bg-transparent border-b border-white/20 outline-none text-[15px] text-[#F5F5F5]"
                        autoFocus
                      />
                      <button onClick={handleSaveEmail} className="hover:opacity-70 transition-opacity">
                        <Check size={18} className="text-[#F5F5F5]" />
                      </button>
                      <button onClick={() => setEditingEmail(false)} className="hover:opacity-70 transition-opacity">
                        <X size={18} className="text-[#6F6F6F]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEmailInput(user?.email || '');
                        setEditingEmail(true);
                      }}
                      className="text-[15px] hover:opacity-70 transition-opacity text-[#F5F5F5]"
                    >
                      {user?.email}
                    </button>
                  )}
                </div>

                {/* Password */}
                <div className="py-4">
                  {!showPasswordSection ? (
                    <button
                      onClick={() => setShowPasswordSection(true)}
                      className="text-[15px] hover:opacity-70 transition-opacity text-[#F5F5F5]"
                    >
                      Change password
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="New password (min 8 characters)"
                        className="w-full bg-transparent border-b border-white/20 outline-none text-[15px] py-2 text-[#F5F5F5]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSavePassword}
                          disabled={passwordInput.length < 8}
                          className="flex-1 py-2 px-4 rounded-lg text-[14px] font-medium transition-all"
                          style={{
                            backgroundColor: passwordInput.length >= 8 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                            color: passwordInput.length >= 8 ? '#0B0B0B' : '#6F6F6F',
                            cursor: passwordInput.length >= 8 ? 'pointer' : 'not-allowed',
                          }}
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordSection(false);
                            setPasswordInput('');
                          }}
                          className="py-2 px-4 rounded-lg text-[14px] font-medium transition-all hover:bg-white/10 text-[#F5F5F5]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Account */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-12 pt-8 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4 text-[#6F6F6F]">
          Account
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-[14px] text-[#A0A0A0]">Logged in as</span>
            <span className="text-[14px] text-[#F5F5F5]">{user?.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-[15px] hover:opacity-70 transition-opacity text-left text-red-500 py-3 -mx-2 px-2 rounded-lg active:bg-red-500/10 disabled:opacity-50"
            type="button"
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </motion.section>

      {/* Status Toast */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full z-50"
            style={{
              backgroundColor: statusMessage.type === 'success'
                ? 'rgba(34, 197, 94, 0.9)'
                : 'rgba(239, 68, 68, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <p className="text-[14px] font-medium">{statusMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
