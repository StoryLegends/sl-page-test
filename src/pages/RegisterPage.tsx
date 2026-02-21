import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useGoogleReCaptcha } from 'react19-google-recaptcha-v3';
import { useNotification } from '../context/NotificationContext';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [discordNickname, setDiscordNickname] = useState('');
    const [minecraftNickname, setMinecraftNickname] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [error, setError] = useState('');

    const [recaptchaToken, setRecaptchaToken] = useState('');
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!executeRecaptcha) {
            showNotification('ReCAPTCHA не готова', 'error');
            return;
        }

        try {
            const token = await executeRecaptcha('register');
            await register({ username, email, password, discordNickname, minecraftNickname, recaptchaToken: token });
            showNotification('Регистрация успешна! Проверьте ваш email.', 'success');
            navigate('/login');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed.';
            setError(errorMsg);
            showNotification(errorMsg, 'error');
        }
    };

    return (
        <Layout>
            <SEO title="Регистрация" description="Создайте аккаунт на StoryLegends" />
            <div className="min-h-screen flex items-center justify-center px-4 py-20">
                <div className="w-full max-w-md">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-story-gold to-transparent opacity-50" />

                        <h2 className="text-3xl font-bold mb-6 text-center text-white font-minecraft tracking-wider">Регистрация</h2>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">Имя пользователя</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white placeholder-gray-500"
                                    placeholder="Steve"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white placeholder-gray-500"
                                    placeholder="steve@minecraft.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="discord">Discord Tag</label>
                                <input
                                    type="text"
                                    id="discord"
                                    value={discordNickname}
                                    onChange={(e) => setDiscordNickname(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white placeholder-gray-500"
                                    placeholder="user#1234"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="minecraft">Minecraft Nickname</label>
                                <input
                                    type="text"
                                    id="minecraft"
                                    value={minecraftNickname}
                                    onChange={(e) => setMinecraftNickname(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white placeholder-gray-500"
                                    placeholder="Steve"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">Пароль</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-story-gold/50 focus:bg-white/10 transition-colors text-white placeholder-gray-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-story-gold to-story-gold-dark hover:from-story-gold-light hover:to-story-gold text-black font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-story-gold/20 mt-4"
                            >
                                Создать аккаунт
                            </button>

                            <div className="text-[10px] text-gray-500 text-center mt-3">
                                This site is protected by reCAPTCHA and the Google{' '}
                                <a href="https://policies.google.com/privacy" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and{' '}
                                <a href="https://policies.google.com/terms" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
                            </div>
                        </form>

                        <p className="mt-6 text-center text-gray-400 text-sm">
                            Уже есть аккаунт? <a href="/login" className="text-story-gold hover:text-story-gold-light hover:underline transition-colors">Войти</a>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RegisterPage;
