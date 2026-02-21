import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi, filesApi, totpApi, authApi } from '../api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { User as UserIcon, Camera, Settings, Edit3 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ProfilePage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        discordNickname: user?.discordNickname || '',
        minecraftNickname: user?.minecraftNickname || '',
        bio: user?.bio || ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showBanModal, setShowBanModal] = useState(false);

    const [totpSetupData, setTotpSetupData] = useState<{ secret: string; qrCodeDataUri: string } | null>(null);
    const [totpVerifyCode, setTotpVerifyCode] = useState('');
    const [showTotpModal, setShowTotpModal] = useState(false);

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                discordNickname: user.discordNickname || '',
                minecraftNickname: user.minecraftNickname || '',
                bio: user.bio || ''
            });

            if (user.banned) {
                setShowBanModal(true);
            }
        }
    }, [user, isAdmin, navigate]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await usersApi.updateMe(formData);
            setIsEditing(false);
            showNotification('Профиль успешно обновлен!', 'success');
            // navigate(0); // Removing reload for better UX if possible, but keeping logic consistent
        } catch (err: any) {
            console.error('Failed to update profile', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Не удалось обновить профиль.';
            showNotification(errorMsg, 'error');
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('Пароли не совпадают!', 'warning');
            return;
        }
        try {
            await usersApi.updateMe({
                newPassword: passwordData.newPassword,
                oldPassword: passwordData.oldPassword
            });

            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            showNotification('Пароль успешно обновлен!', 'success');
        } catch (err: any) {
            console.error('Failed to update password', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Не удалось обновить пароль. Возможно, функция временно недоступна.';
            showNotification(errorMsg, 'error');
        }
    };

    const handleEnableTotp = async () => {
        try {
            const res = await totpApi.setup();
            setTotpSetupData(res);
            setShowTotpModal(true);
        } catch (err) {
            console.error(err);
            showNotification('Failed to start TOTP setup', 'error');
        }
    };

    const handleVerifyTotp = async () => {
        try {
            await totpApi.verify(totpVerifyCode);
            alert('2FA успешно активирована!');
            setShowTotpModal(false);
            setTotpSetupData(null);
            setTotpVerifyCode('');
            navigate(0);
        } catch (err) {
            console.error(err);
            showNotification('Неверный код', 'error');
        }
    };

    const handleDisableTotp = async () => {
        const code = prompt('Введите код из приложения для отключения 2FA:');
        if (!code) return;
        try {
            await totpApi.disable(code);
            alert('2FA отключена');
            navigate(0);
        } catch (err) {
            console.error(err);
            alert('Ошибка отключения 2FA');
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const res = await filesApi.uploadAvatar(file);
                // Update user profile with new avatar URL
                await usersApi.updateMe({ ...formData, avatarUrl: res.url });
                navigate(0);
            } catch (err) {
                console.error('Failed to upload avatar', err);
                showNotification('Failed to upload avatar', 'error');
            }
        }
    };

    if (!user) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-story-gold"></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <SEO title="Профиль" description="Ваш профиль игрока" />
            <div className="min-h-screen pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar / Profile Card */}
                        <div className="w-full md:w-1/3 space-y-6">
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-story-gold to-transparent opacity-50" />

                                <div className="relative group mx-auto w-32 h-32 mb-4">
                                    <div className="w-32 h-32 rounded-full bg-neutral-900 overflow-hidden shadow-lg shadow-story-gold/20 mx-auto border-2 border-white/5 relative">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.username} className="avatar-img" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UserIcon className="w-12 h-12 text-story-gold" />
                                            </div>
                                        )}
                                    </div>
                                    {!user.banned && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-2 bg-story-gold rounded-full text-black shadow-lg hover:bg-white transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        accept="image/*"
                                    />
                                </div>

                                <h2 className="text-2xl font-bold font-minecraft text-white mb-2 text-center">
                                    {user.username}
                                </h2>

                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.role === 'ROLE_ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {user.role?.replace('ROLE_', '')}
                                    </span>
                                    {user.badges && user.badges.map(badge => (
                                        <div
                                            key={badge.id}
                                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 border"
                                            style={{
                                                backgroundColor: `${badge.color}15`,
                                                color: badge.color,
                                                borderColor: `${badge.color}30`
                                            }}
                                        >
                                            <div className="w-3.5 h-3.5 badge-icon" dangerouslySetInnerHTML={{ __html: badge.svgIcon }} />
                                            {badge.name}
                                        </div>
                                    ))}
                                    {user.isPlayer && (
                                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs border border-green-500/20 font-bold uppercase">PLAYER</span>
                                    )}
                                    {user.banned && <span className="bg-red-900/50 text-red-200 px-2 py-0.5 rounded text-xs border border-red-500/20 font-bold uppercase">BANNED</span>}
                                </div>
                            </div>

                            {/* Navigation Tabs (Vertical on desktop) */}
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-2 backdrop-blur-md shadow-xl flex flex-col gap-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 font-medium ${activeTab === 'profile' ? 'bg-story-gold text-black shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Профиль
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 font-medium ${activeTab === 'settings' ? 'bg-story-gold text-black shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Настройки аккаунта
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="w-full md:w-2/3">
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-xl relative min-h-[400px]">
                                {activeTab === 'profile' ? (
                                    // PROFILE VIEW
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                            <h3 className="text-xl font-bold text-white">Информация о профиле</h3>
                                            {!isEditing && (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-story-gold/10 hover:bg-story-gold/20 text-story-gold border border-story-gold/30 rounded-xl transition-all font-bold text-sm"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Редактировать
                                                </button>
                                            )}
                                        </div>

                                        {/* Email Verification Warning */}
                                        {!user.emailVerified && (
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                                        ⚠️
                                                    </div>
                                                    <div>
                                                        <h4 className="text-yellow-200 font-bold text-sm uppercase tracking-wider">Email не подтвержден</h4>
                                                        <p className="text-yellow-500/80 text-xs">Подтвердите почту для доступа ко всем функциям.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        const btn = e.currentTarget;
                                                        if (!user.email) return;
                                                        try {
                                                            btn.disabled = true;
                                                            btn.textContent = 'Отправка...';
                                                            await authApi.resendVerification({ email: user.email });
                                                            btn.textContent = 'Отправлено!';
                                                            setTimeout(() => {
                                                                btn.disabled = false;
                                                                btn.textContent = 'Выслать письмо';
                                                            }, 60000);
                                                        } catch (err) {
                                                            console.error(err);
                                                            btn.textContent = 'Ошибка';
                                                            btn.disabled = false;
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 text-sm font-bold rounded-lg border border-yellow-500/20 transition-all uppercase tracking-wider whitespace-nowrap"
                                                >
                                                    Выслать письмо
                                                </button>
                                            </div>
                                        )}

                                        {!isEditing ? (
                                            // VIEW MODE
                                            <div className="grid grid-cols-1 gap-8 animate-fadeIn">
                                                <div className="space-y-4">
                                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">О себе (Bio)</span>
                                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 min-h-[120px]">
                                                        <p className="text-gray-300 leading-relaxed italic whitespace-pre-wrap">
                                                            {user.bio || "Пользователь еще ничего не рассказал о себе."}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Discord Tag</span>
                                                        <p className="text-white font-bold text-lg font-mono">{user.discordNickname || '—'}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Minecraft Nickname</span>
                                                        <p className="text-white font-bold text-lg font-mono">{user.minecraftNickname || '—'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // EDIT MODE
                                            <form onSubmit={handleUpdateProfile} className="space-y-6 animate-slideUp">
                                                <div className="grid grid-cols-1 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">О себе (Bio)</label>
                                                        <textarea
                                                            value={formData.bio}
                                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white resize-none h-24"
                                                            placeholder="Расскажите о себе..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">Discord Tag</label>
                                                            <input
                                                                type="text"
                                                                value={formData.discordNickname}
                                                                onChange={(e) => setFormData({ ...formData, discordNickname: e.target.value })}
                                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white"
                                                                placeholder="user#1234"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">Minecraft Nickname</label>
                                                            <input
                                                                type="text"
                                                                value={formData.minecraftNickname}
                                                                onChange={(e) => setFormData({ ...formData, minecraftNickname: e.target.value })}
                                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white"
                                                                placeholder="Steve"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            // Reset form data to current user data
                                                            setFormData({
                                                                ...formData,
                                                                discordNickname: user?.discordNickname || '',
                                                                minecraftNickname: user?.minecraftNickname || '',
                                                                bio: user?.bio || ''
                                                            });
                                                        }}
                                                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10"
                                                    >
                                                        Отмена
                                                    </button>
                                                    <button type="submit" className="bg-story-gold text-black font-bold py-2 px-8 rounded-xl hover:bg-story-gold-light transition-colors shadow-lg">
                                                        Сохранить изменения
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ) : (
                                    // ACCOUNT SETTINGS (Email, Password, 2FA)
                                    <div className="space-y-8 animate-fadeIn">
                                        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Настройки аккаунта</h3>

                                        {/* Security: Email & Password */}
                                        <div className="space-y-6">
                                            {/* Email Change Section */}
                                            <div className="bg-white/5 border border-white/5 rounded-xl p-6">
                                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                    <span className="text-gray-400">✉️</span> Смена Email
                                                </h4>
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-1">Текущий Email</label>
                                                        <div className="text-white font-mono bg-black/30 px-3 py-2 rounded-lg border border-white/10 inline-block">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                    {/* In a real app, you would have a form here to request email change */}
                                                    <p className="text-xs text-gray-500">
                                                        Для смены email, пожалуйста, обратитесь к администрации через Discord.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Password Change Section */}
                                            <div className="bg-white/5 border border-white/5 rounded-xl p-6">
                                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                    <span className="text-gray-400">🔑</span> Смена пароля
                                                </h4>
                                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Текущий пароль</label>
                                                        <input
                                                            type="password"
                                                            value={passwordData.oldPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:border-story-gold/50 text-white"
                                                            placeholder="Текущий пароль"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Новый пароль</label>
                                                        <input
                                                            type="password"
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:border-story-gold/50 text-white"
                                                            placeholder="••••••••"
                                                            minLength={6}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Подтвердите пароль</label>
                                                        <input
                                                            type="password"
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:border-story-gold/50 text-white"
                                                            placeholder="••••••••"
                                                            minLength={6}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <button
                                                            type="submit"
                                                            disabled={!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Обновить пароль
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Security: 2FA */}
                                        <div className="border-t border-white/10 pt-6">
                                            <h4 className="text-lg font-bold text-white mb-4">Двухфакторная аутентификация</h4>
                                            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium mb-1">Status: {user.totpEnabled ? <span className="text-green-400">Enabled</span> : <span className="text-gray-400">Disabled</span>}</p>
                                                    <p className="text-gray-400 text-sm">Protect your account with an extra layer of security.</p>
                                                </div>
                                                {user.totpEnabled ? (
                                                    <button
                                                        onClick={handleDisableTotp}
                                                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/20 hover:bg-red-500/30 transition-colors font-medium text-sm"
                                                    >
                                                        Отключить
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleEnableTotp}
                                                        className="px-4 py-2 bg-story-gold/20 text-story-gold rounded-lg border border-story-gold/20 hover:bg-story-gold/30 transition-colors font-medium text-sm"
                                                    >
                                                        Настроить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Ban Notification Modal */}
            {showBanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Аккаунт заблокирован</h3>
                            <p className="text-gray-400 text-sm">
                                Ваш аккаунт имеет статус <span className="text-red-400 font-bold">BANNED</span>.
                            </p>
                        </div>

                        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 mb-6">
                            <p className="text-xs text-red-300 uppercase font-bold mb-1">Причина блокировки:</p>
                            <p className="text-white italic">{user?.banReason || "Причина не указана"}</p>
                        </div>

                        <button
                            onClick={() => setShowBanModal(false)}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-red-600/20"
                        >
                            Понятно
                        </button>
                    </div>
                </div>
            )}

            {/* TOTP Setup Modal */}
            {showTotpModal && totpSetupData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-story-gold/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Настройка 2FA</h3>

                        <div className="bg-white p-4 rounded-xl mb-4 flex justify-center">
                            <img src={totpSetupData.qrCodeDataUri} alt="QR Code" className="w-48 h-48" />
                        </div>

                        <p className="text-gray-400 text-sm mb-4 text-center">
                            Отсканируйте QR-код в Google Authenticator или Authy.
                            <br />
                            Секретный ключ: <code className="bg-black/50 px-1 rounded text-story-gold">{totpSetupData.secret}</code>
                        </p>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Введите код (6 цифр)"
                                value={totpVerifyCode}
                                onChange={(e) => setTotpVerifyCode(e.target.value)}
                                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-center tracking-widest text-xl focus:border-story-gold/50 outline-none"
                                maxLength={6}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleVerifyTotp}
                                className="flex-1 py-2 bg-story-gold hover:bg-story-gold-light text-black font-bold rounded-xl transition-colors"
                            >
                                Подтвердить
                            </button>
                            <button
                                onClick={() => { setShowTotpModal(false); setTotpSetupData(null); }}
                                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProfilePage;
