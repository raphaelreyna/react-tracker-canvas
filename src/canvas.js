import React from 'react';
import ReactDOM from 'react-dom';
import {intervalFromMinMax, intervalFromLenCen} from './make-interval.js';

/**
   A ReactJS reference.
   @typedef {Object} React.Ref
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
   An object containing information about a canvas.
   @typedef {Object} CanvasInfo
   @property {Object} ref - A ReactJS reference to the canvas element.
   @property {Object} element - A handle for the canvas element in the DOM.
   @property {number} width - The width of the canvas on the screen.
   @property {number} height - The height of the canvas on the screen.
   @property {number} computedWidth - The computed width of the canvas on the screen.
   @property {number} computedHeight - The computed height of the canvas on the screen.
   @property {Object} boundingClientRect - The rectangle that bounds the canvas element.
 */

/**
    Base class for component that tracks the mouse as it moves over a canvas.
    Subclasses should define redraw() method which will be called whenever the mouse moves and is being tracked.
    The redraw() method will be called right before the onMouseMoved callback is called.
   @prop {Props} props - The {@link Props} that are passed to this component.
   @prop {number} props.width - The width of the canvas. Default: 600.
   @prop {number} props.height - The height of the canvas. Default: 600.
   @prop {Method} props.onMouseMoved - Callback method for when the mouse mouse moves, if tracking. Default: ()=>{return}.
   @prop {Bounds} props.bounds - The {@link Bounds} that define the region in the plane over which we are tracking.
   @prop {Boolean} props.webgl - Will use 'WebGL' as the rendering context if true and '2d' otherwise. Default: false.
   @prop {Boolean} props.tracking - If true, this component will be in the tracking state as soon as it mounts.Default: false.
   @prop {Boolean} props.highRes - If true, the canvas will render at a 2x resolution. Default: true.
*/
class TrackerCanvas extends React.Component {
    /**
       Constructor for class.
       @constructor
       @param {Object} props - The props object used by ReactJS.
    */
    constructor(props) {
        super(props);
        /**
           An object that describes the coordinates of the mouse in the standard HTML5 canvas coordinate system.
           @prop {number} x - The x coordinate.
           @prop {number} y - The y coordinate.
        */
        this.rawMouse = {
            x: 0,
            y: 0
        };
        /**
           An object that describes the x and y coordinates of the mouse in the coordinate system defined by this.state.bounds;
           Subclasses can override this object by in the redraw() method.
           This is the position data that gets passed into the onMouseMoved callback.
           You may want to do this in order to send out additional data such as the angle or velocity.
           @prop {number} x - The x coordinate.
           @prop {number} y - The y coordinate.
        */
        this.mouse = null;
        /**
           An object that encapsulates everything we need regarding the canvas.
           @prop {Object} ref - A ReactJS reference to the canvas element.
           @prop {number} width - The width of the canvas passed in as a prop.
           @prop {number} height - The height of the canvas passed in as a prop.
           @prop {Object} element - The canvas element in the DOM.
           @prop {Object} context - The rendering context for the canvas. Can be either '2d' or 'WebGl' depending on the value of the WebGL prop.
           @prop {number} computedWidth - The computed width of the canvas obtained from the window.
           @prop {number} computedHeight - The computed height of the canvas obtained from the window.
           @prop {Object} boundingClientRect - The smallest rectangle that completely contains the canvas in the windows coordinate system.
        */
        this.canvas = {
            ref: React.createRef(),
            height: props.height,
            width: props.width,
            element: null,
            context: null,
            computedWidth: null,
            computedHeight: null,
            boundingClientRect: null
        };
        /**
           The state member which is used by ReactJS.
           @prop {Bounds} bounds - The {@link Bounds} that define which region of the plane we want to map this.mouse into. This allows us to simulate tracking over an arbitrary region of the cartesian plane.
        */
        this.state = {bounds: props.bounds};
        this.webgl = props.webgl ?  'webgl' : '2d';
        this.tracking = props.tracking;
        /**
           Callback used to report the mouse location on the canvas. Gets called whenever the mouse position changes, wether by changing the boundaries or moving the mouse.
           @param {Object} mouse - The mouse object that contains the x and y coordinates of the mouse. Subclasses may have changed this object to have different properties.
        */
        this.onMouseMoved = props.onMouseDidMove;
    }

    componentDidMount() {
        this.updateCanvasInfo()
            .initCanvas()
            .setHighRes();
        window.addEventListener("resize", this.updateCanvasInfo.bind(this));
        return this;
    }

    /**
       Sets up the canvas once its mounted.
    */
    initCanvas() {
        this.canvas.element.addEventListener("click", this.handleClick.bind(this));
        this.canvas.element.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.context = this.canvas.element.getContext(this.webgl);
        return this;
    }

    /**
       Updates the canvas member object to reflect the current geometry.
    */
    updateCanvasInfo() {
        const canvas = this.canvas;
        canvas.element = ReactDOM.findDOMNode(this.canvas.ref.current);
        const computedStyle = window.getComputedStyle(canvas.element);
        canvas.computedWidth = parseFloat(computedStyle.width);
        canvas.computedHeight = parseFloat(computedStyle.height);
        canvas.boundingClientRect = canvas.element.getBoundingClientRect();
        return this;
    }

    /**
       Sets up canvas to render at a 2x resolution.
    */
    setHighRes() {
        if (this.props.highRes) {
            const canvas = this.canvas.element;
            const width = this.canvas.width;
            const height = this.canvas.height;
            canvas.width = 2*width;
            canvas.height = 2*height;
            canvas.style.width = width.toString()+"px";
            canvas.style.height = height.toString()+"px";
            this.canvas.context.scale(2,2);
        }
        return this;
    }

    /**
       Called whenever a click is detected in the canvas. Toggles this.tracking.
       @param {Object} event - A ReactJS synthetic event object.
    */
    handleClick() {
        this.tracking = !this.tracking;
    }

    /**
       Called whenever mouse movement is detected.
       @param {Object} event - A ReactJS synthetic event object.
    */
    handleMouseMove(event) {
        if (this.tracking) {
            this.setMouse(event)
                .redrawWrapper()
                .onMouseMoved(this.mouse);
        }
    }

    /**
       Called when mouse moves or geometry changes.
       Use to update both rawMouse and mouse.
       If no event is given, only mouse is updated.
       @param {Object} event - A ReactJS synthetic event object.
    **/
    setMouse(event) {
        const canvas = this.canvas;
        if (event) {
            const boundingRect = canvas.boundingClientRect;
            this.rawMouse = {
                x: event.clientX - boundingRect.left,
                y: event.clientY - boundingRect.top
            };
        }
        const mouse = this.rawMouse;
        const h = this.state.bounds.horizontal;
        const v = this.state.bounds.vertical;
        this.mouse = {
            x: h.length*mouse.x/canvas.computedWidth+h.min,
            y: v.max-v.length*mouse.y/canvas.computedHeight
        };
        return this;
    }

    render() {
        return (
            <canvas
                ref={this.canvas.ref}
                width={this.canvas.width}
                height={this.canvas.height}>
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
    width: 600,
    height: 600,
    webgl: false,
    highRes: true,
    bounds: {
        horizontal: intervalFromMinMax(0,1),
        vertical: intervalFromMinMax(0,1)
    },
    onMouseMoved: (pt)=>{return},
    tracking: false
};

export default TrackerCanvas;
