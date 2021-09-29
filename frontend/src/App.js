import {useState} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';

const API_KEY = process.env.REACT_APP_API_KEY;

const app = new Clarifai.App({
  apiKey: API_KEY
 });

const particlesOptions = {
  "particles": {
    "number": {
        "value": 150,
        "density": {
            "enable": true,
            "value_area": 800
        }
    },
    "line_linked": {
        "enable": false
    },
    "move": {
        "speed": 10,
        "out_mode": "out"
    },
    "shape": {
        "type": [
            "image",
            "circle"
        ],
    },
    "color": {
        "value": "#CCC"
    },
    "size": {
        "value": 30,
        "random": false,
        "anim": {
            "enable": true,
            "speed": 5,
            "size_min": 10,
            "sync": false
        }
    }
},
"interactivity" : {
  "events": {
    "onhover": {
      "enable": true,
      "mode": "repulse"
    }
  }
},
"retina_detect": false
}

function App() {
  const [state, setState] = useState({input: '', imageUrl: ''});
  const [user, setUser] = useState({
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
  })
  const [boxes, setBoxes] = useState([]);
  const [route, setRoute] = useState('signin');
  const [isSignedIn, setIsSignedIn] = useState(false);

  const loadUser = (data) => {
    setUser({ 
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
    })
  }
  
  const calculateFaceLocation = (data) => {
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const boxes = data.outputs[0].data.regions.map(region => {
      return {
        leftCol: region.region_info.bounding_box.left_col * width,
        topRow: region.region_info.bounding_box.top_row * height,
        rightCol: width -  (region.region_info.bounding_box.right_col * width),
        bottomRow : height - (region.region_info.bounding_box.bottom_row * height)
      }
    });
    
    return boxes;
  }

  const displayFaceBox = (boxes) => {
    setBoxes(boxes);
  }

  const onInputChange = (event) => {
    setState({input: event.target.value});
  }

  const onSubmit = () => {
    setState({imageUrl: state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        state.input
      )
      .then((response) => {
        if(response) {
          fetch('http://localhost:5000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: user.id
            })
          })
          .then(response => response.json())
          .then(count => setUser(Object.assign(user, {entries: count})))
          .catch(console.log)
        }
        displayFaceBox(calculateFaceLocation(response));
      })
      .catch((err) => {
        console.log(err);
      })
  }

  const onRouteChange = (route) => {
    if(route === 'signout') {
      setIsSignedIn(false);
      setRoute('signin')
      setUser({
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      })
      setState({input: '', imageUrl: ''});
      setBoxes([]);
    }else if (route === 'home') {
      setIsSignedIn(true);
    }
    setRoute(route);
  }

  return (
    <div className="App">
      <Particles className="particles" 
        params={particlesOptions}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === 'signin' && <Signin onRouteChange={onRouteChange} loadUser={loadUser} />}
      {route === 'signout' && <Signin onRouteChange={onRouteChange} />}
      {route === 'register' &&  <Register onRouteChange={onRouteChange} loadUser={loadUser} />}
      {route === 'home' && (
      <>
        <Logo />
        <Rank name={user.name} entries={user.entries} />
        <ImageLinkForm 
          onInputChange={onInputChange}
          onSubmit={onSubmit }
        />
        <FaceRecognition boxes={boxes} imageUrl={state.imageUrl} />
      </> 
      )}
      
    </div>
  );
}

export default App;
