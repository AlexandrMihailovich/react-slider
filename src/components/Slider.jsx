import React, { Component } from 'react';

import './Slider.css';

function resizeThrottlerFactory(callback = (e) => {}) {
    let resizeTimeout;
    return (e) => {
        if ( !resizeTimeout ) {
            resizeTimeout = setTimeout(() => {
                resizeTimeout = null;
                callback(e);
            }, 66);
        }
    }
}

class Slider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFocus: false,
            position: 0,
            max: this.props.max || 100,
            min: this.props.min || 1,
            value: this.props.value || 1,
            stepValue: this.props.step || 0.1,
            sliderRect: {width:100}
        }

        this.slider = React.createRef();
        this.sliderDot = React.createRef();

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleFocusOut = this.handleFocusOut.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleSetValue = this.handleSetValue.bind(this);
    }

    handleSetValue(e) {
        this.handleMouseMove(e)
    }

    handleMouseDown(e) {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);

        document.addEventListener('touchmove', this.handleMouseMove, { passive: false });
        document.addEventListener('touchend', this.handleMouseUp);
        document.addEventListener('touchcancel', this.handleMouseUp);
    }

    handleMouseUp(e) {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);

        document.removeEventListener('touchmove', this.handleMouseMove, { passive: false });
        document.removeEventListener('touchend', this.handleMouseUp);
        document.removeEventListener('touchcancel', this.handleMouseUp);
    }

    handleMouseMove(e) {
        const sliderRect = this.slider.current.getBoundingClientRect();

        if(!this.state.isFocus)
            this.sliderDot.current.focus()

        let position = e.clientX - sliderRect.left;

        const touches = e.touches;

        if (touches && touches.length) {
            const finger = touches[0];
            position = finger.clientX  - sliderRect.left

        }
        this.calcValue(position);
    }

    handleKeyDown(e) {
        switch(e.keyCode) {
            case 39: //ArrowRight
                this.nextStep()
                break;
            case 37: //ArrowLeft
                this.prevStep();
                break;
            default:
                return false;
        }
    }

    handleFocus(e) {
        this.setState({isFocus: true});

        document.addEventListener('keydown', this.handleKeyDown)
    }

    handleFocusOut(e) {
        this.setState({isFocus: false});

        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleResize(e) {
        this.calcPosition(this.state.value);
    }

    componentDidMount() {
        this.calcPosition(this.state.value);
        window.addEventListener("resize", 
                resizeThrottlerFactory(this.handleResize), false);
    }

    calcValue(position) {
        const sliderRect = this.slider.current.getBoundingClientRect();
        position = position <= sliderRect.width ? position : sliderRect.width;
        position = position <= 0 ? 0 : position;

        const value = this.range(position, 
            0, sliderRect.width,  
            this.state.min, this.state.max);
        
        this.setState({sliderRect, value})
        this.calcPosition(value);
        return value;
    }

    raundValue() {
        return Math.round(this.state.value * (1 / this.state.stepValue)) / (1 / this.state.stepValue);
    }

    calcPosition(value) {
        const sliderRect = this.slider.current.getBoundingClientRect();
        const position = this.range(value, 
            this.state.min, this.state.max, 
            0, sliderRect.width);
        this.setState({position, sliderRect})
        this.props.valueChanged(this.raundValue());
        return position;
    }

    nextStep() {
        let value = this.state.value + this.state.stepValue;
        value = value >= this.state.max ? this.state.max : value;
        this.setState({value},
            () => this.calcPosition(value));
    }

    prevStep() {
        let value = this.state.value - this.state.stepValue;
        value = value <= this.state.min ? this.state.min : value;
        this.setState({value},
            () => this.calcPosition(value));
    }

    range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
  render() {
    const position = this.state.position;
    return (
        <div>
      <div 
        ref={this.slider} 
        className="Slider"
        onClick={this.handleSetValue}
        >
        <div className="Slider-Progress" style={{width: position}}>
        <div
            tabIndex="0"
            ref={this.sliderDot} 
            className={`Slider-Dot${this.state.isFocus ? ' Slider-Dot_active' : ''}`}
            onMouseDown={this.handleMouseDown}
            onTouchStart={this.handleMouseDown}
            onFocus={this.handleFocus}
            onBlur={this.handleFocusOut}
            ></div>
            </div>
      </div>
      </div>
    );
  }
}

export default Slider;
