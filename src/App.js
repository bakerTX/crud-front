import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: []
    }
    this.dbURL = 'http://localhost:3000';
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }
  componentDidMount() {
    console.log('App mounted.');
    this.refs.movieTitle.focus();
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
  render() {
    let movies = this.state.movies;
    return (
      <div className="App">
        <div className="container--movies">
          <p>Movies:</p>
          <div className="movies">
            { movies ? movies.map((movie, index) => {
              return (
                <div key={index} className="movie">
                  <p>Title: {movie.title}</p>
                  <p>Rating: {movie.rating}</p>
                  <span data-movieid={movie.id} onClick={this.handleDelete} className="delete-key">X</span>
                </div>
              );
            }) : 'Loading...'}
          </div>
        </div>
        <div className="container--new-movie">
          <p>New movie:</p>
          <form ref="movieForm" onSubmit={this.handleSubmit}>
            <div>
              <label htmlFor="movieTitle">Title: </label>
              <input ref="movieTitle" type="text" id="movieTitle" placeholder="Movie title" required/>
            </div>
            <div>
              <label htmlFor="movieRating">Rating: </label>
              <input ref="movieRating" type="number" id="movieRating" placeholder="Movie rating" required/>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
