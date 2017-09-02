//function to test request parameters
/*params: {
    <array of integers> integ: [{val: 22, min: 0, max: 100}, {...}, ...]
 }
 */
function reqParams(params, cb) {
    let integ;
    if (integ = params['integ']) {
        for (obj of integ) {
            if (obj.val < obj.min || obj.val > obj.max) {
                return "invalid integer values";
            }
        }
    }


    return undefined;
}