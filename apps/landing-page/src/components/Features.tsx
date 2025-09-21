import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Eye, Users, Terminal, Smartphone, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Features: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Users, title: t('feature1Title'), description: t('feature1Desc'), color: 'text-indigo-500' },
    { icon: Eye, title: t('feature2Title'), description: t('feature2Desc'), color: 'text-blue-500' },
    { icon: Code2, title: t('feature3Title'), description: t('feature3Desc'), color: 'text-pink-500' },
    { icon: Terminal, title: t('feature4Title'), description: t('feature4Desc'), color: 'text-green-500' },
    { icon: Zap, title: t('feature5Title'), description: t('feature5Desc'), color: 'text-yellow-500' },
    { icon: Smartphone, title: t('feature6Title'), description: t('feature6Desc'), color: 'text-purple-500' },
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">{t('featuresTag')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            {t('featuresTitle')}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t('featuresSubtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-left p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
