import React, {Component} from 'react'
import jwt_decode from "jwt-decode";
import axios from "axios";
import {PostsFeed} from "./PostsFeed";


class Landing extends Component {
    constructor(props) {
        super(props);
        // console.log("props: " + props);
    }

    state = {
        current_user: '',
        users: []
    };


    render() {

        const ifLoggedIn = (<div className="container" style={{width: "100%"}}>
            <PostsFeed  {...this.props}/>
        </div>);

        const ifAnonymous = (<div className="container">
            <div className="jumbotron mt-4">
                <div className="col-sm-8 mx-auto">
                    <h1 className="text-center">Welcome to Travel App!</h1>
                    <h1 className="text-center">Login or register to use the app!</h1>
                </div>
            </div>
        </div>);

        return localStorage.usertoken ? ifLoggedIn : ifAnonymous
    }
}

export default Landing