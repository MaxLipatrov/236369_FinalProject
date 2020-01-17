import React, {Component} from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import Alert from "reactstrap/es/Alert";
import axios from "axios";
import MapExample from "./Map";
import Collapsible from "react-collapsible";
import {createNewPost} from "./PostsFeed";

export const register = newUser => {
    return axios
        .post('http://127.0.0.1:5000/signup', {
            username: newUser.username,
            email: newUser.email,
            password: newUser.password,
            about: newUser.about
        })
        .then(response => {
            return response.data
        })
};


const validEmailRegex =
    RegExp(/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);

const validateForm = (errors) => {
    let valid = true;
    Object.values(errors).forEach(
        (val) => val.length > 0 && (valid = false)
    );
    return valid;
};

class Register extends Component {
    constructor() {
        super();
        this.state = {
            username: '',

            email: '',
            password: '',
            about: '',
            errors: {
                username: '',
                email: '',
                password: '',
                about: '',
            },
            user_taken: 0,
            email_taken: 0,

            combine_form: false,

            invalid: 0
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onNewPostChange = this.onNewPostChange.bind(this);

    }

    onChange(e) {
        //  e.preventDefault()
        let errors = this.state.errors;
        const {name, value} = e.target;
        this.setState({[e.target.name]: e.target.value});

        switch (name) {
            case 'username':
                this.setState({user_taken: 0});
                errors.username =
                    value.length < 1 || value.length > 20
                        ? 'Username is not valid!'
                        : '';
                break;
            case 'email':
                this.setState({email_taken: 0});
                errors.email =
                    validEmailRegex.test(value) && value.length <= 120
                        ? ''
                        : 'Email is not valid!';
                break;
            case 'password':
                errors.password =
                    value.length < 1 || value.length > 60
                        ? 'Password is not valid!'
                        : '';
                break;
            case 'about':
                errors.about =
                    value.length > 250
                        ? 'You wrote too much'
                        : "";
                break;

            default:
                break;
        }
        this.setState({errors, [name]: value});
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({invalid: 0});
        this.setState({user_taken: 0});
        this.setState({email_taken: 0});

        const newUser = {
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            about: this.state.about
        };

        if (validateForm(this.state.errors)) {

            register(newUser).then(res => {
                if (res === 'Created') {
                    if (this.state.combine_form) {
                        const newPost = {
                            user_name: this.state.username,
                            start_date: this.state.start_date,
                            end_date: this.state.end_date,
                            latitude: document.getElementById("latitude-input").value,
                            longitude: document.getElementById("longitude-input").value,
                            about: this.state.about
                        };
                        createNewPost(newPost, this.state.username).then(res => {
                            /* Add check return value! */
                            this.props.history.push(`/login`)
                        });
                    } else {
                        this.props.history.push(`/login`)
                    }
                }
                if (res === 'Username Taken') {
                    this.setState({user_taken: 1});
                    this.setState({invalid: 1});
                }
                if (res === 'Email Taken') {
                    this.setState({email_taken: 1});
                    this.setState({invalid: 1});
                }
            })
        } else {
            this.setState({invalid: 1});
        }
    }

    onNewPostChange(e) {
        let errors = this.state.errors;
        const {name, value} = e.target;

        console.log("name: " + name + " value: " + value);

        switch (name) {
            case 'start_date':
                break;
            case 'end_date':
                break;
            case 'latitude':
                break;
            case 'longitude':
                break;
            case 'about':
                break;
            default:
                break;
        }
        this.setState({
            errors, [name]: value
        });
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-6 mt-5 mx-auto">
                        <form noValidate onSubmit={this.onSubmit}>
                            <h1 className="h3 mb-3 font-weight-normal">Register</h1>
                            <div className="form-group">
                                {this.state.invalid > 0 && <Alert color="danger">
                                    Your registration is invalid. Please try again!
                                </Alert>}
                                <label htmlFor="name">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={this.state.username}
                                    onChange={this.onChange}
                                />
                                {this.state.errors.username.length > 0 &&
                                <span className='error'>{this.state.errors.username}</span>}
                                {this.state.user_taken > 0 &&
                                <span className='error'>This username is taken</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    placeholder="Enter email"
                                    value={this.state.email}
                                    onChange={this.onChange}
                                />
                                {this.state.errors.email.length > 0 &&
                                <span className='error'>{this.state.errors.email}</span>}
                                {this.state.email_taken > 0 &&
                                <span className='error'>This email is taken</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    placeholder="Password"
                                    value={this.state.password}
                                    onChange={this.onChange}
                                />
                                {this.state.errors.password.length > 0 &&
                                <span className='error'>{this.state.errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="about">About</label>
                                <textarea
                                    rows="3"
                                    className="form-control"
                                    name="about"
                                    placeholder="Write a few words about yourself"
                                    value={this.state.about}
                                    onChange={this.onChange}
                                />
                                {this.state.errors.about.length > 0 &&
                                <span className='error'>{this.state.errors.last_name}</span>}
                            </div>
                            <div className="col mt-1 mx-auto">
                                <Collapsible
                                    trigger={

                                        <button className="btn btn-lg btn-primary btn-block btn-success">
                                            Add your first post
                                        </button>

                                    }
                                    triggerWhenOpen={

                                        <button className="btn btn-lg btn-primary btn-block btn-warning">
                                            Cancel registration with post
                                        </button>

                                    }
                                    onOpen={(e) => {
                                        this.setState({combine_form: true});

                                    }}
                                    onClose={(e) => {
                                        this.setState({combine_form: false});
                                    }}
                                >
                                    <br/>
                                    <div className="form-group">
                                        <label htmlFor="start_date">Start date:</label>
                                        <input
                                            id={"start_date-input"}
                                            type="date"
                                            className="form-control"
                                            name="start_date"
                                            onChange={this.onNewPostChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="end_date">End date:</label>
                                        <input
                                            id={"end_date-input"}
                                            type="date"
                                            className="form-control"
                                            name="end_date"
                                            onChange={this.onNewPostChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="latitude">Latitude:</label>
                                        <input id={"latitude-input"}
                                               type="text"
                                               className="form-control"
                                               name="latitude"
                                               readOnly
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="longitude">Longitude:</label>
                                        <input
                                            id={"longitude-input"}
                                            type="text"
                                            className="form-control"
                                            name="longitude"
                                            readOnly
                                        />
                                    </div>
                                    <MapExample zoom={8}
                                                center={{lat: "52.5095347703273", lng: "13.38958740234375"}}
                                                mutable={true}
                                                markerOnStart={false}
                                                useMyMarker={true}
                                                posts={null}
                                                other_posts={null}
                                    />
                                    <div className="form-group">
                                        <label htmlFor="about">About:</label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            name="about"
                                            placeholder="Write few words about your travel plans"
                                            onChange={this.onNewPostChange}
                                        />
                                    </div>
                                </Collapsible>
                            </div>

                            <div className="col mt-1 mx-auto">

                                <button
                                    type="submit"
                                    className="btn btn-lg btn-primary btn-block"
                                >
                                    {(this.state.combine_form) ? "Register and post" : "Register"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default Register