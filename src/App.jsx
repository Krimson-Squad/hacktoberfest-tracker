import React, { Component } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import horizontalImage from '/horizontal_black.png'; 

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      pullRequests: [],
      loading: false,
      error: "",
      showError: false,
    };
  }

  fetchPullRequests = async () => {
    const { username } = this.state;

    if (!username) {
      this.setState({ pullRequests: [] });
      return;
    }

    this.setState({ loading: true, error: "" });

    try {
      const { data } = await axios.get(
        `https://api.github.com/search/issues?q=author:${username}+is:pr+created:2024-09-30T00:00:00..2024-11-07T23:59:59`
      );
      this.setState({ pullRequests: data.items });
    } catch (err) {
      this.setState({ error: "Error fetching pull requests. Please try again.", showError: true });
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

  render() {
    const { username, pullRequests, loading, error, showError } = this.state;
    const pullRequestCount = pullRequests.length;

    return (
      <div className="container text-center my-5">
        <img 
          src={horizontalImage} 
          alt="Horizontal Black" 
          className="img-fluid mb-4"
          style={{ maxWidth: "100%", height: "auto" }} 
        />
        
        <h2>Hacktoberfest Progress Tracker</h2>
        <div className="mb-4">
          <div className="row justify-content-center">
            <div className="col-xs-8 col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Enter GitHub username"
                value={username}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="col-xs-4 col-md-2">
              <button 
                className="btn btn-primary"
                onClick={this.fetchPullRequests}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {loading && <div className="spinner-border" role="status"><span className="sr-only"></span></div>}

        {showError && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="close" onClick={this.handleCloseError} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}

        <div className="mb-4">
          <h5>
            Progress: 
            {pullRequestCount === 0 && <span> No pull requests made yet.</span>}
            {pullRequestCount > 0 && pullRequestCount <= 4 && (
              <span> {pullRequestCount} pull request{pullRequestCount > 1 ? 's' : ''} made!</span>
            )}
            {pullRequestCount > 4 && <span> {pullRequestCount} pull requests made! Awesome job!</span>}
          </h5>
        </div>

        <div className="row justify-content-center">
          {pullRequests.length > 0 ? (
            pullRequests.map((pr) => (
              <div className="col-xs-12 col-sm-6 col-md-4 mb-3" key={pr.id}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">
                      <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
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
    );
  }
}

export default App;
