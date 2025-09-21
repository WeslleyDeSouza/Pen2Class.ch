import React from 'react';
import { Helmet } from 'react-helmet';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import UseCases from './components/UseCases';
import Footer from './components/Footer';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('metaTitle')}</title>
        <meta name="description" content={t('metaDescription')} />
      </Helmet>
      <div className="min-h-screen bg-white text-slate-800">
        <Header />
        <main>
          <Hero />
          <section id="features">
            <Features />
          </section>
          <section id="use-cases">
            <UseCases />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
