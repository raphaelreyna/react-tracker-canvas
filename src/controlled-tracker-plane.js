import TrackerCartesianPlane from './cartesian-plane.js';
import TrackerCanvas from './canvas.js';
import {intervalFromLenCen} from './make-interval.js';
import React from 'react';

class ControlledTrackerPlane extends TrackerCartesianPlane {
    constructor(props) {
        super(props);
        this.state = {
            centerX: "0",
            centerY: "0",
            radius: "1",
            absLabel: "-",
            argLabel: "-",
            xLabel: "-",
            yLabel: "-"
        };
        this.handleCenterXChange = this.handleCenterXChange.bind(this);
        this.handleCenterYChange = this.handleCenterYChange.bind(this);
        this.handleRadiusChange = this.handleRadiusChange.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        const length = parseFloat(this.state.radius);
        let centerX = parseFloat(this.state.centerX);
        let centerY = parseFloat(this.state.centerY);

        if (isNaN(centerX) || isNaN(centerY)) {
            alert('Please enter a valid center');
            return;
        }

        this.bounds = {
            horizontal: intervalFromLenCen(length*2, centerX),
            vertical: intervalFromLenCen(length*2, centerY)
        };
        this.setMouse();
        this.updateGeometry();
        this.redraw();
        this.onMouseMoved(this.mouse);
    }

    handleCenterXChange(event) {
        this.setState({centerX: event.target.value});
    }

    handleCenterYChange(event) {
        this.setState({centerY: event.target.value});
    }

    handleRadiusChange(event) {
        this.setState({radius: event.target.value});
    }

    render() {
        return (
                <div>
                <canvas
                ref={this.canvas.ref}
                width={this.props.canvasDimensions.width}
                height={this.props.canvasDimensions.height}>
                </canvas>
                <div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                {"centerX = "}<input type="text" name="centerX" value={this.state.center} onChange={this.handleCenterXChange}/>
                {"centerY = "}<input type="text" name="centerY" value={this.state.center} onChange={this.handleCenterYChange}/>
                <input type="text" name="radius" value={this.state.radius} onChange={this.handleRadiusChange}/>
                <input type="submit" value="Submit"/>
                </form>
                </div>
                </div>
        );
    }
}

export default ControlledTrackerPlane;
