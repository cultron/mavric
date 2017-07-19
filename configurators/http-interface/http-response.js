module.exports = (status) => {
    //Check for 2xx or 3xx
    if (status.toString().charAt(0) === '2' || status.toString().charAt(0) === '3') {
        return true;
    } else {
        return false;
    }
};
