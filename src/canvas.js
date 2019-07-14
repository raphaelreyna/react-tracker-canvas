import React from 'react';
import ReactDOM from 'react-dom';
import {intervalFromMinMax, intervalFromLenCen} from './make-interval.js';
/**
   Properties passed to components in ReactJS.
   Used to pass properties to components. 

   @typedef {Object} Props
 */

/**
   Describes an interval on the number line.

   @typedef {Object} Interval
   @property {number} min - The lower bound of the interval.
   @property {number} max - The upper bound of the interval.
   @property {number} length - The length of the interval.
   @property {number} center - The center of the interval.
 */
/**
   Two intervals which define a square region in the plane.

   @typedef {Object} Bounds
   @property {Interval} horizontal - The {@link Interval} on the horizontal axis.
   @property {Interval} vertical - The {@link Interval} on the vertical axis.
*/

/**
   A pair of numbers describing the width and heing dimensions on a rectangle.
   @typedef {Object} Dimensions
   @property {number} width - The width of the rectangle.
   @property {number} height - The height of the rectangle.
 */

/**
   A pair of numbers describing a point on the plane.
   @typedef {Object} Point
   @property {number} x - The x-coordinate of the point.
   @property {number} y - The y-coordinate of the point.
*/

/**
   An object containing information about a canvas.
   @typedef {Object} CanvasInfo
   @property {Object} ref - A ReactJS reference to the canvas element.
   @property {Object} element - A handle for the canvas element in the DOM.
   @property {number} computedWidth - The computed width of the canvas on the screen.
   @property {number} computedHeight - The computed height of the canvas on the screen.
   @property {Object} boundingClientRect - The rectangle that bounds the canvas element.
 */


/**
    Base class for component that tracks the mouse as it moves over a canvas.
    Subclasses should define redraw() method which will be called whenever the mouse moves and is being tracked.
    The redraw() method will be called right before the onMouseMoved callback is called.
*/

class TrackerCanvas extends React.Component {
    /**
       Constructor for class.
       @constructor
       @prop {Props} props - The {@link Props} that are passed to this component.
       @prop {Dimensions} props.canvasDimensions - The {@link Dimensions} of the canvas.
       @prop {Method} props.onMouseMoved - Callback method for when the mouse mouse moves, if tracking.
       This method will be passed an the return value of 'formatOutput'.
       @prop {Bounds} props.bounds - The {@link Bounds} that define the region in the plane over which we are tracking.

       @prop {Point} rawMouse - The {@link Point} that describes the coordinates of the mouse in the standard HTML5 canvas coordinate system.
       @prop {Point} mouse - The {@link Point} that describes the coordinates of mouse mapped onto the region described by the props.bounds property.
       @prop {CanvasInfo} canvas - The {@link CanvasInfo} for the canvas to which we will be rendering and tracking over.
       @prop {Boolean} mounted - Flag that tells us whether or not the component is mounted.
       @prop {Boolean} tracking - Flag that tells us whether or not we should track the mouse's position in the canvas.
    */
    constructor(props) {
        super(props);
        this.rawMouse = {
            x: 0,
            y: 0
        };
        this.mouse = null;
        this.canvas = {
            ref: React.createRef(),
            element: null,
            context: null,
            computedWidth: null,
            computedHeight: null,
            boundingClientRect: null
        };
        this.bounds = props.bounds;
        this.mounted = false;
        this.tracking = false;
        this.onMouseMoved = props.onMouseMoved;
    }

    updateCanvasInfo() {
        const canvas = this.canvas;
        canvas.element = ReactDOM.findDOMNode(this.canvas.ref.current);
        canvas.context = this.canvas.element.getContext('2d');
        const computedStyle = window.getComputedStyle(canvas.element);
        canvas.computedWidth = parseFloat(computedStyle.width);
        canvas.computedHeight = parseFloat(computedStyle.height);
        canvas.boundingClientRect = canvas.element.getBoundingClientRect();
        return this;
    }

    initCanvas() {
        this.canvas.element.addEventListener("click", this.handleClick.bind(this));
        this.canvas.element.addEventListener("mousemove", this.handleMouseMove.bind(this));
        window.addEventListener("resize", this.updateCanvasInfo.bind(this));
        return this;
    }

    setHighRes() {
        const canvas = this.canvas.element;
        canvas.width = 2*this.props.canvasDimensions.width;
        canvas.height = 2*this.props.canvasDimensions.height;
        canvas.style.width = this.props.canvasDimensions.width.toString()+"px";
        canvas.style.height = this.props.canvasDimensions.height.toString()+"px";
        this.canvas.context.scale(2,2);
        return this;
    }

    componentDidMount() {
        this.updateCanvasInfo()
            .initCanvas()
            .setHighRes()
            .mounted = true;
        return this;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleClick() {
        this.tracking = !this.tracking;
    }

    setMouse() {
        const mouse = this.rawMouse;
        const h = this.bounds.horizontal;
        const v = this.bounds.vertical;
        const canvas = this.canvas;
        this.mouse = {
            x: h.length*mouse.x/canvas.computedWidth+h.min,
            y: v.max-v.length*mouse.y/canvas.computedHeight
        };
        return this;
    }

    handleMouseMove(event) {
        if (this.tracking) {
            const canvas = this.canvas;
            const boundingRect = canvas.boundingClientRect;
            this.rawMouse = {
                x: event.clientX - boundingRect.left,
                y: event.clientY - boundingRect.top
            };
            this.setMouse()
                .redrawWrapper()
                .onMouseMoved(this.mouse);
        }
    }

    render() {
        return (
            <canvas
                ref={this.canvas.ref}
                width={this.props.canvasDimensions.width}
                height={this.props.canvasDimensions.height}>
            </canvas>
        );
    }

    /**
       Override this function in a subclass to draw.
       This method gets called right after the mouse position has been updated and right before the 'onMouseMoved' callback is called with the mouses position.
       You can also use this method to modify the mouse position before it is passed to the onMouseMoved callback.
       @example
       redraw() {
       const x = this.rawMouse.x;
       const y = this.rawMouse.y;
       this.canvas.context.fillRect(x, y, 10, 10);
       }
    */
    redraw() {}

    redrawWrapper() {
        this.redraw();
        return this;
    }
}

TrackerCanvas.defaultProps = {
    bounds: {
        horizontal: intervalFromMinMax(0,1),
        vertical: intervalFromMinMax(0,1)
    },
    onMouseMoved: (pt)=>{return}
};

export default TrackerCanvas;