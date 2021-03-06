import React, { Component } from 'react';
import Particles from 'react-particles-js';
//import Clarifai from 'clarifai'; //moved to backend becaus of api key protection
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js'
import Navigation from './components/Navigation/Navigation.js'
import Signin from './components/Signin/Signin.js'
import Register from './components/Register/Register.js'
import Logo from './components/Logo/Logo.js'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js'
import Rank from './components/Rank/Rank.js'
import './App.css';


const particlesOptions = {
	particles: {
		line_linked: {
			shadow: {
				enable: true,
				color: "#3CA9D1",
				blur: 5
			}
		}
		// Andrei's solution : 
		// number: {
		// 	value: 30,
		// 	density: {
		// 		enable: true,
		// 		value_area: 800
		// 	}
		// }
	}
}

const initialState = {
	  		input: '',
	  		imageUrl: '',
	  		box: {},
	  		route: 'signin',
	  		isSignedIn: false,
	  		user: {
	  			id: '',
	            name: '',
	            email: '',
	            entries: 0,
	            joined: '' 
	  		}
	  	}

class App extends Component {
	  constructor(){
	  	super();
	  	this.state = initialState;
	  }

	  loadUser = (data) => {
	  	this.setState({user: {
	  		id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined 
	  	}})
	  } 

	 calculateFaceLocation = (data) => {
	    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
	    const image = document.getElementById('inputimage');
	    const width = Number(image.width);
	    const height = Number(image.height);
	    return {
	      leftCol: clarifaiFace.left_col * width,
	      topRow: clarifaiFace.top_row * height,
	      rightCol: width - (clarifaiFace.right_col * width),
	      bottomRow: height - (clarifaiFace.bottom_row * height)
	    }
	 }

	  displayFaceBox = (box) => {
	  	this.setState({box: box}); 
	  }

	  onInputChange = (event) => {
	  	this.setState({input: event.target.value});
	  }

	  onButtonSubmit = () => {
	  	this.setState({imageUrl: this.state.input});
	  	// app.models
	   //    .predict(
	   //      // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
	   //      // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
	   //      // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
	   //      // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
	   //      // is to use a different version of their model that works like: `c0c0ac362b03416da06ab3fa36fb58e3`
	   //      // so you would change from:
	   //      // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
	   //      // to:
	   //      // .predict('c0c0ac362b03416da06ab3fa36fb58e3', this.state.input)
	   //      Clarifai.FACE_DETECT_MODEL,  
	   //      this.state.input)
	   	fetch('https://secure-harbor-69642.herokuapp.com/imageurl', {
		        method: 'post',
		        headers: {'Content-Type': 'application/json'},
		        body: JSON.stringify({
		          input: this.state.input
		        }) //new lines
	    	})
	        .then(response => response.json())
	      	.then(response => {
		        if (response) {
		          fetch('https://secure-harbor-69642.herokuapp.com/image', {
		            method: 'put',
		            headers: {'Content-Type': 'application/json'},
		            body: JSON.stringify({
		              id: this.state.user.id
		            })
		          })
		            .then(response => response.json())
		            .then(count => {
		              this.setState(Object.assign(this.state.user, { entries: count}))
		            })
		            .catch(console.log);
		        }
		        this.displayFaceBox(this.calculateFaceLocation(response))
	      })
	      .catch(err => console.log(err));
	    }   

	  onRouteChange = (route) => {
	  	if(route === 'signout') {
	  		this.setState(initialState)
	  	} else if(route === 'home') {
	  		this.setState({isSignedIn: true})
	  	}
	  	this.setState({route: route})
	  }

	  render() {
	  	  const { isSignedIn, imageUrl, route, box } = this.state; //this.state.isSignedIn -> isSignedIn
		  return (
		    <div className="App">
		      <Particles className='particles'
		                params={particlesOptions} />
		      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
		      { route === 'home' 
			      ? <div> 
				      <Logo />
				      <Rank 
				      	name={this.state.user.name} 
				      	entries={this.state.user.entries} 
				      />
				      <ImageLinkForm 
				      	onInputChange={this.onInputChange} 
				      	onButtonSubmit={this.onButtonSubmit} 
				      />
				      <FaceRecognition 
				      	box={box} 
				      	imageUrl={imageUrl} 
				       />
				    </div>  
			      : (
				      	route === 'signin'
				      	? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
				      	: <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
			      	)
			  }
		    </div>
		  );
	  }
}

export default App;
