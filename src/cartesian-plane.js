import TrackerCanvas from './canvas.js';
import {intervalFromMinMax, intervalFromLenCen} from './make-interval.js';

/**
   Tracks the mouse in a region of the complex plane.
   @constructor
   @param {Object} props - The props object used by ReactJS.
*/
class TrackerCartesianPlane extends TrackerCanvas {
    /**
       Constructor for class.
       @constructor
       @prop {Props} props - The {@link Props} that are passed to this component.
       @prop {number} props.width - The width of the canvas. Default: 500.
       @prop {number} props.height - The height of the canvas. Default: 500.
       @prop {String} id - The id to pass to the canvas html element. Default: 'cartesianPlane'.
       @prop {Method} props.onMouseMoved - Callback method for when the mouse mouse moves, if tracking. Default: ()=>{return}.
       @prop {Bounds} props.bounds - The {@link Bounds} that define the region in the plane over which we are tracking.
       @prop {Boolean} props.webgl - Will use 'WebGL' as the rendering context if true and '2d' otherwise. Default: false.
       @prop {Boolean} props.tracking - If true, this component will be in the tracking state as soon as it mounts.Default: false.
       @prop {Boolean} props.highRes - If true, the canvas will render at a 2x resolution. Default: true.
       @prop {number} props.circleRadius - The radius of the circle drawn at the origin. Default: 1.
       @prop {String} props.circleStyle - The style of the circle drawn at the origin. Default: 'rgb(0,0,0)'.
       @prop {String} props.axesStyle - The style for the vertical and horizontal axes. Default: 'rgb(0,0,0)'.
       @prop {String} props.pointStyle - The style for the point which shows the mouse position on the canvas. Default: 'rgb(200,0,0)'.
       @prop {number} props.pointSize - The size for the point which shows the mouse position on the canvas. Default: 4.
       @prop {Boolean} props.drawCircle - If true, a circle will be drawn at the origin. Default: true.
       @prop {Boolean} props.drawHAxis - If true, the horizontal axis will be drawn. Default: true.
       @prop {Boolean} props.drawVAxis - If true, the vertical axis will be drawn. Default: true.
       @prop {Boolean} props.drawLineFromOrigin - If true, a line will be drawn from the origin to the mouse position. Default: true.
       @prop {Boolean} props.drawAbsLabel - If true, the distance from the origin will be shown above the line. Default: false.
       @prop {Boolean} props.drawAngleMarker - If true, an arc from the horizontal axis to the line from the origin to the mouse will be drawn. Default: true.
       @prop {Boolean} props.drawArgLabel - If true, a label showing the current angle will be drawn by the angle marker. Default: false.
       @prop {Boolean} props.drawHGuide - If true, a vertical line will be drawn from the mouse to the horizontal axis. Default: true.
       @prop {Boolean} props.drawHLabel - If true, a label showing the mouses x coordinate will be drawn. Default: true.
       @prop {Boolean} props.drawVGuide - If true, a horizontal line will be drawn from the mouse to the vertical axis. Default: true.
       @prop {Boolean} props.drawVLabel - If true, a label showing the mouses y coordinate will be drawn. Default: true.
       @prop {Boolean} props.drawPoint - If true, a point will be drawn at the mouses position. Default: true.
       @prop {Boolean} props.drawPolarLabel - If true, a label showing the mouse's polar coordinates will be drawn. Default: false.
       @prop {number} props.decimalPlaces - The number of decimal places to use for labels. Default: 3.
       @prop {String} props.font - If true, the font to be used for labels. Default: '13px Georgia'.
    */
    constructor(props) {
        super(props)
        /**
           An object containing the polar coordinates of the mouse.
           @prop {number} abs - The distance from the point to the origin. Also called the modulus.
           @prop {number} arg - The angle between the horizontal axis and the ray from the origin to the point. This value is in radians and has the range [0, 2Pi).
        */
            .polarMouse = null;
        this.scale = {h: null, v: null};
        this.origin = {x: null, y: null};
    }

    componentDidMount() {
        super.componentDidMount()
             .redraw();
             // .clear()
             // .drawHAxis().drawVAxis()
             // .drawCircle();
        return this;
    }

    updateGeometry() {
        const h = this.state.bounds.horizontal;
        const v = this.state.bounds.vertical;
        const width = this.canvas.computedWidth;
        const height = this.canvas.computedHeight;
        this.scale = {
            h: width/(h.max-h.min),
            v: height/(v.max-v.min)
        };
        this.origin = {
            x: 0-this.scale.h*h.min,
            y: height+this.scale.v*v.min
        };
        return this;
    }

    clear() {
        const canvas = this.canvas;
        const ctx = canvas.context;
        ctx.save();
        ctx.clearRect(0, 0, canvas.computedHeight, canvas.computedHeight);
        ctx.restore();
        return this;
    }

    drawHAxis() {
        if (this.props.drawHAxis) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const width = canvas.computedWidth;
            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = this.props.axesStyle;
            ctx.beginPath();
            ctx.beginPath();
            ctx.moveTo(0, this.origin.y);
            ctx.lineTo(width, this.origin.y);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        };
        return this;
    }

    drawVAxis() {
        if (this.props.drawVAxis) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const height = canvas.computedHeight;
            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = this.props.axesStyle;
            ctx.beginPath();
            ctx.moveTo(this.origin.x, 0);
            ctx.lineTo(this.origin.x, height);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        return this;
    }

    drawCircle() {
        if (this.props.drawCircle) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            let scale = this.scale.h;
            if (scale > this.scale.v) {
                scale = this.scale.v;
            }
            scale *= 0.995;
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = this.props.circleStyle;
            ctx.arc(this.origin.x, this.origin.y, scale*this.props.circleRadius, 0, 2 * Math.PI, true);
            ctx.stroke();
            ctx.closePath();
        }
        return this;
    }

    drawAbsGuide() {
        if (this.props.drawLineFromOrigin){
            const canvas = this.canvas;
            const ctx = canvas.context;
            const mouse = this.rawMouse;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.origin.x, this.origin.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "#FF6A6A";
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        return this;
    }

    drawAbsLabel() {
        if (this.props.drawAbsLabel) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const width = canvas.computedWidth;
            const height = canvas.computedHeight;
            const mouse = this.rawMouse;
            let minDim = height;
            if (width < height) {
                minDim = width;
            }
            ctx.save();
            if (mouse.y > this.origin.y) {
                ctx.textBaseline = "top";
            } else {
                ctx.textBaseline = "ideographic";
            }
            ctx.translate(this.origin.x, this.origin.y);
            ctx.rotate(-this.polarMouse.arg);
            ctx.translate(minDim*0.125*this.polarMouse.abs, 0);
            if (mouse.x < this.origin.x) {
                ctx.rotate(Math.PI);
            }
            const text = "r = "+this.polarMouse.abs.toFixed(this.props.decimalPlaces);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
        return this;
    }

    drawArgGuide() {
        if (this.props.drawAngleMarker) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.origin.x, this.origin.y, 20, 0, (-1) * this.polarMouse.arg, true);
            ctx.strokeStyle = "#FF6A6A";
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        return this;
    }

    drawArgLabel() {
        if (this.props.drawArgLabel) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            ctx.save();
            ctx.translate(this.origin.x, this.origin.y);
            ctx.rotate(-0.9 * this.polarMouse.arg/2);
            ctx.translate(30, 0);
            ctx.fillText("θ", 0, 0);
            ctx.restore();
        }
        return this;
    }

    drawPoint() {
        if (this.props.drawPoint) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const mouse = this.rawMouse;
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, this.props.pointSize, 0, 2 * Math.PI, true);
            ctx.fillStyle = this.props.pointStyle;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
        return this;
    }

    drawPolarLabel() {
        if (this.props.drawPolarLabel) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const mouse = this.rawMouse;
            ctx.save();
            ctx.beginPath();
            ctx.translate(mouse.x, mouse.y);
            ctx.rotate(-1*this.polarMouse.arg**1.1);
            let trans = 10*this.polarMouse.arg+8;
            if (trans >= 30) {
                trans = 30;
            }
            ctx.translate(trans, 0);
            ctx.rotate(this.polarMouse.arg**1.1);
            ctx.fillText("(1,0)", 0, 0);
            ctx.closePath();
            ctx.restore();
        }
        return this;
    }

    drawHGuide() {
        if (this.props.drawHGuide) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const mouse = this.rawMouse;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(mouse.x, this.origin.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "#FF6A6A";
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        return this;
    }

    drawHLabel() {
        if (this.props.drawHLabel) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const mouse = this.rawMouse;
            ctx.save();
            ctx.font = this.props.font;
            let xOffset = 3;
            if (this.origin.y < this.canvas.computedHeight/2) {
                ctx.textBaseline = "top";
            } else {
                ctx.textBaseline = "bottom";
            }
            if (mouse.x < this.origin.x) {
                ctx.textAlign = "left";
            } else {
                ctx.textAlign = "right";
                xOffset *= -1;
            }
            const text = this.mouse.x.toFixed(this.props.decimalPlaces);
            let y = this.origin.y-2;
            if (y <= 2) {
                y = 2;
            }
            if (y >= canvas.computedHeight) {
                y = canvas.computedHeight - 3;
            }
            ctx.fillText(text, mouse.x+xOffset, y);
            ctx.restore();
        }
        return this;
    }

    drawVGuide() {
        if (this.props.drawVGuide) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const mouse = this.rawMouse;
            ctx.beginPath();
            ctx.moveTo(this.origin.x, mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "#FF6A6A";
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        return this;
    }

    drawVLabel() {
        if (this.props.drawVLabel) {
            const canvas = this.canvas;
            const ctx = canvas.context;
            const mouse = this.rawMouse;
            ctx.save();
            ctx.font = this.props.font;
            if (mouse.y < this.origin.y) {
                ctx.textBaseline = "top";
            } else {
                ctx.textBaseline = "bottom";
            }
            let x = this.origin.x+4;
            if (x <= 2) {
                x = 2;
            }
            if (x >= canvas.computedWidth) {
                x = canvas.computedWidth - this.props.decimalPlaces*13;
            }
            const text = this.mouse.y.toFixed(this.props.decimalPlaces);
            ctx.fillText(text, x, mouse.y);
            ctx.restore();
        }
        return this;
    }

    updatePolarMouse() {
        const mouse = this.mouse;
        let abs = Math.sqrt(mouse.x**2 + mouse.y**2);
        let arg = Math.atan2(-mouse.y, mouse.x);
        if (arg < 0) {
            arg *= (-1);
        } else if (arg> 0) {
            arg = 2 * Math.PI - arg;
        };
        this.polarMouse = {abs: abs, arg: arg};
        this.mouse.abs = abs;
        this.mouse.arg = arg;
        return this;
    }

    redraw() {
        this.updatePolarMouse()
            .clear()
            .drawCircle()
            .drawHAxis().drawVAxis()
            .drawAbsGuide().drawAbsLabel().drawArgGuide().drawArgLabel().drawHGuide().drawHLabel().drawVGuide().drawVLabel()
            .drawPoint().drawPolarLabel();
    }
}

TrackerCartesianPlane.defaultProps = {
    width: 500,
    height: 500,
    id: "cartesianCanvas",
    webgl: false,
    highRes: true,
    bounds: {
        horizontal: intervalFromMinMax(-1, 1),
        vertical: intervalFromMinMax(-1, 1)
    },
    onMouseMoved: (pt)=>{return},
    mouseStartingPos: {x: 0.5, y: 0.5},
    tracking: false,
    circleRadius: 1,
    circleStyle: 'rgb(0,0,0)',
    axesStyle: 'rgb(0,0,0)',
    pointStyle: 'rgb(200,0,0)',
    pointSize: 4,
    drawCircle: true,
    drawHAxis: true,
    drawVAxis: true,
    drawLineFromOrigin: true,
    drawAbsLabel: false,
    drawAngleMarker: true,
    drawArgLabel: false,
    drawHGuide: true,
    drawHLabel: true,
    drawVGuide: true,
    drawVLabel: true,
    drawPoint: true,
    drawPolarLabel: false,
    decimalPlaces: 3,
    font: '13px Georgia'
};

export default TrackerCartesianPlane;
