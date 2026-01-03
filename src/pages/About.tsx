import Layout from '../components/Layout';
import { Users, Video, Trophy, Heart, Crown, Code, Shield, Megaphone } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-story-gold/20 blur-[100px] rounded-full -z-10" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-story-gold via-white to-legends-blue bg-clip-text text-transparent drop-shadow-lg">
            О сервере
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            StoryLegends — это приватный Minecraft сервер выживания, где создаются истории и легенды.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Gallery Grid (Replacing Living World Card) */}
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-lg h-48 md:h-auto">
              <img src="https://lh3.googleusercontent.com/sitesv/AAzXCkf0jtvw6YodxUoGqJcS46pP0pAbFLA0sFdioJRnpHTSYGKVnD04UxBYXc4iCTpDF_D0qngVCuoyRC_9VWzr_My1ndJwbRPF-y2Ysk1f4Pf2lH-lgB2cqi0Ya9c9DBJbBGNBft0ujddMDswE2wA9xzwfji2glG6RhzBKKcpQD4qKAxm2amKPOOL4=w16383" alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-lg h-48 md:h-auto">
              {/* Using placeholder or archive images if available. Since I don't have the exact URLs for unnamed(2).png etc, I'll use placeholders or re-use the main one for now but with different crops/filters to simulate gallery, or just leave as is if I can't access local files easily in img src without import. 
                    Actually, I can't easily reference local files without moving them to public. 
                    I will use the main image again for now but styled as a gallery collage to represent "Living World".
                */}
              <div className="absolute inset-0 bg-legends-blue/20 z-10" />
              <img src="https://lh3.googleusercontent.com/sitesv/AAzXCkf0jtvw6YodxUoGqJcS46pP0pAbFLA0sFdioJRnpHTSYGKVnD04UxBYXc4iCTpDF_D0qngVCuoyRC_9VWzr_My1ndJwbRPF-y2Ysk1f4Pf2lH-lgB2cqi0Ya9c9DBJbBGNBft0ujddMDswE2wA9xzwfji2glG6RhzBKKcpQD4qKAxm2amKPOOL4=w16383" alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-lg h-48 md:h-auto col-span-2">
              <div className="absolute inset-0 bg-story-gold/10 z-10" />
              <img src="https://lh3.googleusercontent.com/sitesv/AAzXCkf0jtvw6YodxUoGqJcS46pP0pAbFLA0sFdioJRnpHTSYGKVnD04UxBYXc4iCTpDF_D0qngVCuoyRC_9VWzr_My1ndJwbRPF-y2Ysk1f4Pf2lH-lgB2cqi0Ya9c9DBJbBGNBft0ujddMDswE2wA9xzwfji2glG6RhzBKKcpQD4qKAxm2amKPOOL4=w16383" alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                <h3 className="text-xl font-bold text-white">Галерея сервера</h3>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
              <Video className="w-10 h-10 text-story-gold mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Для контент-мейкеров</h3>
              <p className="text-gray-400">На данном сервере вы можете снимать ролики и просто играть! Мы поддерживаем творчество.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
              <Trophy className="w-10 h-10 text-legends-blue mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Путь к успеху</h3>
              <p className="text-gray-400">Активные игроки попадают в следующие сезоны. Ваша активность — ключ к развитию сервера!</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
              <Users className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Сообщество</h3>
              <p className="text-gray-400">У нас играли немалые ютуберы. Присоединяйтесь к дружному комьюнити!</p>
            </div>
          </div>
        </div>

        {/* Administration Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Состав администрации</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* LendSpele */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 backdrop-blur-sm text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-purple-400 mb-1">LendSpele</h3>
              <p className="text-white font-semibold text-sm mb-2">Владелец и Тех. Админ</p>
              <p className="text-gray-400 text-xs mb-3">Ему нужно присылать заявки.</p>
              <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-mono">
                lendspele_
              </div>
            </div>

            {/* datapeice */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-black border border-red-500/30 backdrop-blur-sm text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-1">datapeice</h3>
              <p className="text-white font-semibold text-sm mb-2">Разработчик</p>
              <p className="text-gray-400 text-xs mb-3">Тоже довольно важная персонa.</p>
              <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-mono">
                datapeice
              </div>
            </div>

            {/* tybick */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-black border border-green-500/30 backdrop-blur-sm text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-1">tybick</h3>
              <p className="text-white font-semibold text-sm mb-2">Модератор</p>
              <p className="text-gray-400 text-xs mb-3">Помогает разбирать заявки.</p>
              <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-xs font-mono">
                ananasnmg22
              </div>
            </div>

            {/* Slides_GG */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/30 backdrop-blur-sm text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Megaphone className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-1">Slides_GG</h3>
              <p className="text-white font-semibold text-sm mb-2">Рекламный менеджер</p>
              <p className="text-gray-400 text-xs mb-3">Отвечает за продвижение.</p>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-mono">
                slides_1
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-story-gold to-transparent opacity-50" />

          <Heart className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse-slow" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ждем вас на сервере!</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Всё, что вам нужно сделать — это заполнить заявку. Администрация рассмотрит её и свяжется с вами.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <a
              href="https://discord.com/invite/2RxxMnr6X9"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg hover:shadow-[#5865F2]/50 flex items-center gap-3"
            >
              <img src="/images/discord-icon.png" alt="Discord" className="w-6 h-6" />
              Присоединиться к Discord
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
