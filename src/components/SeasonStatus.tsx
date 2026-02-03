
import { serverStatus } from '../config/serverStatus';
import { PlayCircle, Lock, Megaphone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusConfig = {
    active: {
        icon: PlayCircle,
        header: "Сезон активен!",
        color: "text-green-400",
        bg: "from-green-500/20",
        border: "border-green-500/30",
        badge: "bg-green-500/10 text-green-300"
    },
    closed: {
        icon: Lock,
        header: "Сервер закрыт",
        color: "text-red-400",
        bg: "from-red-500/20",
        border: "border-red-500/30",
        badge: "bg-red-500/10 text-red-300"
    },
    announced: {
        icon: Megaphone,
        header: "Сезон анонсирован!",
        color: "text-blue-400",
        bg: "from-blue-500/20",
        border: "border-blue-500/30",
        badge: "bg-blue-500/10 text-blue-300"
    },
    soon: {
        icon: Clock,
        header: "Скоро открытие!",
        color: "text-yellow-400",
        bg: "from-yellow-500/20",
        border: "border-yellow-500/30",
        badge: "bg-yellow-500/10 text-yellow-300"
    }
};

const SeasonStatus = () => {
    const { status, title, description, date } = serverStatus;
    const config = StatusConfig[status];
    const Icon = config.icon;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-24 relative z-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full"
            >
                <div className={`relative overflow-hidden rounded-3xl border ${config.border} bg-black/40 backdrop-blur-md group hover:bg-black/50 transition-colors duration-500`}>
                    {/* Dynamic Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.bg} via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />

                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Huge Icon / Graphic */}
                        <div className={`p-6 rounded-full ${config.badge} backdrop-blur-sm border ${config.border} shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className={`w-12 h-12 md:w-16 md:h-16 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 mb-4 justify-center md:justify-start">
                                <span className={`text-sm md:text-base font-bold uppercase tracking-wider px-4 py-1.5 rounded-full ${config.badge} border ${config.border}`}>
                                    {config.header}
                                </span>
                                {date && (
                                    <span className="text-gray-400 text-sm font-mono flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                        {date}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight font-minecraft">
                                {title}
                            </h2>
                            <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-2xl">
                                {description}
                            </p>
                        </div>

                        {/* Decorative Particles for "active" state maybe? or just abstract glow */}
                        <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-b ${config.bg} to-transparent rounded-full blur-[80px] pointer-events-none opacity-50`} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SeasonStatus;
