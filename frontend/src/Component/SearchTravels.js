import React, {Component} from 'react';

import axios from "axios";
import jwt_decode from "jwt-decode";
import MapExample from "./Map";
import Form from "react-bootstrap/Form";

import {isPointWithinRadius} from 'geolib'



export class SearchTravels extends Component {
    constructor(props) {
        super(props);

        this.state = {
            current_user: '',
            posts: [],
            other_posts: [],

            invalid: 0,

            no_start_date: 0,
            no_end_date: 0,
            start_later_than_end: 0,
            no_radius: 0,
            not_numerical_radius: 0,
            no_destination: 0,
        };

        const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            this.state.current_user = decoded.identity.user_name
        }
        this.performSearch = this.performSearch.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/search/posts/followed/' + this.state.current_user,).then((response) => {

            this.setState({posts: response.data});
        }).catch(err => {
            console.log(err)
        });
    }


    onChange(e) {
        const {name, value} = e.target;

        let new_state = this.state;
        // alert("name: " + name + " value:" + value);
        switch (name) {
            case 'start_date':
                new_state.no_start_date = (value === '');
                new_state.start_later_than_end = this.startDateAfterEndDate();

                break;
            case 'end_date':
                new_state.no_end_date = (value === '');
                new_state.start_later_than_end = this.startDateAfterEndDate();
                break;
            case 'radius':
                new_state.no_radius = (value === '');
                new_state.not_numerical_radius = (isNaN(+value));
                break;
            default:
                break;
        }
        this.setState(new_state);
    }

    startDateAfterEndDate() {
        return ((document.getElementById("start_date-input").value !== '') &&
            (document.getElementById("end_date-input").value !== '') &&
            (new Date(document.getElementById("start_date-input").value)
                > new Date(document.getElementById("end_date-input").value)));
    }

    performSearch() {

        let new_state = this.state;

        new_state.invalid = 0;

        if (document.getElementById("radius-input").value === '') {
            new_state.invalid = 1;
            new_state.no_radius = 1;
        }

        if (document.getElementById("start_date-input").value === '') {
            new_state.invalid = 1;
            new_state.no_start_date = 1;
        }
        if (document.getElementById("end_date-input").value === '') {
            new_state.invalid = 1;
            new_state.no_end_date = 1;
        }

        if (this.startDateAfterEndDate()) {
            new_state.invalid = 1;
            new_state.start_later_than_end = 1;
        }

        if (document.getElementById("latitude-input").value === '' ||
            document.getElementById("longitude-input").value === '') {
            new_state.invalid = 1;
            new_state.no_destination = 1;
        }

        this.setState(new_state);

        if (this.state.invalid === 0) {
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
                        document.getElementById("radius-input").value * 1000)
                });
                this.setState({
                    other_posts: in_radius
                });
            }).catch(err => {
                console.log(err)
            });
        }
    }

    render() {
        return (<div>
                <div className="jumbotron-fluid mt-5">
                    <div>
                        <div className="media">
                            <div className="media-body">
                                <div>{/*style={{width: "25%"}}*/}
                                    <Form noValidate onSubmit={(e) => {
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
                                                onChange={this.onChange}
                                            />
                                            {this.state.no_start_date > 0 &&
                                            <span className='error'>No start date specified.</span>}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="end_date">End date:</label>
                                            <input
                                                id={"end_date-input"}
                                                type="date"
                                                className="form-control"
                                                name="end_date"
                                                onChange={this.onChange}
                                            />
                                            {this.state.no_end_date > 0 &&
                                            <span className='error'>No end date specified.</span>}
                                            {this.state.start_later_than_end > 0 &&
                                            <span className='error'>Start date can not be later than end date.</span>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="radius">Search radius:</label>
                                            <input
                                                id={"radius-input"}
                                                type="text"
                                                className="form-control"
                                                name="radius"
                                                onChange={this.onChange}
                                            />
                                            {this.state.no_radius > 0 &&
                                            <span className='error'>No radius specified.</span>}
                                            {this.state.not_numerical_radius > 0 &&
                                            <span className='error'>Radius must have numerical value.</span>}
                                        </div>
                                        <div className="form-group">

                                            <button
                                                type="submit"
                                                className="btn btn-lg btn-primary btn-block"
                                            >
                                                {"Search"}
                                            </button>
                                        </div>
                                            {this.state.no_destination > 0 &&
                                            <span className='error'>You must choose destination first.</span>}
                                    </Form>
                                </div>
                                <MapExample zoom={5}
                                            center={{lat: "52.5095347703273", lng: "13.38958740234375"}}
                                            mutable={true}
                                            markerOnStart={false}
                                            useMyMarker={false}
                                            posts={this.state.posts}
                                            other_posts={this.state.other_posts}
                                />
                                <input id="latitude-input" hidden/>
                                <input id="longitude-input" hidden/>
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