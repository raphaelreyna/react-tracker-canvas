import React from 'react';
import {TrackerCartesianPlane, intervalFromLenCen} from '../../src';
import {render} from 'react-dom';

class Labels extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            rLabel: props.rLabel,
            tLabel: props.xLabel
        }
    }

    render() {
        const rLabel = parseFloat(this.state.rLabel).toFixed(4);
        var tLabel = parseFloat(this.state.tLabel)/3.1415962;
        tLabel = tLabel.toFixed(2);
        return (
            <React.Fragment>
                <span>{"r = "}{rLabel}</span>
                <br/>
                <span>{"\u03B8 = "}{tLabel.toString()+"\u03C0"}</span>
            </React.Fragment>
        );
    }
}

class Controls extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            centerX: 0,
            centerY: 0,
            width: 2,
            mouseX: 0.5,
            mouseY: 0.5
        };
        this.callback = props.onSubmission;
    }

    handleSubmit(event) {
        event.preventDefault();
        const centerX = parseFloat(this.state.centerX);
        const centerY = parseFloat(this.state.centerY);
        const width = parseFloat(this.state.width);

        if (isNaN(centerX) || isNaN(centerY)) {
            alert('Please enter a valid center');
            return;
        }

        if (isNaN(width) || width <= 0) {
            alert('Please enter a valid width');
            return;
        }

        const submission = {
            centerX: centerX,
            centerY: centerY,
            width: width,
        };
        this.callback(submission);
    }

    handleMouseSubmit(event) {
        event.preventDefault();
        const mouseX = parseFloat(this.state.mouseX);
        const mouseY = parseFloat(this.state.mouseY);
        const width = parseFloat(this.state.width);

        if (isNaN(mouseX) || isNaN(mouseY)) {
            alert('Please enter a valid mouse position');
            return;
        }

        const submission = {
            mouseX: mouseX,
            mouseY: mouseY
        };
        this.callback(submission);
    }

    handleXChange(event) {
        this.setState({centerX: event.target.value});
    }

    handleYChange(event) {
        this.setState({centerY: event.target.value});
    }

    handleMXChange(event) {
        this.setState({mouseX: event.target.value});
    }

    handleMYChange(event) {
        this.setState({mouseY: event.target.value});
    }

    handleWChange(event) {
        this.setState({width: event.target.value});
    }

    render() {
        return (
            <React.Fragment>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    {"CenterX = "}
                    <input type="text"
                           name="centerX"
                           value={this.state.centerX}
                           onChange={this.handleXChange.bind(this)}/>
                    <br/>
                    {"CenterY = "}
                    <input type="text"
                           name="centerY"
                           value={this.state.centerY}
                           onChange={this.handleYChange.bind(this)}/>
                    <br/>
                    {"Width = "}
                    <input type="text"
                           name="width"
                           value={this.state.width}
                           onChange={this.handleWChange.bind(this)}/>
                    <br/>
                    <input type="submit" value="Submit"/>
                </form>
                <form onSubmit={this.handleMouseSubmit.bind(this)}>
                    {"MouseX = "}
                    <input type="text"
                           name="mouseX"
                           value={this.state.mouseX}
                           onChange={this.handleMXChange.bind(this)}/>
                    <br/>
                    {"MouseY = "}
                    <input type="text"
                           name="mouseY"
                           value={this.state.mouseY}
                           onChange={this.handleMYChange.bind(this)}/>
                    <br/>
                    <input type="submit" value="Submit"/>
                </form>
            </React.Fragment>
        );
    }
}

class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.labelsRef = React.createRef();
        this.planeRef = React.createRef();
        this.onMouseMoved = this.onMouseMoved.bind(this);
        this.planeCamera = {
            cameraCenter: {
                x: 0, y: 0
            },
            cameraWidth: 2
        };
    }

    onMouseMoved(mouse) {
        this.labelsRef.current.setState({
            rLabel: mouse.abs,
            tLabel: mouse.arg
        });
    }

    handleSubmission(data) {
        var state= {};
        if (data.mouseX != null && data.mouseY != null) {
            state.mouse = {
                x: data.mouseX,
                y: data.mouseY
            };
        }
        if (data.centerX != null && data.centerY != null) {
            state.bounds = {
                horizontal: intervalFromLenCen(data.width, data.centerX),
                vertical: intervalFromLenCen(data.width, data.centerY)
            };
        }
        this.planeRef.current.setState(state);
    }

    render() {
        const c = this.planeCamera.cameraCenter;
        const w = this.planeCamera.cameraWidth;
        return (
            <div>
            <TrackerCartesianPlane
                ref={this.planeRef}
                width={500} height={500}
                onMouseMoved={this.onMouseMoved}
                bounds={{
                    horizontal: intervalFromLenCen(w,c.x),
                    vertical: intervalFromLenCen(w,c.y),
                }}
            />
            <br/>
            <Labels ref={this.labelsRef}
                    xLabel={"x is undefined"}
                    yLabel={"y is undefined"}/>
            <Controls onSubmission={this.handleSubmission.bind(this)}/>
            </div>
        );
    }
}

render(<Demo/>, document.querySelector('#demo'));
