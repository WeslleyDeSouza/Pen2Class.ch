import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const UseCases: React.FC = () => {
  const { t } = useLanguage();

  const useCases = [
    { icon: GraduationCap, title: t('useCase1Title'), description: t('useCase1Desc') },
    { icon: Users, title: t('useCase2Title'), description: t('useCase2Desc') },
    { icon: Briefcase, title: t('useCase3Title'), description: t('useCase3Desc') },
  ];

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">{t('useCasesTag')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            {t('useCasesTitle')}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t('useCasesSubtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <useCase.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {useCase.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
