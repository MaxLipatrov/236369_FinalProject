import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import axios from "axios";
import jwt_decode from "jwt-decode";
import Autosuggest from 'react-bootstrap-autosuggest'
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
class Navbar extends Component {
    state ={
        current_user: 0,
        username:'',
        search_msg:'Search for a user'
    }
    get_user(){
        this.setState({search_msg:'Search for a user'});
         axios.defaults.withCredentials = true;
            axios.get('http://127.0.0.1:5000/user/'+this.state.username).then((response) => {
                this.setState({username:''});
                this.props.history.push(`/users/`+response.data.id)
            }).catch(err => {
                this.setState({username:'',search_msg:'User not found'});

            });
    }

    onChange(e){
        this.setState({username: e.target.value, search_msg:'Search for a user'});
    }

  logOut(e) {
      e.preventDefault()
      axios.defaults.withCredentials = true;
      axios.get('http://127.0.0.1:5000/logout').then(response => {
          localStorage.removeItem('usertoken')
          this.props.history.push(`/`)
      })
        .catch(err => {
          console.log(err)
        })
  }
   componentDidUpdate (prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
        this.componentDidMount();
    }
     }
  componentDidMount() {
      const token = localStorage.usertoken;
      if (token) {
          const decoded = jwt_decode(token);
          this.setState({
              current_user: decoded.identity.id
          });
      }

  }




  render() {

    const loginRegLink = (
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/register" className="nav-link">
            Register
          </Link>
        </li>
      </ul>
    )

    const userLink = (
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to={"/users/"+this.state.current_user} className="nav-link">
            User
          </Link>
        </li>
                <Form inline onSubmit={e => { e.preventDefault(); this.get_user() }}>
              <FormControl type="text" placeholder={this.state.search_msg} onChange={this.onChange.bind(this)}
                value={this.state.username} className="mr-md-1"/>

              <Button variant="outline-secondary"
                      onClick={this.get_user.bind(this)}
                    >Search</Button>
              </Form>
        <li className="nav-item">
          <a href="" onClick={this.logOut.bind(this)} className="nav-link">
           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Logout
          </a>
        </li>

      </ul>


    )

    return (
      <div><nav className="navbar navbar-expand-lg navbar-dark bg-dark rounded">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarsExample10"
          aria-controls="navbarsExample10"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse justify-content-md-center col-md-12 "
          id="navbarsExample10"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
          </ul>
          {localStorage.usertoken ? userLink : loginRegLink}

        </div>

      </nav>

          </div>
    )
  }
}

export default withRouter(Navbar)