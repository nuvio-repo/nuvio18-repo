const WORKING_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  return new Promise(function(resolve) {
    var query = (typeof tmdbId === 'string' && isNaN(tmdbId)) ? tmdbId : 'popular';
    var apiUrl = 'https://www.eporner.com/api/v2/web/search/?query=' + encodeURIComponent(query) + '&per_page=10&format=json';

    fetch(apiUrl)
      .then(function(res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function(data) {
        if (!data || !data.videos) {
          resolve([]);
          return;
        }
        var streams = [];
        data.videos.forEach(function(video) {
          if (video.sources) {
            Object.keys(video.sources).forEach(function(quality) {
              streams.push({
                name: 'Eporner - ' + quality.toUpperCase(),
                title: video.title,
                url: video.sources[quality],
                quality: quality.toUpperCase(),
                size: 'Unknown',
                headers: WORKING_HEADERS,
                provider: 'eporner'
              });
            });
          }
        });
        resolve(streams);
      })
      .catch(function() {
        resolve([]);
      });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams: getStreams };
} else {
  global.getStreams = getStreams;
}
