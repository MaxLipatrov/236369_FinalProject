import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'

import Navbar from './Component/Navbar'
import Landing from './Component/Landing'
import Login from './Component/Login'
import Register from './Component/Register'
import Profile from './Component/Profile'
import {Redirect} from "react-router-dom";
import {ViewPost} from "./Component/ViewPost";
import {SearchTravels} from "./Component/SearchTravels";


function isLoggedIn() {
    return !!localStorage.usertoken;

}


class App extends Component {
    render() {
        return (
            <Router>
                <div className="App">
                    <Navbar/>
                    <Route exact path="/" render={(props) => {
                        return <Landing {...props} />
                    }}/>
                    <div className="container">
                        <Route exact path="/register" render={(props) => (
                            !isLoggedIn() ? (
                                <Register {...props} />) : (<Redirect to="/profile"/>)
                        )}/>
                        <Route exact path="/login" render={(props) => (
                            !isLoggedIn() ? (
                                <Login {...props} />) : (<Redirect to="/profile"/>)
                        )}/>
                        <Route exact path="/users/:id" render={(props) => (
                            isLoggedIn() ? (
                                <Profile {...props} />) : (<Redirect to="/profile"/>)
                        )}/>
                        <Route exact path="/profile/:id" render={(props) => (
                            isLoggedIn() ? (
                                <Profile {...props} />) : (<Redirect to="/login"/>)
                        )}/>
                        <Route exact path="/post/view" render={(props) => (
                            isLoggedIn() ? (
                                <ViewPost {...props} />) : (<Redirect to="/login"/>)
                        )}/>
                        <Route exact path="/search" render={(props) => (
                            isLoggedIn() ? (
                                <SearchTravels {...props} />) : (<Redirect to="/login"/>)
                        )}/>
                    </div>
                </div>
            </Router>
        )
    }
}


export default App;
