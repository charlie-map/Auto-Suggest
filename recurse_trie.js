const fs = require('fs');
const edit_amount = 2;

let words = fs.readFileSync("./all_trie_words.txt").toString().split("\n");

let trie = {
	load: 0,
	childs: []
};

function insert(trie_level, word, word_position) {
	if (word_position < word.length) {
		//grab first character
		if (typeof trie_level.childs[word[word_position]] == "undefined") {
			let load = word_position == word.length - 1 ? 1 : 0;
			trie_level.childs[word[word_position]] = {
				load: load,
				childs: []
			};
		} else if (word_position == word.length - 1) trie_level.childs[word[word_position]].load++;
		insert(trie_level.childs[word[word_position]], word, word_position + 1);
	}
	return trie_level;
}

let new_word = [];
for (let i = 0; i < words.length; i++) {
	//change to number values
	new_word = words[i].replace(/[^A-Za-z]/g, "").split("");
	//turn word into the ascii characters
	for (let word = 0; word < new_word.length; word++) {
		new_word[word] = new_word[word].toLowerCase().charCodeAt(0) - 97;
	}
	trie = insert(trie, new_word, 0);
}

function print_tree(trie_level, depth) {
	// go down the the left path first
	let spacing = "";
	for (let spacer = 0; spacer < depth + 1; spacer++) {
		spacing += "   ";
	}
	console.log("|" + spacing + "|__" + trie_level.load);
	for (let alph = 0; alph < 26; alph++) {
		if (typeof trie_level.childs[alph] != "undefined") {
			console.log("|" + spacing + "|" + String.fromCharCode(alph + 97));
			print_tree(trie_level.childs[alph], depth + 1);
		}
	}
	return;
}

function make_array(w1, w2) {
	let array = [];
	let columns_value = w1.length > w2.length ? w1.length : w2.length;
	let rows_value = w1.length > w2.length ? w2.length : w1.length;
	for (let y = 0; y < columns_value + 1; y++) { // build the columns based on w1 value
		array[y] = [];
		for (let x = 0; x < rows_value + 1; x++) { // build the rows based on the w2 value
			array[0][x] = x;
			array[y][0] = y;
			array[y][x] = 0;
		}
	}
	return array;
}

function min(values) {
	let min = 100000;
	for (value in values) min = values[value] < min ? values[value] : min;
	return min
}

function dist(w1, w2) {
	let array = make_array(w1, w2);
	w1 = " " + w1;
	w2 = " " + w2;
	for (let y = 1; y < array.length; y++) { // go through the rows
		for (let x = 1; x < array[0].length; x++) { // go through that full column
			let sub_add = w1[y] == w2[x] ? 0 : 1; // check for adding onto sub case
			// check the transpose case
			array[y][x] = (w1[x] == w2[y - 1] && w1[x - 1] == w2[y]) ? array[y][x] = min([sub_add + array[y - 1][x - 1], 1 + array[y][x - 1], 1 + array[y - 1][x], 1 + array[y - 2][x - 2]]) :
				array[y][x] = min([sub_add + array[y - 1][x - 1], 1 + array[y][x - 1], 1 + array[y - 1][x]]);
		}
	}
	return array[array.length - 1][array[0].length - 1];
}

function type_ahead(trie_level, array, current_char) {
	// run through this path in totality
	if (trie_level.load) {
		array.push({
			string: current_char,
			load: trie_level.load
		});
	}
	for (let char = 0; char < 26; char++) {
		if (typeof trie_level.childs[char] != "undefined") type_ahead(
			trie_level.childs[char], array, current_char + String.fromCharCode(char + 97));
	}
	return array;
}

function suggestions(trie_level, string, build_char) { //Running through the words, then using edit distance to find the best words
	//trying all different paths
	let all_suggests = [];
	// which ever word is longer goes into the distance formula first
	let string_len = string.length;
	let current_char_len = build_char.length;
	let edit_dist;
	if (string_len > current_char_len) {
		edit_dist = dist(string, build_char);
	} else {
		edit_dist = dist(build_char, string);
	}
	if (edit_dist <= edit_amount ||
		(build_char == string.substring(0, current_char_len) ||
			build_char.substring(0, string_len) == string)) {
		if (string_len == current_char_len && edit_dist <= edit_amount) return type_ahead(trie_level, all_suggests, build_char);
		if (trie_level.load) all_suggests.push({
			string: build_char,
			load: trie_level.load
		});
	} else if (current_char_len > string_len) {
		return all_suggests;
	}
	for (let char = 0; char < 26; char++) { // Loop through all characters in the alphabet
		if (typeof trie_level.childs[char] != "undefined") {
			// Then try all the lower branches
			all_suggests = all_suggests.concat(suggestions(trie_level.childs[char], string,
				build_char + String.fromCharCode(char + 97)));
		}
	}
	// sort based on edit distance? sure
	for (let arr = 0; arr < all_suggests.length; arr++) {
		if (string_len > all_suggests[arr].string.length) {
			edit_dist = dist(string, all_suggests[arr].string);
		} else {
			edit_dist = dist(all_suggests[arr].string, string);
		}
		all_suggests[arr] = { ...all_suggests[arr], ... { edit: edit_dist } };
	}
	quicksort(all_suggests, 0, all_suggests.length - 1);
	return all_suggests;
}

let array = suggestions(trie, process.argv[2], "");
let small_array = [];
for (let i = 0; i < 5; i++) {
	small_array.push(array[i]);
}
console.log(small_array);
//console.log(type_ahead(trie, "cr", "", 0));

function quicksort(array, low, high) {
	if (low < high) {
		let pivot = partition(array, low, high);
		array = pivot[0];
		quicksort(array, low, pivot[1] - 1); // low
		quicksort(array, pivot[1] + 1, high); // high
	}
	return array;
}

function partition(array, low, pivot) {
	let lowest = low - 1;
	let buffer;
	for (let j = low; j < pivot; j++) {
		if (array[j].edit < array[pivot].edit) {
			lowest++;
			buffer = array[j];
			array[j] = array[lowest];
			array[lowest] = buffer;
		}
	}
	buffer = array[lowest + 1];
	array[lowest + 1] = array[pivot];
	array[pivot] = buffer;
	return [array, lowest + 1];
}