import React, { Component } from 'react';

import './App.css';

import Slider from './components/Slider'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    }
  }
  render() {
    
    return (
      <div className="App">
        <span>{this.state.value}</span>
        <Slider value={6} step={0.001} min={25} max={300} valueChanged={v => {this.setState({value: v})}}></Slider>
      </div>
    );
  }
}

export default App;
