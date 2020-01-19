import React, {Component} from 'react'
import axios from "axios";
import ReactPaginate from "react-paginate";
import moment from "moment";
import {Link} from "react-router-dom";
import jwt_decode from "jwt-decode";
import Alert from "reactstrap/es/Alert";
import Collapsible from 'react-collapsible';
import MapExample from './Map'
import Form from "react-bootstrap/Form";

export const createNewPost = (post, user_name) => {
    axios.defaults.withCredentials = true;
    return axios
        .put('http://127.0.0.1:5000/post/new', {
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

const subscribeToPost = (post, user_name) => {
    axios.defaults.withCredentials = true;
    return axios
        .put('http://127.0.0.1:5000/post/subscribe', {
            user_name: user_name,
            post_id: post.id
        })
        .then(response => {
            return response.data
        }).catch(err => {
            console.log(err)
        });
};

const deleteNotification = (note_id, user_name) => {
    axios.defaults.withCredentials = true;
    return axios
        .put('http://127.0.0.1:5000/notification/delete', {
            user_name: user_name,
            note_id: note_id
        })
        .then(response => {
            return response.data
        }).catch(err => {
            console.log(err)
        });
};


export class PostsFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            subscribed_posts: [],
            notifications: [],
            current_user: '',

            /* For a new post form.
            * Latitude and longitude are set from JS, hence no event raised.
            * They are taken with getElementById. */
            start_date: '',
            end_date: '',
            about: '',
            pos: {lat: "52.5095347703273", lng: "13.38958740234375"},
            markerOnStart: false,

            invalid: 0,

            no_start_date: 0,
            no_end_date: 0,
            start_later_than_end: 0,
            no_destination: 0,
        };
        this.onNewPostChange = this.onNewPostChange.bind(this);
        this.onNewPostSubmit = this.onNewPostSubmit.bind(this);
        this.newPostForm = this.newPostForm.bind(this)
    }

    componentDidMount() {
        const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);
            this.state.current_user = decoded.identity.user_name;
            this.refresh_feed();
        }
    }

    refresh_feed() {
        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/posts/' + this.state.current_user,).then((response) => {
            this.setState({
                posts: response.data,
            })
        }).catch(err => {
            console.log(err)
        });

        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/subscriptions/' + this.state.current_user).then((response) => {
            this.setState({
                subscribed_posts: response.data,
            })
        }).catch(err => {
            console.log(err)
        });

        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/notifications/' + this.state.current_user).then((response) => {
            console.log(response.data);
            this.setState({
                notifications: response.data,
            })
        }).catch(err => {
            console.log(err)
        });

    }

    componentWillReceiveProps() {
        this.componentDidMount();
    }

    onNewPostSubmit(e) {
        e.preventDefault();

        let new_state = this.state;

        new_state.invalid = 0;

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
        } else {
            new_state.no_destination = 0;
            new_state.pos = {
                lat: document.getElementById("latitude-input").value,
                lng: document.getElementById("longitude-input").value
            };
        }

        this.setState(new_state);

        if (this.state.invalid === 0) {
            const post = {
                start_date: this.state.start_date,
                end_date: this.state.end_date,
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                about: this.state.about
            };

            createNewPost(post, this.state.current_user).then(r => {
                window.location.reload();
            });
        }
    }

    onNewPostChange(e) {
        const {name, value} = e.target;

        let new_state = this.state;
        switch (name) {
            case 'start_date':
                new_state.no_start_date = (value === '');
                new_state.start_later_than_end = this.startDateAfterEndDate();
                break;
            case 'end_date':
                new_state.no_end_date = (value === '');
                new_state.start_later_than_end = this.startDateAfterEndDate();
                break;
            default:
                break;
        }

        if (document.getElementById("latitude-input").value !== '' &&
            document.getElementById("longitude-input").value !== '') {
            new_state.pos = {
                lat: document.getElementById("latitude-input").value,
                lng: document.getElementById("longitude-input").value
            };
            new_state.markerOnStart = true;
        }


        new_state[name] = value;

        this.setState(new_state);
    }

    startDateAfterEndDate() {
        return ((document.getElementById("start_date-input").value !== '') &&
            (document.getElementById("end_date-input").value !== '') &&
            (new Date(document.getElementById("start_date-input").value)
                > new Date(document.getElementById("end_date-input").value)));
    }

    newPostForm() {
        return (
            <form noValidate onSubmit={this.onNewPostSubmit}>
                <div className="form-group">
                    <label htmlFor="start_date">Start date:</label>
                    <input
                        id={"start_date-input"}
                        type="date"
                        className="form-control"
                        name="start_date"
                        onChange={this.onNewPostChange}
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
                        onChange={this.onNewPostChange}
                    />
                    {this.state.no_end_date > 0 &&
                    <span className='error'>No end date specified.</span>}
                    {this.state.start_later_than_end > 0 &&
                    <span className='error'>Start date can not be later than end date.</span>}
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
                {this.state.no_destination > 0 &&
                <span className='error'>You must choose destination first.</span>}
                <MapExample zoom={8}
                            center={this.state.pos}
                            mutable={true}
                            markerOnStart={this.state.markerOnStart}
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
                <button type="submit" className="btn btn-lg btn-primary btn-block">
                    {"Create"}
                </button>
            </form>
        );
    }

    renderNewPost() {
        return (
            <div className="col-md-24 mx-auto">
                <br/>
                <tr>
                    <td style={{width: '50%'}}>
                        <Collapsible
                            trigger={
                                <button className="btn btn-lg btn-primary btn-block">
                                    {"Share your plans in new post"}
                                </button>}
                            triggerWhenOpen={
                                <button className="btn btn-lg btn-primary btn-block">
                                    {"Click to collapse the form"}
                                </button>}>
                            {this.newPostForm()}
                        </Collapsible>
                    </td>
                </tr>
            </div>);
    }

    subscribeOrUnsubscribe(post) {
        subscribeToPost(post, this.state.current_user).then((res) => {
            this.refresh_feed();
        });
    }

    renderCurrentUserPost(post) {
        return (
            <div className="col-md-24 mx-auto">
                <br/>
                <tr>
                    <td>
                        <text>#{post.id} </text>
                        <br/>
                        <img className="rounded-circle account-img"
                             src={"http://127.0.0.1:5000" + post.user_image}
                             height="30" width="30"
                        />
                        <a href={"/users/" + post.user_name}>{'     ' + post.user_name}</a>
                        <text> posted at {post.post_date.substring(0, post.post_date.length - 4)}</text>
                        <br/>
                        <text>From {post.start_date.substring(0, post.post_date.length - 13)}</text>
                        <br/>
                        <text>Until {post.end_date.substring(0, post.post_date.length - 13)}</text>
                        <br/>
                        <text>Location: ({post.latitude},{post.longitude})</text>
                        <br/>
                        <text>{post.about}</text>
                        <br/>
                        <button className="btn btn-md btn-primary" onClick={() => {
                            this.props.history.push(`/post/view`, post)
                        }}>Edit
                        </button>
                    </td>
                </tr>
            </div>

        );
    }

    renderOtherUserPost(post) {
        return (
            <div className="col-md-24 mx-auto">
                <br/>
                <tr>
                    <td>
                        <text>#{post.id} </text>
                        <br/>
                        <img className="rounded-circle account-img"
                             src={"http://127.0.0.1:5000" + post.user_image}
                             height="30" width="30"
                        />
                        <a href={"/users/" + post.user_name}>{'     ' + post.user_name}</a>
                        <text> posted at {post.post_date.substring(0, post.post_date.length - 4)}</text>
                        <br/>
                        <text>From {post.start_date.substring(0, post.post_date.length - 13)}</text>
                        <br/>
                        <text>Until {post.end_date.substring(0, post.post_date.length - 13)}</text>
                        <br/>
                        <text>Location: ({post.latitude},{post.longitude})</text>
                        <br/>
                        <text>{post.about}</text>
                        <br/>
                        <button className="btn btn-md btn-primary" onClick={() => {
                            this.props.history.push(`/post/view`, post)
                        }}>View
                        </button>
                        {" "}
                        <button className="btn btn-md btn-primary" onClick={() => {
                            this.subscribeOrUnsubscribe(post)
                        }}>{this.state.subscribed_posts.includes(post.id) ? "Unsubscribe" : "Subscribe"}
                        </button>
                    </td>
                </tr>
            </div>
        );
    }


    renderNotification(note) {
        return (
            <div className="col-md-24 mx-auto">
                <br/>
                <tr>
                    <td>
                        <br/>
                        <img className="rounded-circle account-img"
                             src={"http://127.0.0.1:5000" + note.user_image}
                             height="20" width="20"
                        />
                        <a href={"/users/" + note.user_name}>{'     ' + note.user_name}</a>
                        <text> updated post #{note.post_id} at {note.date.substring(0, note.date.length - 4)}</text>
                        <br/>
                        <button className="btn btn-md btn-primary" onClick={() => {
                            let posts = this.state.posts;
                            let current = posts.filter((pt) => {
                                return pt.id === note.post_id;
                            });
                            let current_post = current[0];
                            this.props.history.push(`/post/view`, current_post)
                        }}>
                            See post
                        </button>
                        {" "}
                        <button className="btn btn-md btn-primary" onClick={() => {
                            let res = window.confirm('Are you sure you want to delete this notification?');
                            if (res) {
                                deleteNotification(note.id, this.state.current_user)
                                    .then(r => {
                                        this.refresh_feed();
                                    });
                            }
                        }}>
                            Delete
                        </button>
                    </td>
                </tr>
            </div>
        );
    }


    render() {

        let new_post = this.renderNewPost();
        let posts = this.state.posts.map((post) => {
            return (this.state.current_user === post.user_name) ?
                this.renderCurrentUserPost(post) : this.renderOtherUserPost(post);
        });

        let notifications = this.state.notifications.map((note) => {
            return this.renderNotification(note);
        });

        return (
            <div className="container" style={{width: "100%"}}>
                <div className="row">
                    <div style={{width: "65%"}}>
                        {new_post}
                        <table className="table mx-auto">
                            <tbody>{posts}</tbody>
                        </table>
                    </div>
                    <div style={{width: "35%"}}>
                        <br/>
                        <Collapsible
                            trigger={
                                <button className="btn btn-lg btn-primary btn-block">
                                    {"Show notifications"}
                                </button>}
                            triggerWhenOpen={
                                <button className="btn btn-lg btn-primary btn-block">
                                    {"Collapse notifications"}
                                </button>}>
                            <table className="table mx-auto">
                                <tbody>{notifications}</tbody>
                            </table>
                        </Collapsible>
                    </div>
                </div>

            </div>

        )

    }
}
