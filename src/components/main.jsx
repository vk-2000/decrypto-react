import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {Navbar, Container, Nav, Image, Button} from 'react-bootstrap'
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import {BASE_URL} from '../App.js'
import { Navigate, useNavigate } from 'react-router-dom';
import Leaderboard from "./leaderboard.jsx";
import Congratulations from "./congratulations.jsx";
import ContestNotLive from "./contestNotLive.jsx";

class Main extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      image_url: '',
      answer: '',
      question_number: 0,
      all_answered: false,
      contest_live: true,
      startTime: null,
      endTime: null
    }
    

    this.getStartTime()
  }
	componentDidMount(){
		this.fetchQuestion()
	}
  getStartTime(){
    fetch(BASE_URL + "utils/start-time", {
			method: 'GET',
			headers: {
				'accept': 'application/json'
			}
		})
    .then(response => response.json())
    .then(data => {
      this.setState ({startTime: new Date(data.timestamp).getTime()})
      this.getEndTime()
    })
  }
  getEndTime(){
    fetch(BASE_URL + "utils/end-time", {
			method: 'GET',
			headers: {
				'accept': 'application/json'
			}
		})
    .then(response => response.json())
    .then(data => {
      this.setState({endTime: new Date(data.timestamp).getTime()})
    })
  }
  
	fetchQuestion() {
		fetch(BASE_URL + "users/question", {
			method: 'GET',
			headers: {
				"Authorization": "bearer " + localStorage.getItem('access-token'),
				'accept': 'application/json'
			}
		}).then(response => {
      if(response.redirected == true){
        this.setState({all_answered: true})
        return
      }
      else if(response.status == 400){
        this.setState({contest_live: false})
        return
      }
      response.json()
      .then(data => {
        let image_url = data.content
        let content_type = data.content_type
        this.setState({
          image_url: 'data:' + content_type + ";base64," + image_url
        })
        this.updateQuestionNumber()
      })
    })
	}
  updateQuestionNumber() {
    fetch(BASE_URL + "users/me", {
      method: 'GET',
      headers: {
          "Authorization": "bearer " + localStorage.getItem('access-token'),
          'accept': 'application/json'
      }
      }).then(response => {
          if(response.status == 200){
              response.json()
              .then(data => {
                  this.setState({question_number: data.question_number})
              })
          }
      })
  }
  render() {
    
    if(this.state.all_answered){
      return (
        <div>
          {this.renderNavbar()}
          <Congratulations ></Congratulations>
        </div>
      )
    }
    if(! this.state.contest_live){
      return (
        <div>
          {this.renderNavbar()}
          <ContestNotLive startTime={this.state.startTime} endTime={this.state.endTime}></ContestNotLive>
        </div>
      )
    }
      return (
          <div>
              {this.renderNavbar()}
              <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    />
              <div className="container d-flex flex-column p-4" style={{height: "90vh"}}>
                <div className="h3 text-white">Question {this.state.question_number}</div>
                <div className="d-flex align-items-center justify-content-center" style={{height: "85%"}}>
                  <Image id="questionImage" className="" src={this.state.image_url} />
                </div>
                <div className="input-group my-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Answer</span>
                  </div>
                  <input type="text" id="answer" className="form-control" aria-label="Sizing example input" onChange={event => this.updateAnswer(event)} aria-describedby="inputGroup-sizing-default"/>
                </div>
                <button type="button" className="btn btn-dark mb-2" onClick={(event) => this.submitAnswer(event)} >Submit</button>
              </div>
              
          </div>
          
      );
  }
  renderNavbar(){
    return (
      <Navbar bg="dark" expand="lg" variant="dark">
                <Container>
                  <Navbar.Brand href="#home">Decrypto 2k21</Navbar.Brand>
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse className="justify-content-end mx-2" id="basic-navbar-nav">
                    <Nav className="">
                      <Link className="mx-3 nav-link" to="/rules">Rules</Link>
                      <Link className="mx-3 nav-link" to="/leaderboard">Leaderboard</Link>
                      <Link className="mx-3 nav-link" to="" onClick={this.logout}>Logout</Link>
                    </Nav>
                  </Navbar.Collapse>
                </Container>
              </Navbar>
    )
  }
  logout = () => {
    localStorage.clear();
    window.location.href = '/home';
  }
  submitAnswer = (event) => {
    event.preventDefault()
    document.getElementById("answer").value = "";
    let answer = {
      "answer": this.state.answer
    }
    let data = JSON.stringify(answer)

    fetch(BASE_URL + "users/answer", {
			method: 'POST',
			headers: {
				"Authorization": "bearer " + localStorage.getItem('access-token'),
				'Content-Type': 'application/json',
			},
      body: data
		}).then(response => {
      if(response.status == 400){
        response.json()
        .then(data => toast.error(data.detail))
      }
      else if(response.status == 200){
        response.json()
        .then(data => {
          this.fetchQuestion()
        })
      }
    })

    
  }
  updateAnswer(event) {
    this.setState({
      answer: event.target.value
    })
  }
}
 
export default Main;