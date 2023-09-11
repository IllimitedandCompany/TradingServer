const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let dcurrentDate = day + "-" + month + "-" + year;
let currentDate = day + "/" + month + "/" + year;
let hour = date.getHours();
let minutes = date.getMinutes();
let seconds = date.getSeconds();
let currentTime = hour + ":" + minutes + ":" + seconds;

const oneDay = 1000 * 60 * 60 * 24;

function getExactTime() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const currentDate = `${day}/${month}/${year}`;
    const currentTime = `${hour}:${minutes}:${seconds}`;

    let exacttime = currentDate + " at " + currentTime;
    return exacttime;
}


module.exports = { 
	currentDate, 
	currentTime,
	year,
	month,
	day,
	hour,
	minutes,
	seconds,
	oneDay,
	getExactTime
};
	