// src/lib/functions.js
export function getTodaysDateFormatted() {
	const date = new Date();
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const month = months[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();

	let suffix = 'th';
	if (day === 1 || day === 21 || day === 31) suffix = 'st';
	else if (day === 2 || day === 22) suffix = 'nd';
	else if (day === 3 || day === 23) suffix = 'rd';

	return `${month} ${day}${suffix} ${year}`;
}
