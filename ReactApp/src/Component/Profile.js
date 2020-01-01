import React, { Component } from 'react';

import { Nav, NavItem, NavLink } from 'reactstrap';
import axios from "axios";
import {About} from "./About";
import {Users} from "./Users";

import Button from "react-bootstrap/Button";
import jwt_decode from "jwt-decode";
import Badge from "react-bootstrap/Badge";

export class Profile extends Component{
    state={
        username: '',
        email: '',
        image_file: '',
        postsFlag: 1,
        aboutFlag:0,
        followingFlag:0,
        followersFlag:0,
        isFollowing: false,
        isFollowingMe: false,
        current_user:0,
        followers_amount:0,
        followed_amount:0
    }
    showPosts(e) {
        e.preventDefault()
        this.setState({
                postsFlag: 1,
                aboutFlag: 0,
                 followingFlag:0,
                followersFlag:0
            })
    }

    showAbout(){
        this.setState({postsFlag: 0,
        aboutFlag:1,
          followingFlag:0,
                followersFlag:0})
    }

    showFollowing(){
        this.setState({postsFlag: 0,
        aboutFlag:0,
          followingFlag:1,
                followersFlag:0})
    }

    showFollowers(){
        this.setState({postsFlag: 0,
        aboutFlag:0,
          followingFlag:0,
                followersFlag:1})
    }
    componentDidMount() {
         const token = localStorage.usertoken;
          if (token) {
              const decoded = jwt_decode(token);
              this.setState({
                  current_user: decoded.identity.id
              });
          }
        axios.get('http://127.0.0.1:5000/users/' + this.props.match.params.id).then((response) => {
                this.setState({
                   username: response.data.username,
                    image_file: response.data.image_file,
                  email: response.data.email,
                    followers_amount: response.data.followers,
                    followed_amount: response.data.followed,
                })
            }).catch(err => {
                console.log(err)
            });
        axios.defaults.withCredentials = true;
         axios.get('http://127.0.0.1:5000/is_following/' + this.props.match.params.id).then((response) => {
             const res = ( response.data == 'True') ? true : false;
                this.setState({
                   isFollowing: res
                })
            }).catch(err => {
                console.log(err)
            });

         axios.defaults.withCredentials = true;
         axios.get('http://127.0.0.1:5000/is_following_me/' + this.props.match.params.id).then((response) => {
             const res = ( response.data == 'True') ? true : false;
                this.setState({
                   isFollowingMe: res
                })
            }).catch(err => {
                console.log(err)
            });

  }
   componentDidUpdate (prevProps) {
       if (prevProps.location.pathname !== this.props.location.pathname) {
           this.componentDidMount();
       }
   }

   followUser(){
         axios.defaults.withCredentials = true;
         axios.post('http://127.0.0.1:5000/follow/' + this.props.match.params.id).then((response) => {
                this.setState({
                   isFollowing: true
                })
             this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
   }

    unfollowUser(){
         axios.defaults.withCredentials = true;
         axios.delete('http://127.0.0.1:5000/follow/' + this.props.match.params.id).then((response) => {
                this.setState({
                   isFollowing: false
                })
             this.componentDidMount();
            }).catch(err => {
                console.log(err)
            });
   }

   updateMenuInfo(info){
        this.setState({
              username: info.username,
                email: info.email,
        });

   }
   updateMenuPic(info){
        this.setState({
              image_file: info.image_file,
        });

   }
    render(){
        return( <div>
                    <div className="jumbotron-fluid mt-5" >
                      <div className="text-center">
                          <div className="media">
                                      <div className="media-body">
                                          <img className="center" className="rounded-circle account-img"
                                               src={"http://127.0.0.1:5000" + this.state.image_file}
                                               height="200" width="200"
                                          />
                                          <h1 className="account-heading">{this.state.username}</h1>
                                          <p className="text-secondary">{this.state.email}   {(this.state.current_user != this.props.match.params.id) && this.state.isFollowingMe &&
                                                   <h5><Badge pill variant="secondary">Follows you</Badge></h5>}</p>
                                               {(this.state.current_user != this.props.match.params.id) && <Button
                                                  variant="outline-primary"
                                                  onClick={this.state.isFollowing ? this.unfollowUser.bind(this) : this.followUser.bind(this)}
                                                >
                                                  {this.state.isFollowing ? 'Unfollow' : 'Follow'}
                                                </Button> }

                                      </div>
                      </div>
                    </div>
                    </div>
                    <Nav tabs>
                          <NavItem>
                            <NavLink
                                href="#"
                                onClick= {this.showAbout.bind(this)}>
                                About Me
                            </NavLink>
                          </NavItem>
                        </Nav>

            {this.state.aboutFlag ? <About id ={this.props.match.params.id} updateInfo={this.updateMenuInfo.bind(this)}
                    updatePic={this.updateMenuPic.bind(this)} /> : <br/>}
                {this.state.followersFlag  ? <Users id ={this.props.match.params.id} type={1} flag={this.state.isFollowing}/> : <br/>}
                {this.state.followingFlag  ? <Users id ={this.props.match.params.id} type={2} flag={this.state.isFollowing}/> : <br/>}

            </div>

        )
    }
}

export default Profile;