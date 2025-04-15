var table = document.getElementById("CHRarray");
var CHRoutput = document.getElementById("CHRoutput");
var CHRcolors = document.getElementById("CHRcolors");
var rows = [];
var cells = [];
var pixelnumber = 0;
var pixels = [0];
var bank0 = [0];
var bank1 = [0];
var currentColorNumber = [0x0f, 0x11, 0x16, 0x1a];
var colorNames = [
	"$00", "$01", "$02", "$03", "$04", "$05", "$06", "$07", 
	"$08", "$09", "$0A", "$0B", "$0C", "$0D", "$0E", "$0F",
	"$10", "$11", "$12", "$13", "$14", "$15", "$16", "$17", 
	"$18", "$19", "$1A", "$1B", "$1C", "$1D", "$1E", "$1F",
	"$20", "$21", "$22", "$23", "$24", "$25", "$26", "$27", 
	"$28", "$29", "$2A", "$2B", "$2C", "$2D", "$2E", "$2F",
	"$30", "$31", "$32", "$33", "$34", "$35", "$36", "$37", 
	"$38", "$39", "$3A", "$3B", "$3C", "$3D", "$3E", "$3F" 
];
var colorValues = [
	"#656666", "#002d69", "#131f7f", "#3c137c", "#600b62", "#730a37", "#710f07", "#5a1a00", 
	"#342800", "#0b3400", "#003c00", "#013d10", "#013840", "#000000", "#000000", "#000000", 
	"#aeaeae", "#0f63b3", "#4051d0", "#7841cc", "#a736a9", "#c03470", "#bd3c30", "#9f4a00", 
	"#6d5c01", "#366d01", "#077704", "#00793d", "#00727d", "#000000", "#000000", "#000000", 
	"#fefeff", "#5db3ff", "#8fa1ff", "#c890ff", "#f785fa", "#ff83c0", "#ff8b7f", "#ef9a49", 
	"#bdac2c", "#85bc2f", "#55c753", "#3cc98c", "#3ec2cd", "#4e4e4d", "#000000", "#000000", 
	"#fefeff", "#bcdfff", "#d1d8ff", "#e8d1ff", "#fbcdfd", "#ffcce5", "#ffcfca", "#f8d5b4", 
	"#e4dca8", "#cce3a9", "#b9e8b8", "#aee8d0", "#afe5ea", "#b7b6b6", "#000000", "#000000", 
];

function CHRset(p, x, y) {
	pixels[p]++;
	if (pixels[p] > 3) pixels[p] = 0;

	cells[y][x].classList.remove("CHRcolor1", "CHRcolor2", "CHRcolor3", "CHRcolor4");
	switch (pixels[p]) {
		case 0:
			bank0[p] = 0;
			bank1[p] = 0;
			cells[y][x].classList.add("CHRcolor1");
			break;
		case 1:
			bank0[p] = 1;
			bank1[p] = 0;
			cells[y][x].classList.add("CHRcolor2");
			break;
		case 2:
			bank0[p] = 0;
			bank1[p] = 1;
			cells[y][x].classList.add("CHRcolor3");
			break;
		case 3:
			bank0[p] = 1;
			bank1[p] = 1;
			cells[y][x].classList.add("CHRcolor4");
			break;
	}

	cells[y][x].style.backgroundColor = colorValues[currentColorNumber[pixels[p]]];

	CHRoutput.innerHTML = "";
	for (i = 0; i < 64; i += 8) {
		CHRoutput.innerHTML += ".byte %" + bank0[i] + bank0[i + 1] + bank0[i + 2] + bank0[i + 3] + bank0[i + 4] + bank0[i + 5] + bank0[i + 6] + bank0[i + 7] + " <br />";
	}
	CHRoutput.innerHTML += "<br />"
	for (i = 0; i < 64; i += 8) {
		CHRoutput.innerHTML += ".byte %" + bank1[i] + bank1[i + 1] + bank1[i + 2] + bank1[i + 3] + bank1[i + 4] + bank1[i + 5] + bank1[i + 6] + bank1[i + 7] + " <br />";
	}
	CHRoutput.innerHTML += "<br />"
	CHRoutput.innerHTML += ".byte " + colorNames[currentColorNumber[0]] + ", " + colorNames[currentColorNumber[1]] + ", " + colorNames[currentColorNumber[2]] + ", " + colorNames[currentColorNumber[3]] + " <br />";
}

function ColorSet(c) {
	switch (c) {
		case 0:
			elements = document.getElementsByClassName("CHRcolor1");
			break;
		case 1:
			elements = document.getElementsByClassName("CHRcolor2");
			break;
		case 2:
			elements = document.getElementsByClassName("CHRcolor3");
			break;
		case 3:
			elements = document.getElementsByClassName("CHRcolor4");
			break;
	}

	currentColorNumber[c]++;
	if (currentColorNumber[c] >= 64) currentColorNumber[c] = 0;
	for (var i = 0; i < elements.length; i++) {
		elements[i].style.backgroundColor = colorValues[currentColorNumber[c]];
	}
}

for (y = 0; y < 8; y++) {
	rows[y] = table.insertRow(-1);
	cells[y] = [];
	for (x = 0; x < 8; x++) {
		cells[y][x] = rows[y].insertCell(-1);
		cells[y][x].classList.add("CHRcolor1");
		cells[y][x].style.backgroundColor = colorValues[currentColorNumber[pixels[0]]];
		cells[y][x].innerHTML = pixelnumber;
		cells[y][x].setAttribute("onclick", "CHRset(" + pixelnumber + ", " + x + ", " + y + ");");
		pixels[pixelnumber] = 0;
		bank0[pixelnumber] = 0;
		bank1[pixelnumber] = 0;
		pixelnumber++;
	}
}

CHRcolors.cells[0].setAttribute("onclick", "ColorSet(0);")
CHRcolors.cells[0].style.backgroundColor = colorValues[currentColorNumber[0]];
CHRcolors.cells[1].setAttribute("onclick", "ColorSet(1);")
CHRcolors.cells[1].style.backgroundColor = colorValues[currentColorNumber[1]];
CHRcolors.cells[2].setAttribute("onclick", "ColorSet(2);")
CHRcolors.cells[2].style.backgroundColor = colorValues[currentColorNumber[2]];
CHRcolors.cells[3].setAttribute("onclick", "ColorSet(3);")
CHRcolors.cells[3].style.backgroundColor = colorValues[currentColorNumber[3]];