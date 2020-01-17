import React, {Component} from 'react';

import axios from "axios";
import jwt_decode from "jwt-decode";
import MapExample from "./Map";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import {isPointWithinRadius} from 'geolib'

export class SearchTravels extends Component {
    constructor(props) {
        super(props);

        this.state = {
            current_user: '',
            posts: [],
            other_posts: []
        };

        const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            this.state.current_user = decoded.identity.user_name
        }
        this.performSearch = this.performSearch.bind(this);
    }

    componentDidMount() {
        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/search/posts/followed/' + this.state.current_user,).then((response) => {

            this.setState({posts: response.data});
        }).catch(err => {
            console.log(err)
        });
    }

    performSearch() {
        /* VALIDATE DATES & RADIUS !!!!!!!!!!*/
        axios.defaults.withCredentials = true;
        axios.post('http://127.0.0.1:5000/search/posts/other/' + this.state.current_user,
            {
                start_date: document.getElementById("start_date-input").value,
                end_date: document.getElementById("end_date-input").value
            }
        ).then((response) => {
            let in_radius = response.data.filter((post) => {
                return isPointWithinRadius(
                    {
                        latitude: post.latitude,
                        longitude: post.longitude
                    },
                    {
                        latitude: document.getElementById("latitude-input").value,
                        longitude: document.getElementById("longitude-input").value
                    },
                    document.getElementById("radius-input").value*1000)
            });

            this.setState({
                other_posts: in_radius
            });
        }).catch(err => {
            console.log(err)
        });
    }

    render() {
        return (<div>
                <div className="jumbotron-fluid mt-5">
                    <div>
                        <div className="media">
                            <div className="media-body">
                                <div>{/*style={{width: "25%"}}*/}
                                    <form noValidate onSubmit={(e) => {
                                        e.preventDefault();
                                        this.performSearch();
                                    }}>
                                        <div className="form-group">
                                            <label htmlFor="start_date">Start date:</label>
                                            <input
                                                id={"start_date-input"}
                                                type="date"
                                                className="form-control"
                                                name="start_date"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="end_date">End date:</label>
                                            <input
                                                id={"end_date-input"}
                                                type="date"
                                                className="form-control"
                                                name="end_date"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="radius">Search radius:</label>
                                            <input
                                                id={"radius-input"}
                                                type="text"
                                                className="form-control"
                                                name="radius"
                                            />
                                        </div>
                                        <div className="form-group">

                                            <button
                                                type="submit"
                                                className="btn btn-lg btn-primary btn-block"
                                            >
                                                {"Search"}
                                            </button>
                                        </div>


                                    </form>


                                </div>
                                <MapExample zoom={8}
                                            center={{lat: "52.5095347703273", lng: "13.38958740234375"}}
                                            mutable={true}
                                            markerOnStart={false}
                                            useMyMarker={false}
                                            posts={this.state.posts}
                                            other_posts={this.state.other_posts}
                                />
                                <input id="latitude-input"/>
                                <input id="longitude-input"/>
                                <br/>
                                <br/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default SearchTravels;