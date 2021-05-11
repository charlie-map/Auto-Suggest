const fs = require('fs');
const edit_amount = 2;

let words = fs.readFileSync("./all_trie_words.txt").toString().split("\n");

let trie = {
	load: 0,
	finished: 0, // how many words finish at this character
	childs: []
};

function insert(trie_level, word, word_position) {
	if (word_position < word.length) {
		//grab first character
		if (typeof trie_level.childs[word[word_position]] == "undefined") {
			let finished = word_position == word.length - 1 ? 1 : 0;
			trie_level.childs[word[word_position]] = {
				load: 0,
				finished: finished,
				childs: []
			};
		} else if (word_position == word.length - 1) trie_level.childs[word[word_position]].finished++;
		trie_level.childs[word[word_position]].load++;
		insert(trie_level.childs[word[word_position]], word, word_position + 1);
	}
	return trie_level;
}

let new_word = [];
for (let i = 0; i < words.length; i++) {
	//change to number values
	new_word = words[i].replace(/[^A-Za-z]/g, "").split("");
	//turn word into the ascii characters
	if (new_word.length < 3) continue;
	for (let word = 0; word < new_word.length; word++) {
		new_word[word] = new_word[word].toLowerCase().charCodeAt(0) - 97;
	}
	trie = insert(trie, new_word, 0);
}

function build_array(word1, word2) {
	let return_array = [];
	for (let x = 0; x < word1.length + 1; x++) {
		return_array[x] = [];
		for (let y = 0; y < word2.length + 1; y++) {
			return_array[x][y] = 0;
			return_array[0][y] = y;
			return_array[x][0] = x;
		}
	}
	return return_array;
}

/* Function new_array:
	inputs: curr_array - the current array of the word
			full_word - the word that runs along the x-axis
			new_char - the character that we are adding onto the array
	the thought: add a new row onto the curr_array
	output: new_array - new built row
*/
function new_array(curr_array, full_word, new_char) {
	let pre_add_row = curr_array[0].length - 1;
	curr_array[0].push(pre_add_row + 1);
	console.log("\narray");
	printMultiArray(curr_array);
	for (let x = 1; x < full_word.length + 1; x++) {
		console.log("\nrunning", x, pre_add_row, full_word[x - 1] == new_char);
		printMultiArray(curr_array);
		console.log("with min", curr_array[x - 1][pre_add_row], curr_array[x][pre_add_row - 1], curr_array[x - 1][pre_add_row - 1], (curr_array[x - 2] && curr_array[x - 2][pre_add_row - 2]) ? curr_array[x - 2][pre_add_row - 2] : 100000);
		curr_array[x].push(full_word[x - 1] == new_char ? min([curr_array[x - 1][pre_add_row], curr_array[x][pre_add_row - 1],
				curr_array[x - 1][pre_add_row - 1], (curr_array[x - 2] && curr_array[x - 2][pre_add_row - 2]) ? curr_array[x - 2][pre_add_row - 2] : 100000
			]) :
			1 + min([curr_array[x - 1][pre_add_row], curr_array[x][pre_add_row - 1],
				curr_array[x - 1][pre_add_row - 1], (curr_array[x - 2] && curr_array[x - 2][pre_add_row - 2]) ? curr_array[x - 2][pre_add_row - 2] : 100000
			]));
		console.log(curr_array[x]);
	}
	printMultiArray(curr_array);
	return;
}

// for (let x = 0, y = 0; x < 10; x += y == 9 ? 1 : 0, y = y == 9 ? 0 : y + 1) {
// 	console.log(x, y);
// }

function min(args) {
	let lowest = args[0];
	for (let i = 0; i < args.length; i++) {
		if (args[i] < lowest && args[i] != -1)
			lowest = args[i];
	}
	return lowest;
}

function max(args) {
	let max = args[0];
	for (let i = 0; i < args.length; i++) {
		if (args[i].load > max.load)
			max = args[i];
	}
	return max;
}

function dist(compare1, compare2) {
	let word_array = build_array(compare1, compare2);

	// loop through array and look at values
	for (let x = 1; x < word_array.length; x++) {
		for (let y = 1; y < word_array[x].length; y++) {
			word_array[x][y] = min([1 + word_array[x - 1][y],
				1 + word_array[x][y - 1],
				(compare1[x - 1] == compare2[y - 1] ? 0 : 1) + word_array[x - 1][y - 1],
				compare1[x - 2] && compare2[y - 2] && compare1[x - 1] == compare2[y - 2] &&
				compare1[x - 2] == compare2[y - 1] ? 1 + word_array[x - 2][y - 2] : -1
			]);
		}
	}
	return word_array;
	//word_array[word_array.length - 1][word_array[0].length - 1];
}

function printMultiArray(arr) {
	for (let y = 0; y < arr[0].length; y++) {
		for (let x = 0; x < arr.length; x++) {
			process.stdout.write(arr[x][y] + "\t");
		}
		process.stdout.write("\n");
	}
}

function quicksort(array, low, high, sort) {
	if (low < high) {
		let pivot = partition(array, low, high, sort);
		quicksort(array, pivot + 1, high, sort);
		quicksort(array, low, pivot - 1, sort);
	}
	return;
}

function partition(array, low, pivot, sort) {
	let lowest = low - 1;
	let buffer;
	for (let j = low; j < pivot; j++) {
		if (array[j][sort] > array[pivot][sort]) {
			lowest++;
			buffer = array[lowest];
			array[lowest] = array[j];
			array[j] = buffer;
		}
	}
	buffer = array[lowest + 1];
	array[lowest + 1] = array[pivot];
	array[pivot] = buffer;
	return lowest + 1;
}

/* Function auto_complete:
	inputs: trie_level - deep within tree, look for high suggest values
			build_word - the current word we are building off of
	output: auto_suggests - an array of best suggestion with it's finished value
*/
function auto_complete(trie_level, build_word, build_dist) {
	// loop and find highest load value
	let best_suggests = [];
	if (trie_level.finished)
		best_suggests.push({
			word: build_word,
			load: trie_level.finished,
			dist: build_dist
		});

	if (!trie_level.childs.length)
		return {
			word: build_word,
			load: trie_level.finished,
			dist: build_dist
		};
	for (let i = 0; i < trie_level.childs.length; i++)
		if (trie_level.childs[i]) best_suggests.push(auto_complete(trie_level.childs[i], build_word + String.fromCharCode(i + 97), build_dist));
	// take this and find the correct location in the best_suggests	}

	quicksort(best_suggests, 0, best_suggests.length - 1, "load");
	// splice and caryy back the best ones
	return best_suggests[0];
}

/* Function suggest:
	inputs: trie_level - the recurring trie going deeper each call
			word - the current word, looking for close matches
			word_position - where we are within the word
			build_word - rolling word: as you go down the trie, the word builds up
			build_dist - rolling distance: as you go down the trie, the distance adds up

		Start running through words to find good suggestions
		if we're at the end of the current word, start looking for the most weighted suggestion below that

	output: top suggested words
*/
function suggest(trie_level, word, word_position, build_word, build_array) {
	//console.log(word, build_word, build_dist);
	// first check and make sure this path is okay
	let curr_dist = build_array[build_array.length - 1][build_array[0].length - 1];
	if (curr_dist > 2)
		return []; // dud track

	if (word_position >= word.length - 1)
		// start searching for a auto-complete
		return [auto_complete(trie_level, build_word, curr_dist)];

	// difference between the two current words is less than 2
	if (Math.abs(word.length - build_word.length) < 2 && trie_level.finished) // return
		return [{
			word: build_word,
			load: trie_level.finished,
			dist: curr_dist // grab bottom right distance
		}];

	// otherwise start looking for good paths to travel down
	// we can try a certain amount of levels - until the first two letters are off we can continue looking
	let all_suggests = [];
	for (let check_children = 0; check_children < trie_level.childs.length; check_children++)
		all_suggests = trie_level.childs[check_children] ? [...all_suggests, ...suggest(trie_level.childs[check_children], word, word_position + 1, build_word + String.fromCharCode(check_children + 97), [...build_array, ...new_array(build_array, word, String.fromCharCode(check_children + 97)) /*a new column of the table*/ ])] : all_suggests;

	if (build_word.length == 0 && all_suggests.length) {
		for (let i = 0; i < all_suggests.length; i++)
			all_suggests[i].signifigance = all_suggests[i].load - (all_suggests[i].dist * 3);
		quicksort(all_suggests, 0, all_suggests.length - 1, "signifigance");
		all_suggests = all_suggests.splice(0, 5);
	}
	return all_suggests;
}

let word = "pani";
arr = dist(word, "pe");
printMultiArray(arr);
//let answers = suggest(trie, word, 0, "", build_array(word, ""));
arr = new_array(arr, word, "n");
console.log(arr);
// narrow down even more

// console.log("\n");
// for (let i = 0; i < answers.length; i++) {
// 	console.log("answer of WORD:", answers[i].word, "with SIGNIFIGANCE:", answers[i].signifigance, "where load is", answers[i].load, "and dist is", answers[i].dist);
// }