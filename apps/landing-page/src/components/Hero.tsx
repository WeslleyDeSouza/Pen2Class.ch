import React from 'react';
import { motion } from 'framer-motion';
import { Play, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  const handleCTAClick = (action: string) => {
    alert("🚧 Action: This feature isn't implemented yet—but you can request it! 🚀");
  };

  return (
    <section className="py-20 md:py-32 px-6 bg-slate-50">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-slate-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('heroTitle1')}
            <span className="text-indigo-600"> {t('heroTitle2')}</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-3 h-auto rounded-md inline-flex items-center justify-center"
              onClick={() => handleCTAClick('start-coding')}
            >
              <Play className="w-5 h-5 mr-2" />
              {t('heroCta1')}
            </button>
            <button
              className="border text-lg px-8 py-3 h-auto rounded-md inline-flex items-center justify-center"
              onClick={() => handleCTAClick('learn-more')}
            >
              <Users className="w-5 h-5 mr-2" />
              {t('heroCta2')}
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative max-w-5xl mx-auto mt-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="relative shadow-2xl rounded-xl">
            <div className="aspect-video bg-slate-200 rounded-xl border border-slate-300 p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-grow bg-white rounded-md p-4 text-left text-sm font-mono text-slate-700 overflow-hidden">
                <span className="text-blue-600">const</span> <span className="text-purple-600">greet</span> = (<span className="text-orange-500">name</span>) =&gt; {'{'}<br/>
                &nbsp;&nbsp;<span className="text-blue-600">return</span>{' '}<span className="text-green-600">&#96;</span>{t('heroCodeExample1')}, <span className="text-orange-500">${'{' }name{ '}'}</span>!<span className="text-green-600">&#96;</span>;<br/>
                {'}'};<br/><br/>
                <span className="text-purple-600">console</span>.<span className="text-yellow-500">log</span>(<span className="text-purple-600">greet</span>(<span className="text-green-600">'{t('heroCodeExample2')}'</span>));
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 -left-4 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
