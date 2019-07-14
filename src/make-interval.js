/**
   Use this method to make an {@link Interval} by giving its min and max values.

   @param {number} min - Needs to be strictly less than the max parameter.
   @param {number} max - Needs to be strictly greater than the min parameter.
   @return {Interval} A newly minted {@link Interval}.
*/
function intervalFromMinMax(min, max) {
    if (max <= min) {
        throw new Error('Max needs to be greater then min!');
    }
    return {
        min: min,
        max: max,
        length: max-min,
        center: (max+min)/2
    };
}

/**
   Use this method to make an {@link Interval} by giving its center and length.

   @param {number} length - The length of the interval. Needs to be strictly greater than zero.
   @param {number} center - The center of the interval.
   @return {Interval} A newly minted {@link Interval}.
 */
function intervalFromLenCen(length, center) {
    if (length <= 0) {
        throw new Error('Length needs to be strictly greater than zero!');
    }
    return {
        min: center-length/2,
        max: center+length/2,
        length: length,
        center: center
    };
}

export {intervalFromLenCen, intervalFromMinMax}
