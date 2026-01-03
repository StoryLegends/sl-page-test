import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Background from './Background';
import Footer from './Footer';
import SeasonalEffects from './SeasonalEffects';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen text-white selection:bg-yellow-500/30 relative">
      <Background />
      <SeasonalEffects />
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
