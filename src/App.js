import React, { Component } from 'react';
import './bootstrap.min.css';
import './App.css';
import { times } from 'lodash';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      searchedMovies: [],
      query: ''
    }
    this.dbURL = 'http://localhost:3000';
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.renderMovies = this.renderMovies.bind(this);
  }
  componentDidMount() {
    console.log('App mounted.');
    this.refs.search.focus();
    fetch(this.dbURL)
      .then(response => {
        return response.json()
      })
      .then((json) => {
        this.setState({
          movies: json,
        });
      })
      .catch(err => {
        console.log('Error!', err);
      })
  }
  handleSubmit(e) {
    e.preventDefault();
    let title = this.refs.movieTitle.value;
    let rating = this.refs.movieRating.value;

    if (!title || !rating) {
      console.log('incomplete form');
      return;
    }

    // POST THE NEW MOVIE TO THE DB
    let data = {
      title: title,
      rating: rating
    };

    fetch(this.dbURL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      // SERVER SENDS NEWLY POSTED MOVIE BACK
      return response.json();
    })
    .then((newMovie) => {
      // UPDATE THE VIEW WITH NEW MOVIE
      this.setState({
        movies: [newMovie, ...this.state.movies]
      });
      this.refs.movieForm.reset();
      this.refs.movieTitle.focus();
    })
    .catch(error => console.error('Error: ', error));
  }
  handleDelete(e) {
    let id = e.target.dataset.movieid;
    let data = {
      id: id
    };
    fetch(`${this.dbURL}/delete/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      // SERVER SENDS NEWLY DELETED ID BACK
      return response.json();
    })
    .then((json) => {
      // REMOVE MOVIE FROM APP STATE
      let deletedID = +json.id;
      this.setState({
        movies: this.state.movies.filter(function(movie) {
          return +movie.id !== deletedID
        })
      })
    })
    .catch((error) => {
      console.error('Error!', error);
    })
  }
  handleSearch(e) {
    // First clear the old results and set the query
    this.setState({
      query: e.target.value,
      searchedMovies: []
    }, () => {
      let query = this.state.query.toLowerCase();
      let movies = this.state.movies;
      let searchedMovies = [];

      if (!query) return;

      // Then look through currently loaded movies and find matches to query
      movies.forEach(movie => {
        if (movie.title.toLowerCase().includes(query)) {
          searchedMovies.push(movie);
        }
      })
      // Finally set the resulting movies to display in the view
      this.setState({
        searchedMovies: searchedMovies
      })
    })
  }
  renderMovies() {
    let allMovies = this.state.movies;
    let searchedMovies = this.state.searchedMovies;
    let visibleMovies = searchedMovies.length ? searchedMovies : allMovies;
    let query = this.state.query;

    if (query && !searchedMovies.length) {
      return (
        <div className="movies">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
            <p>No results found.</p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="movies">
          { visibleMovies ? visibleMovies.map((movie, index) => {
            return (
              <div key={index} className="movie card">
                <h5>{movie.title}</h5>
                <p>Rating: {movie.rating}</p>
                <span data-movieid={movie.id} onClick={this.handleDelete} className="delete-key">X</span>
              </div>
            );
          }) : 'Loading...'}
        </div>
      )
    }
  }
  render() {
    return (
      <div className="App">
        <header
          className="mb-5 border-bottom">
          <div className="container">
            <div className="row align-items-center">
              <h1 className="col-3" style={{fontWeight: 200 }}>Your Favorites.</h1>
              <div className="col-4 offset-5 align-items-center">
                <input
                  onChange={this.handleSearch}
                  type="text"
                  value={this.state.query}
                  placeholder="Search movies"
                  ref="search"
                  className="searchbar" />
              </div>
            </div>
          </div>
        </header>
        <div className="container">
          <div className="mb-5">
            <div className="movies">
              { this.renderMovies() }
            </div>
          </div>
          <div>
            <h4
              style={{fontWeight: 200}}
            >Add a new one.</h4>
            <form ref="movieForm" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="movieTitle">Title: </label>
                <input className="form-control" ref="movieTitle" type="text" id="movieTitle" placeholder="Movie title" required/>
              </div>
              <div className="form-group">
                <label htmlFor="movieRating">Rating: </label>
                <select className="form-control" ref="movieRating" id="movieRating" required>
                  { times(5, i => {
                    return <option key={i}>{5 - i}</option>
                  })
                }
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="movieGenre">Genre: </label>
                <input className="form-control" ref="movieGenre" type="text" id="movieGenre" placeholder="Movie genre" required/>
              </div>
              <div className="form-group">
                <label htmlFor="movieYear">Year: </label>
                <select className="form-control" ref="movieYear" id="movieYear" required>
                  { times(2018-1800, i => {
                    return <option key={i}>{2018 - i}</option>
                  })
                }
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
