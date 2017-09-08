//function to test request parameters
/*params: {
    <array for integers> integ: [{val: 22, minVal: 0, maxVal: 100}, {...}, ...]
    <array for strings> strs: [{val: "ad", minLen: 0, maxLen: 100}, {...}, ...]
    <array for emails> emails: [{val: "a@d.c", minLen: 0, maxLen: 100}, {...}, ...]
    <array for dates> dates: [{val: nodeJs Date, above18: boolean}, {...}, ...]
    <array for genders> genders: [{val: "M/F/O"}, {...}, ...]
 }
 */
function reqParams(params) {
    if (params['integ'] !== undefined) {
        let integ = params['integ'];
        if(integ.length === 0){
            return "invalid integer values";
        }
        for (obj of integ) {
            if (obj.val === undefined || obj.val < obj.minVal || obj.val > obj.maxVal) {
                return "invalid integer values";
            }
        }
    }

    if (params['strs'] !== undefined) {
        
        let strs = params['strs'];
        if(strs.length === 0){
            return "invalid string values";
        }
        for (obj of strs) {
            if (!obj.val || obj.val.length < obj.minLen || obj.val.length > obj.maxLen) {
                return "invalid string values";
            }
        }
    }

    if (params['emails'] !== undefined) {
        let emails = params['emails'];
        if(emails.length === 0){
            return "invalid email values";
        }
        for (obj of emails) {
            if (!obj.val || obj.val.length < obj.minLen || obj.val.length > obj.maxLen) {
                return "invalid email values";
            }
            let indexOfAt = obj.val.indexOf('@'), indexOfDot = obj.val.lastIndexOf('.');
            if (indexOfAt <= 0 || (indexOfAt + 1) >= indexOfDot) {
                return "invalid email values";
            }
        }
    }

    if (params['dates'] !== undefined) {
        let dates = params['dates'];
        if(dates.length === 0){
            return "invalid date values";
        }
        for (obj of dates) {
            if (!obj.val.valueOf()) {
                return "invalid date values";
            }
            if (obj.above18) {
                if (((new Date()) - obj.val.valueOf()) < 568025136000) {
                    return "invalid date values";
                }
            }
        }
    }

    if (params['genders'] !== undefined) {
        let genders = params['genders'];
        if(genders.length === 0){
            return "invalid gender values";
        }
        for (obj of genders) {
            if (!obj.val || (obj.val !== 'M' && obj.val !== 'F' && obj.val !== 'O')) {
                return "invalid gender values";
            }
        }
    }

    return undefined;
}

module.exports = reqParams;