import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Github, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const handleFooterClick = (_action: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://app.pen2class.ch/';
    }
  };

  return (
    <footer className="py-16 px-6 bg-slate-100 border-t border-slate-200">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('footerTitle')}
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
            {t('footerSubtitle')}
          </p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-3 h-auto rounded-md"
            onClick={() => handleFooterClick('get-started')}>
            {t('footerCta')}
          </button>
        </motion.div>

        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">Pen2Class.ch</span>
          </div>
          <div className="text-slate-500 text-sm mb-4 sm:mb-0">
            <p className="sm:mb-0">
              {t('footerCopyright')}
            </p>
            <small className="sm:mb-0">
              {t('footerMvpNote')}
            </small>
          </div>
          <div className="flex space-x-4">
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
