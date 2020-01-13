/*

        axios.defaults.withCredentials = true;
        axios.get('http://127.0.0.1:5000/is_following/' + this.props.match.params.id).then((response) => {
            const res = (response.data === 'True');
            this.setState({
                isFollowing: res
            })
        }).catch(err => {
            console.log(err)
        });

        let users = this.state.users.map((user) => {
            return (
                <div className="col-md-24 mx-auto">
                    <tr>
                        <td>
                            <b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>
                        </td>
                        <td><img className="rounded-circle account-img"
                                 src={"http://127.0.0.1:5000" + user.image_file}
                                 height="60" width="60"
                                 alt={}/>
                            <a href={"/users/" + user.user_name}>{'     ' + user.user_name}</a></td>
                    </tr>
                </div>

            );
        });
*/

import React, {Component} from 'react'
import axios from "axios";
import ReactPaginate from "react-paginate";
import moment from "moment";
import {Link} from "react-router-dom";
import jwt_decode from "jwt-decode";

export class PostsFeed extends Component {
    constructor() {
        super();
        this.state = {
            amount: 0,
            posts: [],
            current_user: ''
        }
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

    render() {
        

        let posts = this.state.posts.map((post) => {
            return (
                <div className="col-md-24 mx-auto">
                    <br/>
                    <tr>
                        <td>
                            <b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>
                        </td>
                        <td style={{border: '1px solid'}}><img className="rounded-circle account-img"
                                 src={"http://127.0.0.1:5000" + post.user_image}
                                 height="30" width="30"
                        /> <a href={"/users/" + post.user_name}>{'     ' + post.user_name}</a>
                            <text>    posted at {post.post_date.substring(0, post.post_date.length - 4)}</text>
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
                    <tbody>{posts}</tbody>
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