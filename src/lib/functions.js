function generateRandomEquation() {
	let [x, y] = [Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1)];
	let z = ['+', '-', '*'];
	let rand = Math.floor(Math.random() * z.length);
	let answer = eval(`${x}${z[rand]}${y}`);

	return `${x} ${z[rand]} ${y} = ${answer}`;
}

generateRandomEquation();

function printAndAddLetters(str, interval) {
	let result = '';
	for (let i = 0; i < str.length; i++) {
		setTimeout(() => {
			result += str[i];
			console.log(result);
		}, i * interval);
	}
}

// Example usage
printAndAddLetters('Hello, World!', 100);
