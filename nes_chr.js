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

var inputColorTable = [];
var inputColorBlocks = [];
var inputColorBlocksCount = [];
var outputColorBlocks = [];
var tooManyColorsInBlock = false;
var inputBlockPalettesSorted = [];

var inputWidth = 0;
var inputHeight = 0;

const inputCanvas = document.getElementById("inputCanvas");
const inputCtx = inputCanvas.getContext("2d");
const inputInfo = document.getElementById("inputInfo");
const inputBlocksColorCount = document.getElementById("inputBlocksColorCount");
const outputCanvas = document.getElementById("outputCanvas");
const outputCtx = outputCanvas.getContext("2d");
const outputInfo = document.getElementById("outputInfo");

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

function countInputColors() {
	inputColorTable = [];
	// var inputImageData = inputCtx.getImageData(0, 0, inputWidth, inputHeight);
	var pixel;
	for (var y = 0; y < inputHeight; y++) {
		for (var x = 0; x < inputWidth; x++) {
			pixel = inputCtx.getImageData(x, y, 1, 1);
			var colorFound = false;
			for (t = 0; t < inputColorTable.length; t++) {
				if (inputColorTable[t].data[0] == pixel.data[0] &&
					inputColorTable[t].data[1] == pixel.data[1] &&
					inputColorTable[t].data[2] == pixel.data[2]) {
					colorFound = true;
				}
			}
			if (colorFound == false) {
				inputColorTable.push(pixel);
			}
		}
	}
	const colorCount = inputColorTable.length;
	return colorCount;
}

function checkBlocksColors() {
	const xBlocks = Math.floor(inputWidth / 16);
	const yBlocks = Math.floor(inputHeight / 16);
	tooManyColorsInBlock = false;

	var outputText = "";
	inputColorBlocks = [];
	inputColorBlocksCount = [];
	var backgroundColor = inputCtx.getImageData(0, 0, 1, 1);
	// backgroundColor.data[0] = 0;
	// backgroundColor.data[1] = 0;
	// backgroundColor.data[2] = 0;

	for (yb = 0; yb < yBlocks; yb++) {
		const starty = yb*16;
		for (xb = 0; xb < xBlocks; xb++) {
			const startx = xb*16;
			const blockNumber = xb+(yb*xBlocks);
			inputColorBlocks.push([]);
			inputColorBlocks[blockNumber].push(backgroundColor);
			inputColorBlocksCount.push([]);
			inputColorBlocksCount[blockNumber].push(0);
			for (var y = starty; y < starty+16; y++) {
				for (var x = startx; x < startx+16; x++) {
					var pixel = inputCtx.getImageData(x, y, 1, 1);
					outputCtx.putImageData(pixel, x, y);
					var colorFound = false;
					for (t = 0; t < inputColorBlocks[blockNumber].length; t++) {
						if (inputColorBlocks[blockNumber][t].data[0] == pixel.data[0] &&
							inputColorBlocks[blockNumber][t].data[1] == pixel.data[1] &&
							inputColorBlocks[blockNumber][t].data[2] == pixel.data[2]) {
							colorFound = true;
							inputColorBlocksCount[blockNumber][t]++;
							break;
						}
					}
					if (colorFound == false) {
						// console.log(pixel);
						// console.log(pixel + " " + pixel.data[0] + " " + pixel.data[1] + " " + pixel.data[2] + " " + pixel.data[3]);
						inputColorBlocks[blockNumber].push(pixel);
						inputColorBlocksCount[blockNumber].push(1);
					}
				}
			}
			const colorCount = inputColorBlocks[blockNumber].length;
			if (colorCount <= 4) outputText += colorCount+" ";
			else {
				// console.log(inputColorBlocks[blockNumber]);
				tooManyColorsInBlock = true;
				outputText += '<span style="color:red;">'+colorCount+' </span>';
				outputColorBlocks = [];
				outputColorBlocks.push(inputColorBlocks[blockNumber][0]);
				for (sort = 1; sort < colorCount; sort++) {
					maxElement = sort;
					maxValue = inputColorBlocksCount[blockNumber][sort];
					for (e = sort; e < colorCount; e++) {
						if (inputColorBlocksCount[blockNumber][e] >= maxValue) {
							maxValue = inputColorBlocksCount[blockNumber][e];
							maxElement = e;
						}
					}
					temp = inputColorBlocks[blockNumber][sort];
					outputColorBlocks.push({data:[3]});
					outputColorBlocks[sort].data[0] = temp.data[0];
					outputColorBlocks[sort].data[1] = temp.data[1];
					outputColorBlocks[sort].data[2] = temp.data[2];
					inputColorBlocks[blockNumber][sort] = inputColorBlocks[blockNumber][maxElement];
					inputColorBlocks[blockNumber][maxElement] = temp;
					temp = inputColorBlocksCount[blockNumber][sort];
					inputColorBlocksCount[blockNumber][sort] = inputColorBlocksCount[blockNumber][maxElement];
					inputColorBlocksCount[blockNumber][maxElement] = temp;
				}
				for (badColor = 4; badColor < colorCount; badColor++) {
					minDiff = 999;
					minDiffSubstitute = 0;
					for (substitute = 0; substitute < 4; substitute++) {
						if (outputColorBlocks[badColor].data[0] > inputColorBlocks[blockNumber][substitute].data[0]) {
							tempDiff = outputColorBlocks[badColor].data[0] - inputColorBlocks[blockNumber][substitute].data[0];
						} else tempDiff = inputColorBlocks[blockNumber][substitute].data[0] - outputColorBlocks[badColor].data[0];
						if (outputColorBlocks[badColor].data[1] > inputColorBlocks[blockNumber][substitute].data[1]) {
							tempDiff += outputColorBlocks[badColor].data[1] - inputColorBlocks[blockNumber][substitute].data[1];
						} else tempDiff += inputColorBlocks[blockNumber][substitute].data[1] - outputColorBlocks[badColor].data[1];
						if (outputColorBlocks[badColor].data[2] > inputColorBlocks[blockNumber][substitute].data[2]) {
							tempDiff += outputColorBlocks[badColor].data[2] - inputColorBlocks[blockNumber][substitute].data[2];
						} else tempDiff += inputColorBlocks[blockNumber][substitute].data[2] - outputColorBlocks[badColor].data[2];
						if (tempDiff < minDiff) {
							minDiff = tempDiff;
							minDiffSubstitute = substitute;
						}
					}
					outputColorBlocks[badColor].data[0] = inputColorBlocks[blockNumber][minDiffSubstitute].data[0];
					outputColorBlocks[badColor].data[1] = inputColorBlocks[blockNumber][minDiffSubstitute].data[1];
					outputColorBlocks[badColor].data[2] = inputColorBlocks[blockNumber][minDiffSubstitute].data[2];
				}
				for (var y = starty; y < starty+16; y++) {
					for (var x = startx; x < startx+16; x++) {
						var pixel = inputCtx.getImageData(x, y, 1, 1);
						for (t = 4; t < colorCount; t++) {
							if (inputColorBlocks[blockNumber][t].data[0] == pixel.data[0] &&
								inputColorBlocks[blockNumber][t].data[1] == pixel.data[1] &&
								inputColorBlocks[blockNumber][t].data[2] == pixel.data[2]) {
								// console.log(pixel);
								pixel.data[0] = outputColorBlocks[t].data[0];
								pixel.data[1] = outputColorBlocks[t].data[1];
								pixel.data[2] = outputColorBlocks[t].data[2];
								outputCtx.putImageData(pixel, x, y);
								break;
							}
						}
					}
				}
			}
		}
		outputText += "<br />";
	}

	return outputText;
}

function countIndividualPalettes() {
	var maxPaletteColors = 0;
	inputBlockPalettesSorted = [];
	for (blockNumber = 0; blockNumber < inputColorBlocks.length; blockNumber++) {
		// console.log(inputColorBlocks[blockNumber]);
		if (inputColorBlocks[blockNumber].length > maxPaletteColors) maxPaletteColors = inputColorBlocks[blockNumber].length;
		for (rgb = 2; rgb >= 0; rgb--) {
			inputColorBlocks[blockNumber].sort((a, b) => a.data[rgb] - b.data[rgb]);
		}
		// console.log(inputColorBlocks[blockNumber]);
		var colorFound = false;
		for (p = 0; p < inputBlockPalettesSorted.length; p++) {
			if (inputColorBlocks[blockNumber].length == inputBlockPalettesSorted[p].length) {
				colorFound = true;
				for (c = 0; c < inputBlockPalettesSorted[p].length; c++) {
					if (inputColorBlocks[blockNumber][c].data[0] != inputBlockPalettesSorted[p][c].data[0] ||
						inputColorBlocks[blockNumber][c].data[1] != inputBlockPalettesSorted[p][c].data[1] ||
						inputColorBlocks[blockNumber][c].data[2] != inputBlockPalettesSorted[p][c].data[2]) {
						colorFound = false;
						break;
					}
				}
				if (colorFound == true) break;
			}
		}
		if (colorFound == false) {
			inputBlockPalettesSorted.push(inputColorBlocks[blockNumber]);
		}
	}
	inputBlockPalettesSorted.sort((a, b) => b.length - a.length);
	// console.log(inputBlockPalettesSorted);
	// for (p = 0; p < inputBlockPalettesSorted.length; p++) {
	// 	if (inputBlockPalettesSorted[p].length < maxPaletteColors) {
	// 		for (e = 0; e < inputBlockPalettesSorted.length, e++) {
 //
	// 		}
	// 	}
	// }
	// console.log(inputBlockPalettesSorted);
	return inputBlockPalettesSorted.length;
}

document.getElementById("files").onchange = function(e){
	var URL = window.webkitURL || window.URL;
	var url = URL.createObjectURL(e.target.files[0]);
	var img = new Image();
	img.src = url;

	img.onload = function() {
		inputWidth = img.width;
		inputHeight = img.height;
		inputCanvas.width = inputWidth;
		inputCanvas.height = inputHeight;
		outputCanvas.width = inputWidth;
		outputCanvas.height = inputHeight;
		inputCtx.drawImage(img, 0, 0, inputWidth, inputHeight);

		inputBlocksColorCount.innerHTML = "";

		inputInfo.innerHTML = "size: "+inputWidth+"x"+inputHeight+"<br />";

		inputInfo.innerHTML += "colors: ";
		const inputColorCount = countInputColors();
		if (inputColorCount < 9) inputInfo.innerHTML += '<span style="color:green;">'+inputColorCount+'</span><br />';
		else if (inputColorCount < 14) inputInfo.innerHTML += '<span style="color:yellow;">'+inputColorCount+'</span><br />';
		else {
			inputInfo.innerHTML += '<span style="color:red;">'+inputColorCount+'</span><br />';
			// return;
		}
		inputBlocksColorCount.innerHTML += "colors per block: <br />"+checkBlocksColors()+"<br />";
		// if (tooManyColorsInBlock) return;
		const individualPaletteCount = countIndividualPalettes();
		outputInfo.innerHTML = "individual palettes: "+individualPaletteCount+"<br />";
	}
};

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
