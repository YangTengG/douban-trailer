const rp = require('request-promise-native');

const API_KEY = '0df993c66c0c636e29ecbb5344252a4a';

async function fetchMovie(item) {
  const db_url = `https://api.douban.com/v2/movie/subject/${item.doubanId}?apikey=${API_KEY}`; 
  const res = await rp(db_url);
  return res;
}

(async () => {
  let movies = [
    { 
      doubanId: 3168101,
      title: '毒液：致命守护者',
      rate: 7.2,
      poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2537158013.jpg'
    },
    {
      doubanId: 3011091,
      title: '忠犬八公的故事',
      rate: 9.3,
      poster: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p524964016.jpg'
    }
  ];

  movies.map(async movie => {
    let movieData = await fetchMovie(movie);

    try {
      movieData = JSON.parse(movieData);

      console.log(movieData.tags);
      console.log(movieData.summary);
    } catch(err) {
      console.log(err);
    }
  });

})();
