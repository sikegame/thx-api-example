import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginPage from './examples/Login'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <LoginPage />
        </header>
      </div>
    );
  }
}

export default App;
