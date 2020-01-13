import React, {Component} from 'react'
import jwt_decode from "jwt-decode";
import axios from "axios";
import {PostsFeed} from "./PostsFeed";


class Landing extends Component {
    state = {
        current_user: '',
        users: []
    };




    render() {

        const ifLoggedIn = (<div className="container">
            {/*<div className="jumbotron mt-4">*/}
            {/*    <div className="col-sm-8 mx-auto">*/}
            {/*        <h1 className="text-center">Here will be a posts feed!</h1>*/}
            {/*    </div>*/}
            {/*    */}
            {/*</div>*/}
            <PostsFeed></PostsFeed>
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