/**
 * Nuvio Provider: Eporner
 * Compatible with Nuvio Hermes runtime
 */
function getStreams(tmdbId, mediaType, season, episode) {
  var query = (typeof tmdbId === 'string' && isNaN(tmdbId)) ? tmdbId : 'popular';
  var apiUrl = 'https://www.eporner.com/api/v2/web/search/?query=' + encodeURIComponent(query) + '&per_page=10&format=json';

  return fetch(apiUrl)
    .then(function(res) {
      if (!res.ok) return [];
      return res.json();
    })
    .then(function(data) {
      if (!data || !data.videos) return [];
      var streams = [];

      data.videos.forEach(function(video) {
        if (video.sources) {
          Object.keys(video.sources).forEach(function(quality) {
            streams.push({
              name: 'Eporner',
              title: video.title + ' (' + quality + ')',
              url: video.sources[quality],
              quality: quality.toUpperCase(),
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
              }
            });
          });
        }
      });

      return streams;
    })
    .catch(function(err) {
      console.error('Eporner fetch error:', err);
      return [];
    });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams: getStreams };
}
