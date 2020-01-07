const rp = require('request-promise-native');
const mongoose = require('mongoose');

const Movie = mongoose.model('Movie');
const Category = mongoose.model('Category');

const API_KEY = '0df993c66c0c636e29ecbb5344252a4a';

async function fetchMovie(item) {
  //const db_url = `https://api.douban.com/v2/movie/${item.doubanId}?apikey=${API_KEY}`; 
  const db_url = `https://api.douban.com/v2/movie/subject/${item.doubanId}?apikey=${API_KEY}`; 
  const res = await rp(db_url);
  let body;

  try {
    body = JSON.parse(res);
  } catch(err) {
    console.log(err);
  }

  return body;
}

(async () => {
  let movies = await Movie.find({
    $or: [
      { summary: { $exists: false } },
      { summary: null },
      { summary: '' },
      { title: '' }
    ]
  });

  movies.map(async movie => {
    let movieData = await fetchMovie(movie);

    if (movieData) {
      movie.tags = movieData.tags || [];
      movie.summary = movieData.summary || '';
      movie.title = movieData.alt_title || movieData.title;
      movie.rawTitle = movieData.original_title || movieData.title;
      movie.year = movieData.year || '';
      movie.movieTypes = movieData.genres || [];

      for (var i = 0; i < movie.movieTypes.length; i++) {
        let item = movie.movieTypes[i];

        let cate = await Category.findOne({
          name: item
        });

        if (!cate) {
          cate = new Category({
            name: item,
            movies: [movie._id]
          })
        } else {
          if (cate.movies.indexOf(movie._id) === -1) {
            cate.movies.push(movie._id);
          }
        }
        await cate.save();

        if (!movie.category) {
          movie.category.push(cate._id);
        } else {
          if (movie.category.indexOf(cate._id) === -1) {
            movie.category.push(cate._id);
          }
        }
      }

      let dates = movieData.pubdates || [];
      let pubdates = [];
      dates.map(item => {
        if (item && item.split('(').length > 0) {
          let parts = item.split('(');
          let date = parts[0];
          let country = '未知';

          if (parts[1]) {
            country = parts[1].split(')')[0];
          }

          pubdates.push({
            date: new Date(date),
            country
          });
        }
      });
      movie.pubdate = pubdates;

      await movie.save();
    }

  });

})();
