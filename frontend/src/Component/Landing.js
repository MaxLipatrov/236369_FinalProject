import React, {Component} from 'react'


class Landing extends Component {
    state = {
        users: []
    };


    render() {

        const ifLoggedIn = (<div className="container">
            <div className="jumbotron mt-4">
                <div className="col-sm-8 mx-auto">
                    <h1 className="text-center">Here will be a posts feed!</h1>
                </div>
            </div>
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