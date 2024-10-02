import React, { Component } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import horizontalImage from '/horizontal_black.png'; 
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css'; // Import custom styles

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      pullRequests: [],
      loading: false,
      error: "",
      showError: false,
      darkMode: false,
      avatarUrl: "",
    };
  }

  componentDidMount() {
    // Set initial theme based on saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setState({ darkMode: true });
      document.body.classList.add('bg-dark', 'text-white');
    } else {
      document.body.classList.add('bg-light', 'text-dark');
    }
  }

  fetchPullRequests = async () => {
    const { username } = this.state;

    if (!username) {
      this.setState({ pullRequests: [], avatarUrl: "" });
      return;
    }

    this.setState({ loading: true, error: "" });

    try {
      // Fetch user's GitHub information to get the avatar
      const userResponse = await axios.get(`https://api.github.com/users/${username}`);
      this.setState({ avatarUrl: userResponse.data.avatar_url });

      // Fetch pull requests
      const { data } = await axios.get(
        `https://api.github.com/search/issues?q=author:${username}+is:pr+created:2024-09-30T00:00:00..2024-11-07T23:59:59`
      );
      this.setState({ pullRequests: data.items });
    } catch (err) {
      this.setState({ error: "Error fetching data. Please try again.", showError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleInputChange = (e) => {
    this.setState({ username: e.target.value }, () => {
      clearTimeout(this.fetchTimeout);
      this.fetchTimeout = setTimeout(this.fetchPullRequests, 500);
    });
  };

  handleCloseError = () => {
    this.setState({ showError: false });
  };

  toggleDarkMode = () => {
    this.setState((prevState) => {
      const newDarkMode = !prevState.darkMode;
      // Save theme preference to local storage
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

      // Toggle body classes based on the new theme
      if (newDarkMode) {
        document.body.classList.remove('bg-light', 'text-dark');
        document.body.classList.add('bg-dark', 'text-white');
      } else {
        document.body.classList.remove('bg-dark', 'text-white');
        document.body.classList.add('bg-light', 'text-dark');
      }

      return { darkMode: newDarkMode };
    });
  };

  render() {
    const { username, pullRequests, loading, error, showError, darkMode, avatarUrl } = this.state;
    const pullRequestCount = pullRequests.length;

    return (
      <Router basename="/">
        <div className={`container text-center my-5`}>
          {/* Dark/Light Mode Toggle */}
          <button 
            className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} mb-4`}
            onClick={this.toggleDarkMode}
          >
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>

          {/* Image Section */}
          <img 
            src={horizontalImage} 
            alt="Horizontal Black" 
            className="img-fluid mb-4"
            style={{ maxWidth: "100%", height: "auto" }} 
          />

          {/* Title Section */}
          <h2 className="mb-4">Hacktoberfest Progress Tracker</h2>

          {/* Search Section */}
          <div className="row justify-content-center mb-4">
            <div className="col-xs-8 col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter GitHub username"
                value={username}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="col-xs-4 col-md-2 mb-3">
              <button 
                className="btn btn-primary w-100"
                onClick={this.fetchPullRequests}
              >
                Search
              </button>
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && <div className="spinner-border mb-4" role="status"><span className="sr-only"></span></div>}

          {/* Error Message */}
          {showError && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="close" onClick={this.handleCloseError} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          )}

          {/* User Avatar Section */}
          {avatarUrl && (
            <div className="d-flex align-items-center justify-content-center mb-4">
              <img 
                src={avatarUrl} 
                alt="User Avatar" 
                className="rounded-circle me-3" 
                style={{ width: '80px', height: '80px' }}
              />
              <h5>
                Progress: 
                {pullRequestCount === 0 && <span> No pull requests made yet.</span>}
                {pullRequestCount > 0 && pullRequestCount <= 4 && (
                  <span> {pullRequestCount} pull request{pullRequestCount > 1 ? 's' : ''} made!</span>
                )}
                {pullRequestCount > 4 && <span> {pullRequestCount} pull requests made! Awesome job!</span>}
              </h5>
            </div>
          )}

          {/* Pull Request Cards */}
          <div className="row justify-content-center">
            {pullRequests.length > 0 ? (
              pullRequests.map((pr) => (
                <div className="col-xs-12 col-sm-6 col-md-4 mb-3" key={pr.id}>
                  <div className={`card ${darkMode ? 'bg-secondary text-white' : 'bg-white'}`}>
                    <div className="card-body">
                      <h5 className="card-title">
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className={darkMode ? 'text-light' : 'text-dark'}>
                          {pr.title}
                        </a>
                      </h5>
                      <p className="card-text">
                        <small className="text-muted">
                          Repository: {pr.repository_url.split("/").pop()}<br />
                          Created at: {new Date(pr.created_at).toLocaleDateString()}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              !loading && username && (
                <div className="col-xs-12">
                  <h5>No pull requests found for {username} during Hacktoberfest.</h5>
                </div>
              )
            )}
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
