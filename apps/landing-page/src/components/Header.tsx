import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Code2, Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const langRef = useRef<HTMLDivElement | null>(null);
  const { t, setLanguage, language } = useLanguage();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isLangOpen && langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleAuthClick = (action: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://app.pen2class.ch/';
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200"
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">Pen2Class.ch</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-md">
              {t('navFeatures')}
            </button>
            <button onClick={() => scrollToSection('use-cases')} className="text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-md">
              {t('navUseCases')}
            </button>


            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md" onClick={() => handleAuthClick(t('navStart'))}>
              {t('navStart')}
            </button>
            <div className="relative" ref={langRef}>
              <button
                className="border rounded-md p-2"
                aria-label="language"
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                aria-controls="language-chooser"
                onClick={() => setIsLangOpen((v) => !v)}
              >
                <Globe className="h-[1.2rem] w-[1.2rem]" />
              </button>
              <div
                id={"language-chooser"}
                className={`absolute right-0 mt-2 bg-white border rounded-md shadow-md p-2 ${isLangOpen ? 'block' : 'hidden'}`}
                role="listbox"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                    className="flex justify-between items-center w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                    role="option"
                    aria-selected={language === lang.code}
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="md:hidden text-slate-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4"
          >
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-indigo-600 transition-colors text-left">
                {t('navFeatures')}
              </button>
              <button onClick={() => scrollToSection('use-cases')} className="text-slate-600 hover:text-indigo-600 transition-colors text-left">
                {t('navUseCases')}
              </button>
              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200">
                <button className="w-full justify-start text-left px-4 py-2 rounded hover:bg-slate-100" onClick={() => handleAuthClick(t('navSignIn'))}>
                  {t('navSignIn')}
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full px-4 py-2 rounded" onClick={() => handleAuthClick(t('navStart'))}>
                  {t('navStart')}
                </button>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-500 mb-2">Language</p>
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsMenuOpen(false); }} className="w-full text-left py-2 text-slate-600 flex justify-between items-center">
                    {lang.name}
                    {language === lang.code && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
