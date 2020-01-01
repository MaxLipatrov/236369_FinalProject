import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Navbar from './Component/Navbar'
import Landing from './Component/Landing'
import Login from './Component/Login'
import Register from './Component/Register'
import Profile from './Component/Profile'
import {Redirect} from "react-router-dom";


function isLoggedIn() {
  return !!localStorage.usertoken;
}

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/register" render={(props) => (
                !isLoggedIn() ? (
                    <Register {...props} />) : (<Redirect to="http://127.0.0.1:5000/profile"/> )
            )}/>
            <Route exact path="http://127.0.0.1:5000/login" render={(props) => (
                !isLoggedIn() ? (
                    <Login {...props} />) : (<Redirect to="/profile"/> )
            )}/>
             <Route exact path="/users/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props} />) : (<Redirect to="/login"/> )
            )}/>
            <Route exact path="http://127.0.0.1:5000/profile/:id" render={(props) => (
                isLoggedIn() ? (
                    <Profile {...props} />) : (<Redirect to="/login"/> )
            )}/>

          </div>
        </div>
      </Router>
    )
  }
}


export default App;
