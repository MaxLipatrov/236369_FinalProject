import React, {Component} from 'react'
import axios from "axios";
import ReactPaginate from "react-paginate";
import moment from "moment";
import {Link} from "react-router-dom";
import jwt_decode from "jwt-decode";
import Alert from "reactstrap/es/Alert";

const createNewPost = (post, user_name) => {
    axios.defaults.withCredentials = true;
    return axios
        .put('http://127.0.0.1:5000/post/new', {
            user_name: user_name,
            start_date: post.start_date,
            end_date: post.end_date,
            latitude: post.latitude,
            longitude: post.longitude,
            about: post.about
        })
        .then(response => {
            return response.data
        })
};


export class PostsFeed extends Component {
    constructor() {
        super();
        this.state = {
            amount: 0,
            posts: [],
            current_user: '',

            /* For a new post form */
            start_date: '',
            end_date: '',
            latitude: 0,
            longitude: 0,
            about: '',

            invalid: 0,
            errors: {
                date_error: ''
            }
        };
        this.onNewPostChange = this.onNewPostChange.bind(this);
        this.onNewPostSubmit = this.onNewPostSubmit.bind(this);
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
        axios.get('http://127.0.0.1:5000/posts/' + this.state.current_user).then((response) => {
            this.setState({
                posts: response.data,
                amount: response.data.length
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

        const post = {
            start_date: this.state.start_date,
            end_date: this.state.end_date,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            about: this.state.about
        };

        if (this.validateNewPostForm(this.state.errors)) {

            createNewPost(post, this.state.current_user).then(r => {

            });
            this.componentDidMount();

        } else {
            this.setState({invalid: 1});
        }
    }

    onNewPostChange(e) {
        e.preventDefault();
        let errors = this.state.errors;
        const {name, value} = e.target;

        /**
         *
         *  start_date: '',
         end_date: '',
         latitude: 0,
         longitude: 0,
         about: '',**/


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
        this.setState({errors, [name]: value});
    }

    validateNewPostForm(errors) {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    }


    newPost() {
        return (<div className="col-md-24 mx-auto">
            <br/>
            <tr>
                <td style={{border: '1px solid', width: '50%'}}>
                    <text>Share your travel plans in a new post:</text>
                    <form noValidate onSubmit={this.onNewPostSubmit}>
                        <div className="form-group">
                            <label htmlFor="start_date">Start date:</label>
                            <input
                                type="date"
                                className="form-control"
                                name="start_date"
                                onChange={this.onNewPostChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end_date">End date:</label>
                            <input
                                type="date"
                                className="form-control"
                                name="end_date"
                                onChange={this.onNewPostChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="latitude">Latitude:</label>
                            <input
                                type="text"
                                className="form-control"
                                name="latitude"
                                onChange={this.onNewPostChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="longitude">Longitude:</label>
                            <input
                                type="text"
                                className="form-control"
                                name="longitude"
                                onChange={this.onNewPostChange}
                            />
                        </div>
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
                            Create!
                        </button>
                    </form>
                </td>
            </tr>
        </div>);
    }


    render() {

        let new_post = this.newPost();
// {!this.state.flag && <EditProfile
//                         email={this.state.email}
//                         about={this.state.about}
//                         errors={this.state.errors}
//                         onChange={this.onChange}
//                         handlechange={this.handleChange}
//                         onSubmit={this.onSubmit}
//                         invalid={this.state.invalid}
//                         email_taken={this.state.email_taken}
//                         flag={this.state.flag}
//                         toggleUpdate={this.toggleUpdate}
//                         onchangeimg={this.onChangeImg}
//                     />}

        let posts = this.state.posts.map((post) => {
            return (
                <div className="col-md-24 mx-auto">
                    <br/>
                    <tr>
                        <td style={{border: '1px solid', width: '50%'}}>
                            <text>#{post.id}</text>
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
                        </td>

                    </tr>
                </div>

            );
        });

        return (
            <div>
                <table className="table col-md-6 mx-auto">
                    <tbody>{new_post}{posts}</tbody>
                </table>

                {/*<ReactPaginate*/}
                {/*    breakLabel={'...'}*/}
                {/*    breakClassName={'break-me'}*/}
                {/*    pageCount={Math.ceil(this.state.amount / 5)}*/}
                {/*    marginPagesDisplayed={2}*/}
                {/*    pageRangeDisplayed={5}*/}
                {/*    onPageChange={this.handlePageClick}*/}
                {/*    containerClassName={'pagination'}*/}
                {/*    subContainerClassName={'pages pagination'}*/}
                {/*    disabledClassName={'disabled'}*/}
                {/*    activeClassName={'active'}*/}
                {/*    forcePage={this.state.current_page - 1}*/}
                {/*/>*/}
            </div>
        )

    }
}