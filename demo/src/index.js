import React from 'react';
import {ControlledTrackerPlane} from '../../src';
import {render} from 'react-dom';

class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            xLabel: "x is currently undefined.",
            yLabel: "y is currently undefined."
        };
        this.onMouseMoved = this.onMouseMoved.bind(this);
    }

    onMouseMoved(mouse) {
        this.setState({
            xLabel: "x = "+mouse.cartesian.x.toString(),
            yLabel: "y = "+mouse.cartesian.y.toString()
        });
        console.log(this.state.xLabel);
    }

    render() {
        return (
            <div>
            <ControlledTrackerPlane
                canvasDimensions={{width: 500, height: 500}}
                onMouseMoved={this.onMouseMoved}
            />
            <h4>{this.state.xLabel}</h4>
            <h4>{this.state.yLabel}</h4>
            </div>
        );
    }
}

render(<Demo/>, document.querySelector('#Demo'));
