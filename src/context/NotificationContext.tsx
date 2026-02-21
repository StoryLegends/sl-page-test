import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, type, message }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full sm:w-auto">
                <AnimatePresence mode="popLayout">
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            layout
                            className="pointer-events-auto"
                        >
                            <div className={`
                relative overflow-hidden
                flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md
                border border-white/10
                ${n.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                    n.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                        n.type === 'warning' ? 'bg-story-gold/10 text-story-gold' :
                                            'bg-zinc-900/80 text-blue-400'}
              `}>
                                {/* Glow effect */}
                                <div className={`absolute -inset-1 opacity-20 blur-xl rounded-full ${n.type === 'success' ? 'bg-green-500' :
                                        n.type === 'error' ? 'bg-red-500' :
                                            n.type === 'warning' ? 'bg-story-gold' :
                                                'bg-blue-500'
                                    }`} />

                                <div className="flex-shrink-0 mt-0.5">
                                    {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                    {n.type === 'error' && <XCircle className="w-5 h-5" />}
                                    {n.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                                    {n.type === 'info' && <Info className="w-5 h-5" />}
                                </div>

                                <div className="flex-grow min-w-0 pr-6">
                                    <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">
                                        {n.message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => removeNotification(n.id)}
                                    className="flex-shrink-0 hover:opacity-70 transition-opacity ml-auto"
                                >
                                    <X className="w-4 h-4 opacity-50" />
                                </button>

                                {/* Progress bar */}
                                <motion.div
                                    initial={{ scaleX: 1 }}
                                    animate={{ scaleX: 0 }}
                                    transition={{ duration: 5, ease: 'linear' }}
                                    className={`absolute bottom-0 left-0 h-1 origin-left w-full ${n.type === 'success' ? 'bg-green-500/30' :
                                            n.type === 'error' ? 'bg-red-500/30' :
                                                n.type === 'warning' ? 'bg-story-gold/30' :
                                                    'bg-blue-500/30'
                                        }`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
