import React, {Component} from 'react'
import axios from "axios";
import ReactPaginate from "react-paginate";
import moment from "moment";
import {Link} from "react-router-dom";
import jwt_decode from "jwt-decode";
import Alert from "reactstrap/es/Alert";
import Collapsible from 'react-collapsible';
import MapExample from './Map'
import Button from "react-bootstrap/Button";

const deletePost = (post_id, user_name) => {
    axios.defaults.withCredentials = true;
    return axios
        .put('http://127.0.0.1:5000/post/delete', {
            user_name: user_name,
            post_id: post_id
        })
        .then(response => {
            return response.data
        }).catch(err => {
            console.log(err)
        });
};

const updatePost = (post, user_name) => {
    axios.defaults.withCredentials = true;
    return axios
        .put('http://127.0.0.1:5000/post/update', {
            id: post.id,
            user_name: user_name,
            start_date: post.start_date,
            end_date: post.end_date,
            latitude: document.getElementById("latitude-input").value,
            longitude: document.getElementById("longitude-input").value,
            about: post.about
        })
        .then(response => {
            return response.data
        }).catch(err => {
            console.log(err)
        });
};


export class ViewPost extends Component {
    constructor(props) {
        super(props);
        this.state = props.location.state;

        const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            this.state.current_user = decoded.identity.user_name;
        }

        this.onNewPostChange = this.onNewPostChange.bind(this);
        this.onExistingPostUpdate = this.onExistingPostUpdate.bind(this)
    }


    onNewPostChange(e) {
        let errors = this.state.errors;
        const {name, value} = e.target;

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
            errors,
            [name]: value,
            latitude: document.getElementById("latitude-input").value,
            longitude: document.getElementById("longitude-input").value
        });
    }

    onExistingPostUpdate(e) {
        e.preventDefault();
        const post = {
            id: this.state.id,
            start_date: this.state.start_date,
            end_date: this.state.end_date,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            about: this.state.about,
        };
        updatePost(post, this.state.current_user).then(r => {
            this.props.history.push(`/`);
        });
        // if (this.validateNewPostForm(this.state.errors)) {
        //
        // } else {
        //     this.setState({invalid: 1});
        // }
    }

    validateNewPostForm(errors) {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    }

    postForm() {
        return (
            <div className="col-md-24 mx-auto" style={{width: "50%"}}>
                <form noValidate onSubmit={this.onExistingPostUpdate}>
                    <br/>
                    <h3>
                        {
                            (this.state.user_name === this.state.current_user) ?
                                "Edit menu of post #" + this.state.id + ":"
                                :
                                "View post #" + this.state.id + ":"
                        }
                    </h3>
                    <div className="form-group">
                        <label htmlFor="start_date">Start date:</label>
                        {
                            (this.state.user_name === this.state.current_user) ?
                                <input
                                    type="date"
                                    className="form-control"
                                    name="start_date"
                                    onChange={this.onNewPostChange}
                                    value={new Date(this.state.start_date).toISOString().split('T')[0]}
                                />
                                :
                                <input
                                    type="date"
                                    className="form-control"
                                    name="start_date"
                                    onChange={this.onNewPostChange}
                                    value={new Date(this.state.start_date).toISOString().split('T')[0]}
                                    readOnly
                                />
                        }
                    </div>
                    <div className="form-group">
                        <label htmlFor="end_date">End date:</label>
                        {
                            (this.state.user_name === this.state.current_user) ?
                                <input
                                    type="date"
                                    className="form-control"
                                    name="end_date"
                                    onChange={this.onNewPostChange}
                                    value={new Date(this.state.end_date).toISOString().split('T')[0]}

                                />
                                :
                                <input
                                    type="date"
                                    className="form-control"
                                    name="end_date"
                                    onChange={this.onNewPostChange}
                                    value={new Date(this.state.end_date).toISOString().split('T')[0]}
                                    readOnly
                                />
                        }
                    </div>

                    <div className="form-group">
                        <label htmlFor="latitude">Latitude:</label>
                        <input id={"latitude-input"}
                               type="text"
                               className="form-control"
                               name="latitude"
                               value={this.state.latitude}
                               readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="longitude">Longitude:</label>
                        <input
                            id="longitude-input"
                            type="text"
                            className="form-control"
                            name="longitude"
                            value={this.state.longitude}
                            readOnly
                        />
                    </div>
                    <MapExample zoom={8}
                                center={{lat: this.state.latitude, lng: this.state.longitude}}
                                mutable={
                                    (this.state.user_name === this.state.current_user)
                                }
                                markerOnStart={true}
                                useMyMarker={true}
                                posts={null}
                                other_posts={null}
                    />
                    <div className="form-group">
                        <label htmlFor="about">About:</label>

                        {
                            (this.state.user_name === this.state.current_user) ?
                                <textarea
                                    rows="3"
                                    className="form-control"
                                    name="about"
                                    value={this.state.about}
                                    placeholder="Write few words about your travel plans"
                                    onChange={this.onNewPostChange}
                                />
                                :
                                <textarea
                                    rows="3"
                                    className="form-control"
                                    name="about"
                                    value={this.state.about}
                                    placeholder="Write few words about your travel plans"
                                    onChange={this.onNewPostChange}
                                    readOnly
                                />
                        }
                    </div>
                    <div className="col mt-1 mx-auto">
                        {
                            (this.state.user_name === this.state.current_user) &&
                            <Button type="submit" className="btn btn-lg btn-primary btn-block">
                                Update
                            </Button>
                        }
                    </div>
                </form>
                <div className="col mt-1 mx-auto">
                    {
                        (this.state.user_name === this.state.current_user) &&
                        <Button className="btn btn-lg btn-primary btn-block btn-danger"
                                onClick={() => {
                                    let res = window.confirm('Are you sure you want to delete this post?');
                                    if (res) {
                                        deletePost(this.state.id, this.state.current_user)
                                            .then(r => {
                                                this.props.history.push(`/`);
                                            });
                                    }
                                }}>
                            Delete
                        </Button>

                    }
                </div>

                <br/>
            </div>
        );
    }

    render() {
        return this.postForm();
    }
}