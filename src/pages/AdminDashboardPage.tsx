import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, applicationsApi, type User } from '../api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Users, FileText, Shield, Ban, Search, Filter, MoreVertical, Edit, Key, Trash2, X, Copy } from 'lucide-react';

const AdminDashboardPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'users' | 'applications' | 'badges'>('users');

    // Data states
    const [users, setUsers] = useState<User[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [allBadges, setAllBadges] = useState<any[]>([]);

    // Filter states
    const [appStatusFilter, setAppStatusFilter] = useState<string>('PENDING');
    const [adminComment, setAdminComment] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [appSearch, setAppSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<string>('');

    // Action states
    const [banReason, setBanReason] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);
    const [showSecurityDossier, setShowSecurityDossier] = useState<number | null>(null);

    // IP Geo Information Helper
    const IPGeoInfo = ({ ip: rawIpInput, colorClasses }: { ip?: string, colorClasses: string }) => {
        const [geo, setGeo] = useState<{ city?: string; country_name?: string; flag?: string; ip?: string } | null>(null);
        const [loading, setLoading] = useState(false);

        const getFlagEmoji = (countryCode: string) => {
            if (!countryCode || countryCode.length !== 2) return '';
            const codePoints = countryCode
                .toUpperCase()
                .split('')
                .map(char => 127397 + char.charCodeAt(0));
            return String.fromCodePoint(...codePoints);
        }

        useEffect(() => {
            if (!rawIpInput || rawIpInput === '—') {
                setGeo(null);
                return;
            }

            const parts = rawIpInput.split(',');
            if (parts.length === 3) {
                const [cc, city, ip] = parts;
                setGeo({
                    city,
                    country_name: cc,
                    flag: getFlagEmoji(cc),
                    ip: ip
                });
                return;
            }

            const ip = rawIpInput;
            if (ip === '0:0:0:0:0:0:0:1' || ip === '127.0.0.1') {
                setGeo({ ip, city: 'Localhost', country_name: 'Local', flag: '💻' });
                return;
            };

            setLoading(true)
            fetch(`https://ipwho.is/${ip}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setGeo({
                            city: data.city,
                            country_name: data.country_name,
                            flag: data.flag.emoji,
                            ip: ip
                        });
                    } else {
                        setGeo({ ip });
                    }
                })
                .catch(() => setGeo({ ip }))
                .finally(() => setLoading(false));
        }, [rawIpInput]);

        if (!rawIpInput || rawIpInput === '—') return <code className="text-gray-600 font-bold text-3xl">—</code>;

        const displayIp = geo?.ip || rawIpInput;
        const isLongIp = displayIp.length > 20;

        return (
            <div className="flex items-center gap-3 flex-wrap min-w-0">
                <code className={`${colorClasses} ${isLongIp ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold font-mono tracking-tight break-all`}>
                    {displayIp}
                </code>
                <div className="flex items-center gap-2">
                    {geo?.flag && (
                        <span className="text-2xl shrink-0" title={`${geo.city}, ${geo.country_name}`}>
                            {geo.flag}
                        </span>
                    )}
                    {geo?.city && (
                        <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
                            ({geo.city}{geo.country_name ? `, ${geo.country_name}` : ''})
                        </span>
                    )}
                </div>
                {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin shrink-0" />}
            </div>
        );
    };
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [editingBadge, setEditingBadge] = useState<any>(null);


    // Modals
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [showAppModal, setShowAppModal] = useState(false);
    const [currentApp, setCurrentApp] = useState<any>(null);

    // Forms
    const [createUserForm, setCreateUserForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'ROLE_USER',
        discordNickname: '',
        minecraftNickname: '',
        bio: ''
    });

    const [editUserForm, setEditUserForm] = useState({
        id: 0,
        username: '',
        email: '',
        role: 'ROLE_USER',
        discordNickname: '',
        minecraftNickname: '',
        bio: '',
        isPlayer: false
    });

    // Refs for clicking outside to close
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuUserId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResetPassword = async (id: number) => {
        if (!confirm('Сбросить пароль пользователю?')) return;
        try {
            const res = await adminApi.resetUserPassword(id);
            if (res.temporaryPassword) {
                prompt('Пароль сброшен. Временный пароль (скопируйте):', res.temporaryPassword);
            }
            setOpenMenuUserId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to reset password');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminApi.createUser(createUserForm);
            alert('Пользователь создан!');
            setShowCreateUserModal(false);
            setCreateUserForm({ username: '', email: '', password: '', role: 'ROLE_USER', discordNickname: '', minecraftNickname: '', bio: '' });
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to create user');
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminApi.updateUser(editUserForm.id, editUserForm);
            alert('Пользователь обновлен!');
            setShowEditUserModal(false);
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to update user');
        }
    };

    const openEditModal = (user: User) => {
        setEditUserForm({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            discordNickname: user.discordNickname || '',
            minecraftNickname: user.minecraftNickname || '',
            bio: user.bio || '',
            isPlayer: user.isPlayer || false
        });
        setSelectedUserId(user.id);
        setShowEditUserModal(true);
        setOpenMenuUserId(null);
    };

    const openBanModal = (userId: number) => {
        setSelectedUserId(userId);
        setBanReason('');
        setShowBanModal(true);
        setOpenMenuUserId(null);
    };

    useEffect(() => {
        if (user && !isAdmin) {
            navigate('/');
        }
        if (user && isAdmin) {
            fetchData();
        }
    }, [user, isAdmin, navigate, activeTab]);

    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, appsRes, badgesRes] = await Promise.all([
                adminApi.getAllUsers(),
                applicationsApi.getAll(),
                adminApi.getBadges()
            ]);

            setUsers(usersRes);
            setApplications(Array.isArray(appsRes) ? appsRes : []);
            setAllBadges(badgesRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async () => {
        if (!banReason) return alert('Введите причину бана');
        if (!selectedUserId) return;
        try {
            await adminApi.banUser(selectedUserId, banReason);
            setBanReason('');
            setSelectedUserId(null);
            setShowBanModal(false);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to ban user');
        }
    };

    const handleUnban = async (id: number) => {
        if (!confirm('Разбанить пользователя?')) return;
        try {
            await adminApi.unbanUser(id);
            fetchData();
            setOpenMenuUserId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to unban user');
        }
    };

    const handleAppStatus = async (id: number, status: string) => {
        try {
            await applicationsApi.updateStatus(id, status, adminComment);
            setAdminComment('');
            setShowAppModal(false);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.minecraftNickname?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.discordNickname?.toLowerCase().includes(userSearch.toLowerCase());

        const matchesRole = userRoleFilter === '' || u.role === userRoleFilter;

        return matchesSearch && matchesRole;
    });

    const filteredApplications = applications.filter(app => {
        const query = appSearch.toLowerCase();
        const matchesSearch = (
            app.firstName?.toLowerCase().includes(query) ||
            app.lastName?.toLowerCase().includes(query) ||
            app.user?.username?.toLowerCase().includes(query) ||
            app.id?.toString().includes(query) ||
            app.user?.minecraftNickname?.toLowerCase().includes(query)
        );

        const matchesStatus = appStatusFilter === '' || app.status === appStatusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        totalUsers: users.length,
        pendingApps: applications.filter(a => a.status === 'PENDING' || !a.status).length,
        activeUsers: users.filter(u => u.isPlayer).length,
        bannedUsers: users.filter(u => u.banned).length
    };

    return (
        <Layout>
            <SEO title="Admin Dashboard" description="Админ панель" />
            <div className="h-screen pt-12 pb-4 px-4 flex flex-col overflow-hidden">
                <div className="w-full flex-grow flex flex-col overflow-hidden">

                    <div className="flex items-center gap-4 mb-1 flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-red-900/50 flex items-center justify-center border border-red-500/30">
                            <Shield className="w-6 h-6 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold font-minecraft text-white">Панель Администратора</h1>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-xl flex-grow flex flex-col overflow-hidden">

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Всего пользователей</span>
                                <span className="text-2xl font-bold text-white font-minecraft">{stats.totalUsers}</span>
                            </div>
                            <div className="bg-story-gold/10 border border-story-gold/20 rounded-xl p-4">
                                <span className="text-story-gold text-[10px] uppercase font-bold tracking-widest block mb-1">Ожидают заявок</span>
                                <span className="text-2xl font-bold text-story-gold font-minecraft">{stats.pendingApps}</span>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                <span className="text-green-400 text-[10px] uppercase font-bold tracking-widest block mb-1">Активные игроки</span>
                                <span className="text-2xl font-bold text-green-400 font-minecraft">{stats.activeUsers}</span>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <span className="text-red-400 text-[10px] uppercase font-bold tracking-widest block mb-1">Забанено</span>
                                <span className="text-2xl font-bold text-red-400 font-minecraft">{stats.bannedUsers}</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10 mb-4">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'users' ? 'border-story-gold text-story-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Пользователи
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('applications')}
                                className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'applications' ? 'border-story-gold text-story-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Заявки
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${stats.pendingApps > 0 ? 'bg-story-gold text-black shadow-lg shadow-story-gold/20' : 'bg-white/10 text-gray-400'}`}>
                                        {stats.pendingApps}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('badges')}
                                className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'badges' ? 'border-story-gold text-story-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Значки (Badges)
                                </div>
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center flex-grow">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-story-gold"></div>
                            </div>
                        ) : activeTab === 'users' ? (
                            <div className="space-y-4 flex-grow flex flex-col overflow-hidden">
                                {/* Actions */}
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                        <div className="relative max-w-xs w-full">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Поиск по нику или email..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 text-white transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {['', 'ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN'].map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => setUserRoleFilter(role)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${userRoleFilter === role
                                                        ? 'bg-white/10 text-white border border-white/20'
                                                        : 'text-gray-500 hover:text-gray-300'
                                                        }`}
                                                >
                                                    {role === '' ? 'Все' : role.replace('ROLE_', '')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateUserModal(true)}
                                        className="bg-story-gold hover:bg-story-gold/80 text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-story-gold/20 whitespace-nowrap"
                                    >
                                        Создать игрока
                                    </button>
                                </div>

                                <div className="overflow-x-auto flex-grow overflow-y-auto">
                                    <table className="w-full text-left border-collapse relative">
                                        <thead>
                                            <tr className="border-b border-white/10 text-gray-400 text-sm uppercase">
                                                <th className="px-3 py-2 sticky top-0 bg-neutral-900 z-10">Пользователь</th>
                                                <th className="px-3 py-2 sticky top-0 bg-neutral-900 z-10">Email</th>
                                                <th className="px-3 py-2 sticky top-0 bg-neutral-900 z-10">Никнеймы</th>
                                                <th className="px-3 py-2 sticky top-0 bg-neutral-900 z-10">Значки</th>
                                                <th className="px-3 py-2 sticky top-0 bg-neutral-900 z-10">Роль</th>
                                                <th className="px-3 py-2 sticky top-0 bg-neutral-900 z-10 text-center">2FA</th>
                                                <th className="px-3 py-2 sticky top-0 bg-neutral-900 z-10">Статус</th>
                                                <th className="px-3 py-2 text-right sticky top-0 bg-neutral-900 z-10">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-300">
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-3 py-1 font-medium text-white flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-900 border border-white/5 relative">
                                                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="avatar-img" /> : null}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1">
                                                                {u.username}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{u.id}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-1 break-all">
                                                        <div className="flex flex-col">
                                                            <span>{u.email}</span>
                                                            <span className={`text-[9px] font-bold ${u.emailVerified ? 'text-green-500/60' : 'text-red-500/60'} uppercase`}>
                                                                {u.emailVerified ? '✓ Подтвержден' : '✗ Не подтвержден'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-1 text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs text-gray-500">MC: {u.minecraftNickname || '-'}</span>
                                                            <span className="text-xs text-gray-500">DS: {u.discordNickname || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-1">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {u.badges?.map(badge => (
                                                                <div
                                                                    key={badge.id}
                                                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 border"
                                                                    style={{
                                                                        backgroundColor: `${badge.color}15`,
                                                                        color: badge.color,
                                                                        borderColor: `${badge.color}30`
                                                                    }}
                                                                >
                                                                    <div className="w-3 h-3 badge-icon" dangerouslySetInnerHTML={{ __html: badge.svgIcon }} />
                                                                    {badge.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-1">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'ROLE_ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                            {u.role.replace('ROLE_', '')}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-1 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.totpEnabled ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-500 border border-white/5'}`}>
                                                            {u.totpEnabled ? 'ON' : 'OFF'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-1">
                                                        {u.banned ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-red-400 font-bold">BANNED</span>
                                                                {u.banReason && <span className="text-xs text-red-300 italic break-words">"{u.banReason}"</span>}
                                                            </div>
                                                        ) : u.isPlayer ? (
                                                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                                PLAYER
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500 text-[10px] font-bold uppercase opacity-50 italic">Registered</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1 text-right relative">
                                                        <button
                                                            onClick={() => setOpenMenuUserId(openMenuUserId === u.id ? null : u.id)}
                                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                                        >
                                                            <MoreVertical className="w-5 h-5 text-gray-400" />
                                                        </button>

                                                        {openMenuUserId === u.id && (
                                                            <div ref={menuRef} className="absolute right-4 top-10 z-50 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn ring-1 ring-white/10">
                                                                <button
                                                                    onClick={() => openEditModal(u)}
                                                                    className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center gap-4 transition-colors text-base"
                                                                >
                                                                    <Edit className="w-5 h-5 text-story-gold" />
                                                                    Редактировать
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowSecurityDossier(u.id)}
                                                                    className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center gap-4 transition-colors text-base"
                                                                >
                                                                    <Shield className="w-5 h-5 text-blue-400" />
                                                                    Security Dossier
                                                                </button>
                                                                <button
                                                                    onClick={() => handleResetPassword(u.id)}
                                                                    className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center gap-4 transition-colors text-base"
                                                                >
                                                                    <Key className="w-5 h-5 text-yellow-400" />
                                                                    Сбросить пароль
                                                                </button>
                                                                {u.banned ? (
                                                                    <button
                                                                        onClick={() => handleUnban(u.id)}
                                                                        className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center gap-4 transition-colors text-base text-green-400"
                                                                    >
                                                                        <Shield className="w-5 h-5" />
                                                                        Разбанить
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => openBanModal(u.id)}
                                                                        className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center gap-4 transition-colors text-base text-red-400"
                                                                    >
                                                                        <Ban className="w-5 h-5" />
                                                                        Забанить
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('Вы уверены, что хотите удалить этого пользователя? Это действие необратимо.')) {
                                                                            try {
                                                                                await adminApi.deleteUser(u.id);
                                                                                fetchData();
                                                                            } catch (err: any) {
                                                                                console.error(err);
                                                                                alert(err.response?.data?.message || err.response?.data?.error || 'Failed to delete user');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center gap-4 transition-colors text-base text-red-600 hover:text-red-500 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : activeTab === 'applications' ? (
                            <div className="space-y-6 flex-grow flex flex-col overflow-hidden">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                        <Filter className="w-4 h-4" />
                                        <span className="text-sm">Фильтр:</span>
                                    </div>
                                    {['', 'PENDING', 'ACCEPTED', 'REJECTED'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setAppStatusFilter(status)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${appStatusFilter === status
                                                ? 'bg-story-gold text-black shadow-lg shadow-story-gold/20'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {status === '' ? 'Все' : status}
                                        </button>
                                    ))}
                                    <div className="relative flex-grow max-w-sm ml-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Поиск по имени или ID..."
                                            value={appSearch}
                                            onChange={(e) => setAppSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-story-gold/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden shadow-xl flex-grow flex flex-col min-h-0">
                                    <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-white/10">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 text-gray-400 text-sm uppercase">
                                                    <th className="px-6 py-4 font-medium">Кандидат</th>
                                                    <th className="px-6 py-4 font-medium">ID / Дата</th>
                                                    <th className="px-6 py-4 font-medium">Статус</th>
                                                    <th className="px-6 py-4 font-medium text-right text-story-gold uppercase text-[10px] tracking-widest">Детали</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredApplications.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center py-20 text-gray-500">Заявки не найдены</td>
                                                    </tr>
                                                ) : (
                                                    filteredApplications.map(app => (
                                                        <tr
                                                            key={app.id}
                                                            onClick={() => {
                                                                setCurrentApp(app);
                                                                setShowAppModal(true);
                                                                setAdminComment(app.adminComment || '');
                                                            }}
                                                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-white font-bold">{app.firstName} {app.lastName}</span>
                                                                    <span className="text-xs text-gray-500">@{app.user.username}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-400 text-xs font-mono">#{app.id}</span>
                                                                    <span className="text-[10px] text-gray-500">
                                                                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                                    app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                                    }`}>
                                                                    {app.status || 'PENDING'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button className="text-story-gold opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreVertical className="w-5 h-5 ml-auto" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 flex-grow flex flex-col overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">Управление значками</h3>
                                    <button
                                        onClick={() => { setEditingBadge(null); setShowBadgeModal(true); }}
                                        className="bg-story-gold text-black px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        Создать значок
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
                                    {allBadges.map(badge => (
                                        <div key={badge.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div
                                                    className="w-10 h-10 badge-icon bg-black/20 rounded-lg p-1"
                                                    style={{ color: badge.color }}
                                                    dangerouslySetInnerHTML={{ __html: badge.svgIcon }}
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-white truncate">{badge.name}</h4>
                                                    <p className="text-[10px] text-gray-500 font-mono">{badge.color}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setEditingBadge(badge); setShowBadgeModal(true); }}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Удалить значок?')) {
                                                            await adminApi.deleteBadge(badge.id);
                                                            fetchData();
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            </div >

            {/* Create User Modal */}
            {
                showCreateUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fadeIn">
                            <h3 className="text-xl font-bold text-white mb-6">Создать пользователя</h3>

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={createUserForm.username}
                                        onChange={e => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={createUserForm.email}
                                        onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={createUserForm.password}
                                        onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Minecraft Nick</label>
                                        <input
                                            type="text"
                                            value={createUserForm.minecraftNickname}
                                            onChange={e => setCreateUserForm({ ...createUserForm, minecraftNickname: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Discord Nick</label>
                                        <input
                                            type="text"
                                            value={createUserForm.discordNickname}
                                            onChange={e => setCreateUserForm({ ...createUserForm, discordNickname: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                    <select
                                        value={createUserForm.role}
                                        onChange={e => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                    >
                                        <option value="ROLE_USER">User</option>
                                        <option value="ROLE_ADMIN">Admin</option>
                                        <option value="ROLE_MODERATOR">Moderator</option>
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="flex-1 bg-story-gold hover:bg-story-gold-light text-black font-bold py-2 rounded-xl transition-colors">Создать</button>
                                    <button type="button" onClick={() => setShowCreateUserModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors">Отмена</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                showEditUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-white mb-6">Редактировать пользователя</h3>

                            <form onSubmit={handleEditUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={editUserForm.username}
                                        onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={editUserForm.email}
                                        onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Minecraft Nick</label>
                                        <input
                                            type="text"
                                            value={editUserForm.minecraftNickname}
                                            onChange={e => setEditUserForm({ ...editUserForm, minecraftNickname: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Discord Nick</label>
                                        <input
                                            type="text"
                                            value={editUserForm.discordNickname}
                                            onChange={e => setEditUserForm({ ...editUserForm, discordNickname: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                                    <textarea
                                        value={editUserForm.bio}
                                        onChange={e => setEditUserForm({ ...editUserForm, bio: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none h-24 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                    <select
                                        value={editUserForm.role}
                                        onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none"
                                    >
                                        <option value="ROLE_USER">User</option>
                                        <option value="ROLE_ADMIN">Admin</option>
                                        <option value="ROLE_MODERATOR">Moderator</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        id="isPlayer"
                                        checked={editUserForm.isPlayer}
                                        onChange={e => setEditUserForm({ ...editUserForm, isPlayer: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/10 text-story-gold focus:ring-story-gold bg-black/50"
                                    />
                                    <label htmlFor="isPlayer" className="text-sm font-medium text-gray-300 cursor-pointer">
                                        Статус игрока (Whitelist)
                                    </label>
                                </div>

                                <div className="space-y-3 p-3 bg-black/40 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Управление значками</span>
                                    <div className="flex flex-wrap gap-2">
                                        {allBadges.map(badge => {
                                            const hasBadge = users.find(u => u.id === editUserForm.id)?.badges?.some(b => b.id === badge.id);
                                            return (
                                                <button
                                                    key={badge.id}
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            if (hasBadge) {
                                                                await adminApi.removeBadge(editUserForm.id, badge.id);
                                                            } else {
                                                                await adminApi.assignBadge(editUserForm.id, badge.id);
                                                            }
                                                            fetchData();
                                                        } catch (err) {
                                                            console.error(err);
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${hasBadge
                                                        ? 'bg-story-gold/10 border-story-gold/40 text-story-gold shadow-[0_0_15px_rgba(255,191,0,0.1)]'
                                                        : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="w-4 h-4 badge-icon flex-shrink-0" style={{ color: hasBadge ? badge.color : 'inherit' }} dangerouslySetInnerHTML={{ __html: badge.svgIcon }} />
                                                    <span className="truncate">{badge.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="flex-1 bg-story-gold hover:bg-story-gold-light text-black font-bold py-2 rounded-xl transition-colors">Сохранить</button>
                                    <button type="button" onClick={() => setShowEditUserModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors">Отмена</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Ban User Modal */}
            {
                showBanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-fadeIn">
                            <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                                <Ban className="w-6 h-6" /> Заблокировать
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Причина блокировки</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={banReason}
                                        onChange={e => setBanReason(e.target.value)}
                                        className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-xl text-white focus:border-red-500 outline-none"
                                        placeholder="Нарушение правил..."
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleBan} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl transition-colors">Забанить</button>
                                    <button onClick={() => setShowBanModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl transition-colors">Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Application Details Modal */}
            {
                showAppModal && currentApp && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-[1700px] shadow-2xl relative animate-fadeIn my-4 flex flex-col">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                                <div className="flex items-center gap-4">
                                    <div className={`w-1.5 h-8 rounded-full ${currentApp.status === 'ACCEPTED' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' :
                                        currentApp.status === 'REJECTED' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' :
                                            'bg-story-gold shadow-[0_0_20px_rgba(255,191,0,0.2)]'
                                        }`} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${currentApp.status === 'ACCEPTED' ? 'text-green-400 border border-green-500/10 bg-green-500/5' :
                                                currentApp.status === 'REJECTED' ? 'text-red-400 border border-red-500/10 bg-red-500/5' :
                                                    'text-story-gold border border-story-gold/10 bg-story-gold/5'
                                                }`}>
                                                {currentApp.status || 'PENDING'}
                                            </span>
                                            <span className="text-gray-500 text-[11px] font-mono uppercase tracking-widest opacity-60">Application #{currentApp.id}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{currentApp.firstName} {currentApp.lastName}</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAppModal(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-gray-400 hover:text-white group"
                                >
                                    <MoreVertical className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                                    {/* Column 1: Deep Dive Texts */}
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-story-gold/20 rounded-full group-hover:bg-story-gold/50 transition-colors" />
                                            <span className="text-[10px] text-story-gold uppercase font-bold tracking-[0.2em] block mb-1.5 px-2">Почему мы?</span>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                                                <p className="text-gray-200 leading-relaxed text-[15px] break-all">
                                                    {currentApp.whyUs}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-story-gold/20 rounded-full group-hover:bg-story-gold/50 transition-colors" />
                                            <span className="text-[10px] text-story-gold uppercase font-bold tracking-[0.2em] block mb-1.5 px-2">О себе:</span>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                                                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-[15px] break-all">
                                                    {currentApp.additionalInfo}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-story-gold/20 rounded-full group-hover:bg-story-gold/50 transition-colors" />
                                                <span className="text-[10px] text-story-gold uppercase font-bold tracking-[0.2em] block mb-1.5 px-2">Источник:</span>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                                                    <p className="text-gray-200 text-sm">{currentApp.source}</p>
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-story-gold/20 rounded-full group-hover:bg-story-gold/50 transition-colors" />
                                                <span className="text-[10px] text-story-gold uppercase font-bold tracking-[0.2em] block mb-1.5 px-2">Самооценка:</span>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner flex items-center justify-between">
                                                    <span className="text-xl font-bold text-story-gold">{currentApp.selfRating} / 10</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: User Persona */}
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-b from-white/[0.07] to-transparent rounded-2xl p-4 border border-white/10 shadow-2xl space-y-5">
                                            <div>
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] block mb-4 border-b border-white/5 pb-1.5">ПРОФИЛЬ ИГРОКА</span>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="flex flex-col gap-1 p-3 bg-black/40 rounded-xl border border-white/5">
                                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black opacity-60">Ник на сайте:</span>
                                                        <span className="text-story-gold font-bold text-sm">{currentApp.user?.username || '—'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 p-3 bg-black/40 rounded-xl border border-white/5">
                                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black opacity-60">Email:</span>
                                                        <span className="text-white break-all text-sm font-medium">{currentApp.user?.email || '—'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 p-3 bg-black/40 rounded-xl border border-white/5">
                                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black opacity-60">Discord:</span>
                                                        <span className="text-blue-400 font-bold text-sm">{currentApp.user?.discordNickname || '—'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 p-3 bg-black/40 rounded-xl border border-white/5">
                                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black opacity-60">Minecraft:</span>
                                                        <span className="text-green-400 font-bold text-sm">{currentApp.user?.minecraftNickname || '—'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border ${currentApp.makeContent ? 'text-red-500 border-red-500/20 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'text-gray-400 border-white/5 bg-white/5'}`}>
                                                        {currentApp.makeContent ? '🎥 CONTENT CREATOR' : 'STANDARD PLAYER'}
                                                    </span>
                                                </div>
                                                {currentApp.user?.isPlayer && (
                                                    <div className="flex justify-center">
                                                        <span className="px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border border-green-500/20 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                                            ✓ WHITELISTED PLAYER
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: The Verdict & Meta */}
                                    <div className="space-y-4">
                                        <div className="bg-story-gold/[0.03] rounded-2xl p-4 border border-story-gold/20 shadow-[0_0_40px_rgba(255,191,0,0.02)] space-y-4">
                                            <h4 className="text-story-gold font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                                                <Shield className="w-4 h-4 opacity-50" /> VERDICT
                                            </h4>
                                            <textarea
                                                placeholder="Введите ваш вердикт/комментарий..."
                                                value={adminComment}
                                                onChange={(e) => setAdminComment(e.target.value)}
                                                readOnly={currentApp.status && currentApp.status !== 'PENDING'}
                                                className={`w-full h-40 p-4 bg-black/60 border border-white/10 rounded-xl text-base text-white focus:border-story-gold/50 focus:ring-4 focus:ring-story-gold/5 outline-none transition-all resize-none shadow-inner ${currentApp.status && currentApp.status !== 'PENDING' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            />
                                            {(!currentApp.status || currentApp.status === 'PENDING') ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleAppStatus(currentApp.id, 'ACCEPTED')}
                                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3 rounded-xl transition-all shadow-xl shadow-green-900/40 uppercase tracking-widest text-[10px]"
                                                    >
                                                        Принять
                                                    </button>
                                                    <button
                                                        onClick={() => handleAppStatus(currentApp.id, 'REJECTED')}
                                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl transition-all shadow-xl shadow-red-900/40 uppercase tracking-widest text-[10px]"
                                                    >
                                                        Отклонить
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                                                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                                        Action Locked: {currentApp.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 space-y-4 shadow-xl">
                                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] block border-b border-white/5 pb-1.5">METADATA</span>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest opacity-60">Application ID:</span>
                                                        <span className="text-xs text-gray-300 font-mono break-all">#{currentApp.id}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest opacity-60">Internal User ID:</span>
                                                        <span className="text-xs text-gray-300 font-mono break-all">{currentApp.userId || '—'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest opacity-60">Submitted Date:</span>
                                                        <p className="text-xs text-gray-300 font-medium tracking-tight text-white/80">
                                                            {new Date(currentApp.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Security Dossier Modal */}
            {showSecurityDossier && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-5xl w-full shadow-2xl relative animate-fadeIn overflow-hidden flex flex-col max-h-[95vh]">
                        {/* Header */}
                        <div className="p-6 pb-4 flex justify-between items-center border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 shadow-inner">
                                    <Shield className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">Security Dossier</h3>
                                    <p className="text-gray-400 text-sm mt-0.5 font-medium">
                                        User ID: <span className="text-blue-400">#ID-{showSecurityDossier}</span> • <span className="text-white">{users.find(u => u.id === showSecurityDossier)?.username}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSecurityDossier(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-white/5"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/20">
                            {users.find(u => u.id === showSecurityDossier) ? (
                                <div className="space-y-8">
                                    {/* Registration Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-base font-bold text-gray-400 uppercase tracking-widest pl-1">Registration Details</h4>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="bg-neutral-800/40 p-5 rounded-xl border border-white/10 group transition-all hover:bg-neutral-800/60 shadow-lg flex flex-col justify-between">
                                                <span className="text-xs font-semibold text-gray-500 block mb-3 uppercase tracking-wider">Registration IP Address</span>
                                                <div className="flex items-center justify-between gap-4">
                                                    <IPGeoInfo
                                                        ip={users.find(u => u.id === showSecurityDossier)?.registrationIp}
                                                        colorClasses="text-blue-400"
                                                    />
                                                    {users.find(u => u.id === showSecurityDossier)?.registrationIp && (
                                                        <button
                                                            onClick={async () => {
                                                                const rawIp = users.find(u => u.id === showSecurityDossier)?.registrationIp || '';
                                                                const copyVal = rawIp.includes(',') ? rawIp.split(',')[2] : rawIp;
                                                                await navigator.clipboard.writeText(copyVal);
                                                                alert('IP Address Copied');
                                                            }}
                                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all opacity-0 group-hover:opacity-100 hover:text-white border border-white/5"
                                                        >
                                                            <Copy className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-neutral-800/40 p-5 rounded-xl border border-white/10 shadow-lg flex flex-col justify-center">
                                                <span className="text-xs font-semibold text-gray-500 block mb-3 uppercase tracking-wider">Registration Browser Meta</span>
                                                <p className="text-gray-300 text-xs leading-relaxed font-mono opacity-80 break-all bg-black/40 p-4 rounded-xl border border-white/5">
                                                    {users.find(u => u.id === showSecurityDossier)?.registrationUserAgent || 'No data recorded'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Login History Section */}
                                    <div className="space-y-3 border-t border-white/5 pt-6">
                                        <h4 className="text-base font-bold text-gray-400 uppercase tracking-widest pl-1">Recent Login Activity</h4>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="bg-neutral-800/40 p-5 rounded-xl border border-white/10 group transition-all hover:bg-neutral-800/60 shadow-lg">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Session IP</span>
                                                    <span className="text-[10px] font-black bg-green-500/10 text-green-400 px-2.5 py-1 rounded border border-green-500/20 shadow-sm">LOG_01</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 mb-4">
                                                    <IPGeoInfo
                                                        ip={users.find(u => u.id === showSecurityDossier)?.lastLoginIp1}
                                                        colorClasses="text-green-500"
                                                    />
                                                    {users.find(u => u.id === showSecurityDossier)?.lastLoginIp1 && (
                                                        <button
                                                            onClick={async () => {
                                                                const rawIp = users.find(u => u.id === showSecurityDossier)?.lastLoginIp1 || '';
                                                                const copyVal = rawIp.includes(',') ? rawIp.split(',')[2] : rawIp;
                                                                await navigator.clipboard.writeText(copyVal);
                                                                alert('IP Address Copied');
                                                            }}
                                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all opacity-0 group-hover:opacity-100 hover:text-white border border-white/5"
                                                        >
                                                            <Copy className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                                    <p className="text-xs text-gray-500 font-mono break-all leading-relaxed opacity-80">
                                                        {users.find(u => u.id === showSecurityDossier)?.lastLoginUserAgent1 || 'No browser meta detected'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-neutral-800/40 p-5 rounded-xl border border-white/10 group transition-all hover:bg-neutral-800/60 shadow-lg">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Previous Session IP</span>
                                                    <span className="text-[10px] font-black bg-white/10 text-gray-400 px-2.5 py-1 rounded border border-white/10 shadow-sm">LOG_02</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 mb-4">
                                                    <IPGeoInfo
                                                        ip={users.find(u => u.id === showSecurityDossier)?.lastLoginIp2}
                                                        colorClasses="text-gray-400"
                                                    />
                                                    {users.find(u => u.id === showSecurityDossier)?.lastLoginIp2 && (
                                                        <button
                                                            onClick={async () => {
                                                                const rawIp = users.find(u => u.id === showSecurityDossier)?.lastLoginIp2 || '';
                                                                const copyVal = rawIp.includes(',') ? rawIp.split(',')[2] : rawIp;
                                                                await navigator.clipboard.writeText(copyVal);
                                                                alert('IP Address Copied');
                                                            }}
                                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all opacity-0 group-hover:opacity-100 hover:text-white border border-white/5"
                                                        >
                                                            <Copy className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                                    <p className="text-xs text-gray-500 font-mono break-all leading-relaxed opacity-80">
                                                        {users.find(u => u.id === showSecurityDossier)?.lastLoginUserAgent2 || 'No browser meta detected'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="text-5xl font-bold mb-4">🚫</div>
                                    <div className="text-gray-400 font-bold text-lg tracking-widest uppercase">Expunged</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Badge Management Modal */}
            {showBadgeModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-story-gold/20 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fadeIn">
                        <h3 className="text-2xl font-black text-white mb-6 tracking-tight uppercase">
                            {editingBadge ? 'Редактировать значок' : 'Создать новый значок'}
                        </h3>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const data = {
                                name: (form.elements.namedItem('name') as HTMLInputElement).value,
                                color: (form.elements.namedItem('color') as HTMLInputElement).value,
                                svgIcon: (form.elements.namedItem('svgIcon') as HTMLTextAreaElement).value,
                                discordRoleId: (form.elements.namedItem('discordRoleId') as HTMLInputElement).value
                            };

                            try {
                                if (editingBadge) {
                                    await adminApi.updateBadge(editingBadge.id, data);
                                } else {
                                    await adminApi.createBadge(data);
                                }
                                setShowBadgeModal(false);
                                fetchData();
                            } catch (err) {
                                console.error(err);
                                alert('Ошибка при сохранении значка');
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Название</label>
                                <input name="name" defaultValue={editingBadge?.name} required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Цвет (HEX)</label>
                                <input name="color" defaultValue={editingBadge?.color || '#FFBF00'} required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Discord Role ID</label>
                                <input name="discordRoleId" defaultValue={editingBadge?.discordRoleId} className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">SVG Icon (Raw Content)</label>
                                <textarea name="svgIcon" defaultValue={editingBadge?.svgIcon} required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:border-story-gold/50 outline-none font-mono text-xs h-32 resize-none" />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="submit" className="flex-1 bg-story-gold hover:bg-story-gold-light text-black font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs">Сохранить</button>
                                <button type="button" onClick={() => setShowBadgeModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all border border-white/10 uppercase tracking-widest text-xs">Отмена</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout >
    );
};

export default AdminDashboardPage;
