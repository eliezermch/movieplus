import { API_KEY } from "./secrets.js";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  params: {
    api_key: API_KEY,
  },
});

// Utils

const lazyLoader = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const url = entry.target.getAttribute("data-img");
      entry.target.setAttribute("src", url);
    }
  });
});

const createMovies = (
  movies,
  container,
  { lazyLoad = false, clean = true } = {}
) => {
  if (clean) {
    container.innerHTML = "";
  }

  movies.forEach((movie) => {
    const movieContainer = document.createElement("div");
    movieContainer.classList.add("movie-container", "item");
    movieContainer.addEventListener("click", () => {
      location.hash = `#movie=${movie.id}`;
    });

    const movieImg = document.createElement("img");
    movieImg.classList.add("movie-img");
    movieImg.setAttribute("alt", movie.title);
    movieImg.setAttribute(
      lazyLoad ? "data-img" : "src",
      `https://image.tmdb.org/t/p/w300/${movie.poster_path}`
    );
    movieImg.addEventListener("error", () => {
      movieImg.setAttribute(
        "src",
        "https://static.platzi.com/static/images/error/img404.png"
      );
    });

    // const movieBtn = document.createElement("button");
    // movieBtn.classList.add("movie-btn");
    // movieBtn.addEventListener("click", () => {
    //   movieBtn.classList.toggle("movie-btn--liked");
    // })

    if (lazyLoad) {
      lazyLoader.observe(movieImg);
    }

    movieContainer.appendChild(movieImg);
    // movieContainer.appendChild(movieBtn);
    container.appendChild(movieContainer);
  });
};

const createCategories = (categories, container) => {
  container.innerHTML = "";

  categories.forEach((category) => {
    const categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category-container");

    const categoryTitle = document.createElement("h3");
    categoryTitle.classList.add("category-title");
    categoryTitle.setAttribute("id", `id${category.id}`);
    categoryTitle.addEventListener("click", () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTilteText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTilteText);

    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
};

// API Calls

const getTrendingMoviesPreview = async () => {
  try {
    const { data } = await api(`/trending/movie/day`);
    const movies = data.results;

    createMovies(movies, trendingMoviesPreviewList, { lazyLoad: true });
  } catch (err) {
    console.log(err);
  }
};

const getCategoriesPreview = async () => {
  try {
    const { data } = await api("/genre/movie/list");
    const categories = data.genres;

    createCategories(categories, categoriesPreviewList);
  } catch (err) {
    console.log(err);
  }
};

const getMoviesByCategory = async (id) => {
  try {
    const { data } = await api(`/discover/movie`, {
      params: {
        with_genres: id,
      },
    });
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection, { lazyLoad: true });
  } catch (err) {
    console.log(err);
  }
};

function getPaginatedMoviesByCategory(id) {
  return async function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 200;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      try {
        page++;
        const { data } = await api(`/discover/movie`, {
          params: {
            with_genres: id,
            page,
          },
        });
        const movies = data.results;

        createMovies(movies, genericSection, { lazyLoad: true, clean: false });
      } catch (err) {
        console.log(err);
      }
    }
  };
}

const getMoviesBySearch = async (query) => {
  try {
    const { data } = await api(`/search/movie`, {
      params: {
        query,
      },
    });
    const movies = data.results;
    maxPage = data.total_pages;
    console.log(maxPage);

    createMovies(movies, genericSection);
  } catch (err) {
    console.log(err);
  }
};

function getPaginatedMoviesBySearch(query) {
  return async function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 200;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      try {
        page++;
        const { data } = await api(`/search/movie`, {
          params: {
            query,
            page,
          },
        });
        const movies = data.results;

        createMovies(movies, genericSection, { lazyLoad: true, clean: false });
      } catch (err) {
        console.log(err);
      }
    }
  };
}

const getTrendingMovies = async () => {
  try {
    const { data } = await api(`/trending/movie/day`);
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection, { lazyLoad: true, clean: true });
  } catch (err) {
    console.log(err);
  }
};

let maxPage;
let page = 1;

window.addEventListener("scroll", () => getPaginatedTrendingMovies());

const getPaginatedTrendingMovies = async () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 200;
  const pageIsNotMax = page < maxPage;

  if (scrollIsBottom && pageIsNotMax) {
    try {
      page++;
      const { data } = await api(`/trending/movie/day`, {
        params: {
          page,
        },
      });
      const movies = data.results;

      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    } catch (err) {
      console.log(err);
    }
  }
};

const getMovieById = async (id) => {
  try {
    const { data: movie } = await api(`/movie/${id}`);

    const movieImgUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
    `;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategories(movie.genres, movieDetailCategoriesList);

    getRelatedMoviesId(id);
  } catch (err) {
    console.log(err);
  }
};

const getRelatedMoviesId = async (id) => {
  const { data } = await api(`/movie/${id}/similar`); // could be => `/movie/${id}/recommendations`
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
};

export {
  getTrendingMoviesPreview,
  getCategoriesPreview,
  getMoviesByCategory,
  getMoviesBySearch,
  getTrendingMovies,
  getMovieById,
  getPaginatedTrendingMovies,
  getPaginatedMoviesBySearch,
  getPaginatedMoviesByCategory,
};
