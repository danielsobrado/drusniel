module.exports = async ({ data, language }) => {
  if (!data) return;

  const items = data.allArticleCategory.nodes;

  const texts = {
    en: {
      title: 'Regions',
    },
    es: {
      title: 'Regiones',
    },
  };

  const { title } = texts[language];

  return items ? { title, items } : null;
};