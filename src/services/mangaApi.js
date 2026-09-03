const BASE_URL = '/api/mangadex';

export const fetchPopularManga = async (searchQuery = '') => {
  try {
    const titleParam = searchQuery ? `&title=${encodeURIComponent(searchQuery)}` : '';

    const response = await fetch(
      `${BASE_URL}/manga?limit=20&includes[]=cover_art&contentRating[]=safe${titleParam}`
    );

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();

    return data.data.map((item) => {
      const coverRel = item.relationships?.find((r) => r.type === 'cover_art');
      const coverFileName = coverRel?.attributes?.fileName;

      // إذا ماكانش اسم ملف الغلاف أو كان هو البلايسهولدر المعروف، نعتبره غير موجود
      const isPlaceholder = !coverFileName || coverFileName.includes('placeholder');

      const rawCoverUrl = (!isPlaceholder && coverFileName)
        ? `https://uploads.mangadex.org/covers/${item.id}/${coverFileName}.256.jpg`
        : null;

      // نمرو من البروكسي ديالنا (api/cover.js) بدل wsrv.nl
      // باش نتحكمو فـ Referer header ونتفاداو صورة "You can read this at: MANGADEX"
      const cover = rawCoverUrl
        ? `/api/cover?url=${encodeURIComponent(rawCoverUrl)}`
        : null;

      return {
        id: item.id,
        title: item.attributes.title.en || Object.values(item.attributes.title)[0] || 'Unknown Title',
        description: item.attributes.description?.en || 'No description available.',
        status: item.attributes.status?.toUpperCase() || 'ONGOING',
        cover,
        genres: item.attributes.tags
          ?.filter((tag) => tag.attributes.group === 'genre')
          .map((tag) => tag.attributes.name.en) || ['MANGA']
      };
    });
  } catch (error) {
    console.error("Error fetching manga:", error);
    return [];
  }
};