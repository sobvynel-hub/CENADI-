import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  console.log('✅ Layout rendu avec children:', !!children);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}