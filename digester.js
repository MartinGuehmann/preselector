// Copyright by Ralf Mrowka (C)2020,  all rights reserved


var enzymearray = [];
var recognition = [];
var cleanedrecog = [];
var reversecompl =[];
var regexfw = [];
var regexrv = [];

var cutinseq1notin3Label = "cut in Sequence 1 but not in Sequence 3";
var cutinseq2notin3Label = "cut in Sequence 2 but not in Sequence 3";
var cutinseq1Label = "cut in Sequence 1";
var cutinseq2Label = "cut in Sequence 2";
var cutinseq3Label = "cut in Sequence 3";
var nocutinseq1Label = "no cut in Sequence 1";
var nocutinseq2Label = "no cut in Sequence 2";
var nocutinseq3Label = "no cut in Sequence 3";

for (i = 0; i < enzymeentry.length; i++) {
	enzymearray.push(enzymeentry[i].split('\t'));
	recognition.push(enzymearray[i][1]);
	cleanedrecog.push(clean(enzymearray[i][1]));
	reversecompl.push(revcompl(cleanedrecog[i]));
	regexfw.push(makeregex(reversecompl[i]));
	regexrv.push(makeregex(cleanedrecog[i]));
}

window.onload=function()
{
	initEnzymeLists();
	resetListLabels();
}

function resetListLabels()
{
	document.getElementById("cutinseq1notin3Label").innerHTML = cutinseq1notin3Label + ":";
	document.getElementById("cutinseq2notin3Label").innerHTML = cutinseq2notin3Label + ":";

	document.getElementById("cutinseq1Label").innerHTML = cutinseq1Label + ":";
	document.getElementById("cutinseq2Label").innerHTML = cutinseq2Label + ":";
	document.getElementById("cutinseq3Label").innerHTML = cutinseq3Label + ":";

	document.getElementById("nocutinseq1Label").innerHTML = nocutinseq1Label + ":";
	document.getElementById("nocutinseq2Label").innerHTML = nocutinseq2Label + ":";
	document.getElementById("nocutinseq3Label").innerHTML = nocutinseq3Label + ":";
}

function initEnzymeLists()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse");
	var enzymesToExclude = document.getElementById("EnzymesToExclude");
	for (var i in enzymearray)
	{
		enzymesToUse    .options[i] = new Option(enzymearray[i][0], i);
		enzymesToExclude.options[i] = new Option(enzymearray[i][0], i);
		enzymesToUse    .options[i].id = enzymearray[i][0];
		enzymesToExclude.options[i].id = enzymearray[i][0];
		enzymesToExclude.options[i].hidden = true;
	}
}

function addEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = 0; i < enzymesToExclude.length; i++)
	{
		if(enzymesToExclude[i].selected)
		{
			enzymesToUse[i].hidden = false;
			enzymesToExclude[i].hidden = true;
			enzymesToExclude[i].selected = false;
		}
	}

	document.getElementById("fileWarning").innerHTML = "";
}

function removeEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = 0; i < enzymesToUse.length; i++)
	{
		if(enzymesToUse[i].selected)
		{
			enzymesToExclude[i].hidden = false;
			enzymesToUse[i].hidden = true;
			enzymesToUse[i].selected = false;
		}
	}

	document.getElementById("fileWarning").innerHTML = "";
}

function useAllEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = 0; i < enzymesToUse.length; i++)
	{
		enzymesToUse[i].hidden = false;
	}

	for(var i = 0; i < enzymesToExclude.length; i++)
	{
		enzymesToExclude[i].hidden = true;
		enzymesToExclude[i].selected = false;
	}

	document.getElementById("fileWarning").innerHTML = "";
}

function removeAllEnzymes()
{
	var enzymesToUse     = document.getElementById("EnzymesToUse").options;
	var enzymesToExclude = document.getElementById("EnzymesToExclude").options;

	for(var i = 0; i < enzymesToUse.length; i++)
	{
		enzymesToUse[i].hidden = true;
		enzymesToUse[i].selected = false;
	}

	for(var i = 0; i < enzymesToExclude.length; i++)
	{
		enzymesToExclude[i].hidden = false;
	}

	document.getElementById("fileWarning").innerHTML = "";
}

function loadEnzymes()
{
	var loadEnzymesDialog = document.getElementById("loadEnzymesDialog");
	loadEnzymesDialog.click();
}

function onChangeLoadEnzymes()
{
	var loadEnzymesDialog = document.getElementById("loadEnzymesDialog");
	var enzymeFile = loadEnzymesDialog.files[0];

	var reader = new FileReader();
	reader.onload = function(event)
	{
		var fileWarning = document.getElementById("fileWarning").innerHTML;
		fileWarning = "";
		removeAllEnzymes();

		var enzymesToUse = document.getElementById("EnzymesToUse").options;

		const file = event.target.result;
		const allLines = file.split(/\r\n|\n/);

		allLines.forEach((line) => {

			line = line.split('#')[0];
			line = line.replace(/\s/g, "");

			if(line == "")
			{
				return;
			}

			var enzymeToUseItem = enzymesToUse.namedItem(line);

			if(enzymeToUseItem != null)
			{
				enzymeToUseItem.hidden = false;
			}
			else if(fileWarning == "")
			{
				fileWarning = "Warning! Preselector does not know this enzyme: " +
				              line +
				              "<br>This is the first unknown enzyme in the list, which" +
				              "<br>may contain more unknown enzymes. All unknown enzymes are ignored.";
			}
		});

		document.getElementById("fileWarning").innerHTML = fileWarning;
	};

	reader.readAsText(enzymeFile);
}

function saveEnzymes()
{
	var enzymesToSaveFileBody = "data:text/txt,";
	var enzymesToUse          = document.getElementById("EnzymesToUse");

	enzymesToSaveFileBody += "# This is an enzyme list file generated by Preselector.\n";
	enzymesToSaveFileBody += "# Everything following a # is a comment.\n"
	enzymesToSaveFileBody += "# Empty lines are ignored.\n"
	enzymesToSaveFileBody += "# Tabs and spaces are ignored.\n"
	enzymesToSaveFileBody += "# Each line contains an enzyme name.\n"
	enzymesToSaveFileBody += "# Enzymes Preselector does not know are ignored.\n"
	enzymesToSaveFileBody += "# In that case Preselector reports the first unknown enzyme only.\n\n"

	for(var i = 0; i < enzymesToUse.length; i++)
	{
		if(!enzymesToUse[i].hidden)
		{
			enzymesToSaveFileBody += enzymesToUse[i].text;
			enzymesToSaveFileBody += "\n";
		}
	}

	enzymesToSaveFileBody = enzymesToSaveFileBody.replace(/\n/g, "%0D%0A");
	enzymesToSaveFileBody = enzymesToSaveFileBody.replace(/#/g, "%23");

	var loadEnzymesDialog = document.getElementById("saveEnzymesDialog");
	loadEnzymesDialog.setAttribute("download", "EnzymesToSave.txt");
	loadEnzymesDialog.setAttribute("href", enzymesToSaveFileBody);
	loadEnzymesDialog.click();

	document.getElementById("fileWarning").innerHTML = "";
}

function clean(p1) {
	p2=p1.replace(/\^|\(|\)|[0-9]|\/|-|_|\'/gm,'');
	p2=p2.replace(/[a-z]+/g, (c) => c.toUpperCase());
	return p2;
}

function pressedold(tabName) {
	var i;
	var x = document.getElementsByClassName("tab");
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	document.getElementById(tabName).style.display = "block";
}

function pressed(evt, tabName) {
	var i, x, tablinks;
	x = document.getElementsByClassName("tab");
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablink");
	for (i = 0; i < x.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" w3-blue", "");
	}
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " w3-blue";
}

/*
IUPAC nucleotide code 	Base
A 	Adenine
C 	Cytosine
G 	Guanine
T (or U) 	Thymine (or Uracil)
R 	A or G
Y 	C or T
S 	G or C
W 	A or T
K 	G or T
M 	A or C
B 	C or G or T
D 	A or G or T
H 	A or C or T
V 	A or C or G
N 	any base
. or - 	gap
*/

//

function revcompl(p1) {
	p2=reverse(p1)
	p3=p2.replace(/[A-Z]+/, (c) => c.toLowerCase());
	p4=p3.replace(/[a]/g,'T').replace(/[t]/g,'A').replace(/[c]/g,'G').replace(/[g]/g,'C').replace(/[n]/g,'N');
	p5=p4.replace(/[r]/g,'Y').replace(/[y]/g,'R').replace(/[s]/g,'S').replace(/[w]/g,'W').replace(/[k]/g,'M').replace(/[m]/g,'K')
	p6=p5.replace(/[b]/g,'V').replace(/[b]/g,'B').replace(/[d]/g,'H').replace(/[h]/g,'D')
	return p6;
}

function makeregex(p1) {
	p2 = p1.replace(/[A]/g,'[a]').replace(/[C]/g,'[c]').replace(/[G]/g,'[g]').replace(/[T]/g,'[t]')
	p3 = p2.replace(/[N]/g,'[a,c,g,t]').replace(/[R]/g,'[a,g]').replace(/[Y]/g,'[c,t]').replace(/[S]/g,'[g,c]')
	p4 = p3.replace(/[W]/g,'[a,t]').replace(/[K]/g,'[t,g]').replace(/[M]/g,'[a,c]').replace(/[B]/g,'[g,c,t]')
	p5 = p4.replace(/[D]/g,'[a,g,t]').replace(/[H]/g,'[a,c,t]').replace(/[V]/g,'[a,c,g]')
	return p5
}

function reverse(str){
	let reversed = "";
	for (var i = str.length - 1; i >= 0; i--){
		reversed += str[i];
	}
	return reversed;
}

function testforcut(str,reg){
	var re = new RegExp(reg, "i");
	var n = str.search(re);
	return n
}

function numberofcut(str,reg){
	var re = new RegExp(reg, "ig");
	var n = 0
	var found = str.match(re);
	if(found != null){
		n=found.length
	}
	return n
}

var sampleseq1='acaaaaatcgacgctcaagtcagaggtggcgaaacccgacaggactataaagataccaggcgtttccccctggaagctccctcgtgcgctctcctgttccgaccctgccgcttaccggatacctgtccgcctttctcccttcgggaagcgtggcgctttctcatagctcacgctgtaggtatctcagttcggtgtaggtcgttcgctccaagctgggctgtgtgcacgaaccccccgttcagcccgaccgctgcgccttatccggtaactatcgtcttgagtccaacccggtaagacacgacttatcgccactggcagcagccactggtaacaggattagcagagcgaggtatgtaggcggtgctacagagttcttgaagtggtggcctaactacggctacactagaagaacagtatttggtatctgcgctctgctgaagccagttaccttcggaaaaagagttggtagctcttgatccggcaaacaaaccaccgctggtagcggtggtttttttgtttgcaagcagcagattacgcgcagaaaaaaaggatctcaagaagatcctttgatcttttctacggggtctgacgctcagtggaacgaaaactcacgttaagggattttggtcatgagattatcaaaaaggatcttcacctagatccttttaaattaaaaatgaagttttaaatcaatctaaagtatatatgagtaaacttggtctgacagttaccaatgcttaatcagtgaggcacctatctcagcgatctgtctatttcgttcatccatagttgcctgactccccgtcgtgtagataactacgatacgggagggcttaccatctggccccagtgctgcaatgataccgcgagacccacgctcaccggctccagatttatcagcaataaaccagccagccggaagggccgagcgcagaagtggtcctgcaactttatccgcctccatccagtctattaattgttgccgggaagctagagtaagtagttcgccagttaatagtttgcgcaacgttgttgccattgctacaggcatcgtggtgtcacgctcgtcgtttggtatggcttcattcagctccggttcccaacgatcaaggcgagttacatgatcccccatgttgtgcaaaaaagcggttagctccttcggtcctccgatcgttgtcagaagtaagttggccgcagtgttatcactcatggttatggcagcactgcataattctcttactgtcatgccatccgtaagatgcttttctgtgactggtgagtactcaaccaagtcattctgagaatagtgtatgcggcgaccgagttgctcttgcccggcgtcaatacgggataataccgcgccacatagcagaactttaaaagtgctcatcattggaaaacgttcttcggggcgaaaactctcaaggatcttaccgctgttgagatccagttcgatgtaacccactcgtgcacccaactgatcttcagcatcttttactttcaccagcgtttctgggtgagcaaaaacaggaaggcaaaatgccgcaaaaaagggaataagggcgacacggaaatgttgaatactcatactcttcctttttcaatattattgaagcatttatcagggttattgtctcatgagcggatacatatttgaatgtatttagaaaaataaacaaataggggttccgcgcacatttccccgaaaagtgccacctgacgcgccctgtagcggcgcattaagcgcggcgggtgtggtggttacgcgcagcgtgaccgctacacttgccagcgccctagcgcccgctcctttcgctttcttcccttcctttctcgccacgttcgccggctttccccgtcaagctctaaatcgggggctccctttagggttccgatttagtgctttacggcacctcgaccccaaaaaacttgattagggtgatggttcacgtagtgggccatcgccctgatagacggtttttcgccctttgacgttggagtccacgttctttaatagtggactcttgttccaaactggaacaacactcaaccctatctcggtctattcttttgatttataagggattttgccgatttcggcctattggttaaaaaatgagctgatttaacaaaaatttaacgcgaattttaacaaaatattaacgcttacaatttgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagcccaagctaccatgataagtaagtaatattaaggtacgggaggtacttggagcggccgcaataaaatatctttattttcattacatctgtgtgttggttttttgtgtgaatcgatagtactaacatacgctctccatcaaaacaaaacgaaacaaaacaaactagcaaaataggctgtccccagtgcaagtgcaggtgccagaacatttctctatcgataggtaccgagctcttacgcgtgctagcccgggctcgagatctgcgatctaagtaagcttttaacctaaaagatattacccctgggggtcagaggcaaaatggagtcagtcatgctaagcctccctccactatttcaatttccccattgtcaaaggttcatcccacagtcttgtgggattggggaaaatgagacatcattactcacctggctacttcctgccaaacagggttgacaaggggtgactatggaatgaaaccatttgacctggctaaggaaatatttcgtagtgccatttttaggaacaatgatcatcggcatttccctttttgctttgatagttttagcgagacttgcacaacctttgtttacacagtacataataagttttactagaacgtaggccaccatgactaaaagaagaacatcaaggctgaatttaagaatgcctcccaagattgatggaattacactaggaatccaggagaataggtctttaaagcagtctctgtaagtgcccccagattaagcctgctttggtgttctaaggtttgttaaagccaggtagcctgttgtctaattgtatcaatatgggtctgtagaggaggaattaagctagcaacaggtggctagcttagggacgccatttggtaagtagaaagtaggcttgcggctgggcgcggtggctcacgcctgtaatcccagcactttgggaggccgaggcgggtggatcatgaggtcaggagatcgagaccatcctggctaacaaggtgaaaccccgtctctactaaaaatacaaaaaattagccaggcgcggtggcgggcacctgtagtcccagctactcgggaggctgaggcaggagaatggcgtgaacccgggaagcggagcttgcagtgagccgagattgcgccactgcagtccgcagtcctgcctgggcgacagagcgagactccgtctcaaaaaaaaaaaaaaagaaagtaggcttgcaggcttgtgggtccttattattgctttgcatgtagtgtctaatgaggtgctgcataagaaagaaacatggggcctctgggtatggagttatcaattggatcctatgtatgatttgagaaaccagcttctatagatctaatgcccaagaggctacatgactaaaattatgtgtacaggaacaactagaggatcagagtggtcatgtactgaacaaggtttaagatgacaaatctggcagtgtgatatgctagtgaaagaggcaatagattgagaaatcctaactcaagagttgtcttgccaaggaaacaaaaatctctaaaggacatgcaagacacataggggatacattttcattgtacttatctttttgtgaaacagtagctttcggtctttcaagtgctcacaagcccactgttttcctggtttccggattagtgggctgtcttctggtggtactgccttgacctgagtataatgtgcacatggctttactccagcaagtttaactgataagcgtgtgttcaccagcagctcaaatggccttgtccacttggcagcaaattggtgttcaggtccttgttctttccaggtatttaggaggatctaatttcccagttgaaaaggatgtaggaccacatctgctggatgagtggtcctgctagaagcaaactcatgaacagaagttagtatagtgcctagagtcttaatatttggtaattgccaaatctcttaaaacatcagttggttctcccaccaggacaaaaacctagaatgggctaccagataatacttcaaaggggctcaatttgaacctacttgagggagccactcgaatccacaacagcaatcagcaacatcttatcccaagtcaaattagtttcttgatatattttggcaatgcttctttttagagtatggttcatcttttcagtttttcccatggattgtggtctctaagatgataatctaaaggtttcaggaagagacaagtcacagctcccctgacactcctgtcaccatcatagatagtctttgaattaaggtaggtgggtattaactacagaatacgttgcccctgtatcaataagaaagtcaataagtttgttccccactgtcaattttacccagggctcctgtgggactatgacagcagttggctaagcatacatattcaatgtatgtatgttacagaagaagctacgaatatttatgaaggtgatcctgacacatgcgtattgtacaaacatgcatgttacatatgacccatgtttaccttgaggtgaaagcgtaacatttaaatgtactacaattaggccctgtacatcaaaaggtcttttcagaacacaaaggcatgcaaatgcacaatctctataactagctagaaccagttcatggccagcagtcttattatcaggagaaaattagtgaaatcagtcttttgttcaatcaaagctatagttatggctggtggaactggggttcagttagtcagcatctatgaactggatgagttgaaattgttttaatattgcttgtcttaaggccagtgcttgcttagctgctagagaaaaagagaaaccttgtgtcattgagaatatagcttattctttaagtgtaaggatgcatgacttaactcttgcctggcatggccttaggtcctgtttataatatggtattttattgccacaaaatttcagttatgtcagtcttatgacctctattttaacattagtgttgattagttattgtatctaaaccacaaaagggagagggtataatgaggcgtatctgacttcccatcacattatacctgaagactaagtttttaaggtttttctggggtccccttagccaagagggggtccattcagtcagcagggggcttaatattttatttttagttgacattctcccatttggccaagatataccaaaggcagcataaatggccaaacttttattttgttccatattgttgctgggggtgttgtggctatgtgccccaggtccatcacatcccttggtaggatccctgtggctaaggaactcaaagccaaaagacttgtagtcaattaaacgttttaggccatttggtaagggaggtggccaagcattcattaacccttaaaaccttttaagtaacataagagccaaaaccaaaagccaaatagcaaaggtacaaaactgacctttctataagttctatgtgttgagccatcagctgtttaggcatctgtgtacctatatttggaggatctgaactaattttactccttaaaagtaaaattagtacatcaaaaggtgttttgtgcccacctcttccatgagcgtccttgggcccagagggatttaatagttttttaaatcctggagatattaggtacagagagaaaggtaaacccaatttctataagctataaatagctcaaaaagaaaaaaggcgggccaggcgcagtggctcacgcctgtaatcccagcactttgggaggctgaggcaggcagatcatgaggtcaggagatcaagaccatctttgctaacatggtggaatcccgtctctactaaaaatacaaaaaattagctgggcgtggtggcacgtgcctgtagtcccagctacttgggaggctgagacaggagaatggtgtgaacccaggaggtggagcttgcagtgagccgagattgcgccgctgcactccagcctgggtgacagagcaagactccgtctcagaaaaaaaaaaaaggctttcttgactctggaaaacaaaacataaagaattagcaacatttcaaacttaatttaggattagattttgaggacatttgtcaaaatgttaaagcctcaaaccatttgatcaaaacagaaccgccggtctttgtaaaataataattattcatttcacaaaagtgataattaaaagactttaatagcaatacagaaagttacatgaatataaagacttaacctttctaaagctcagttttcctaagtaatcaaaaacctgataaagataacaagaatgaggaattatcttgagaaaatgtaaaatctttccttttattttttgagacagggtctcactctgtcatccaggctaaagtgcagtggcacaatcatagctcactacagccttgaactcctggactcaagtgatcctcccgcctcagcctccccagtagctaagactacaggcacgcaccaccacacccagctaatttttttcagagatggggtcttgctatattgccctggctggtcttgaacgagcttcaagtgagcgtgagcctcctacctcatcctcccaaagcactaggattacaggcatgagccactgtttcccagcctaaaataattgtttcttaggccagctaccaaaaacgcaaagaaaaactttctgtagtgtgattgcttcttcttatgggaagcccatttagataacctgtaagtcaaacctgatgaaaacaatacttgaatgtaatcagacacagaaagactgttcaaggctatgagtagctgagtccaagctcgtatcacttgccacacaacagccaataagtctagagacaaggtattgtggcaaggaaagctaccttattcagagaaccagaaaaccaagaagatggtggaccagcatcataaagaaccatctgaagtcagcatgaacgttaggctcttctttatgttaagggaaggggaagaagaaggggattgggatcaagaggtgactgatgaccacagacacctgggtgccagcaagggtctgaggacgttgtaaaacttcttttttctaggtcaggtcacaatgttcctatacatctttaacataacattgttatttgtctgtatatttccttatctccttgggggttagtttggggaaaggaactgttaccattttttttaaagttgaactgcaagctaaactcctataattagctggtctatgtacagagctaagcagaagcttttagcctaaaggataatacccctgggggtcagaggcaaaatggagtcagtcatgctaagtctccctccactctctttcttttttgagatggaatttcactcttattgcccaggccggagtgcagtggcatgatctcagctcactgcaacctccgcctcctgggttcaagcaattctcttgcctcagcctcctgagtagctgagattacaggtgtccatcaccacacccagctaatttttgtagtttagtggagatggggtttcaccattgttggtcaggctggtctggaactcctgacctcaggtgatctacccaccttggcctcccaaagtgctgggacaggtgtgagccaccatgcctggcccctctactcttataattaaaccagctgttgcttttcctgccaagaaaccagtcatgaagattcacccatgttctagatgggaaaactgggctgtagcctgggagaggccagtcagggacaaagccaaagttaatatagagaatggagcttccagggtataggggttgggtctgggctagggagctggaaacctaggttttacgcttgtcccagttttgatgttagccctgagcagtgctgtttctcatcagcctctgcctgctccaggggtcacagggccaagccagatagagggctgctagcgtcactggacacaagattgctttcccacagctgtccttcctccagcccctctgctccccatccggaaacctgggtacccttcacccacctagctctgtcccgcagtgagatttattgctgactgccctgccatctaccccagggtaataaatcagggcagagcagaattgcaatcaccccatgcatggagtgtataaaaggggaagggctaagggagccacagaacctcagtggatctgcgatctaagtaagctagcttggcattccggtactgttggtaaagccaccatggaagacgccaaaaacataaagaaaggcccggcgccattctatccgctggaagatggaaccgctggagagcaactgcataaggctatgaagagatacgccctggttcctggaacaattgcttttacagatgcacatatcgaggtggacatcacttacgctgagtacttcgaaatgtccgttcggttggcagaagctatgaaacgatatgggctgaatacaaatcacagaatcgtcgtatgcagtgaaaactctcttcaattctttatgccggtgttgggcgcgttatttatcggagttgcagttgcgcccgcgaacgacatttataatgaacgtgaattgctcaacagtatgggcatttcgcagcctaccgtggtgttcgtttccaaaaaggggttgcaaaaaattttgaacgtgcaaaaaaagctcccaatcatccaaaaaattattatcatggattctaaaacggattaccagggatttcagtcgatgtacacgttcgtcacatctcatctacctcccggttttaatgaatacgattttgtgccagagtccttcgatagggacaagacaattgcactgatcatgaactcctctggatctactggtctgcctaaaggtgtcgctctgcctcatagaactgcctgcgtgagattctcgcatgccagagatcctatttttggcaatcaaatcattccggatactgcgattttaagtgttgttccattccatcacggttttggaatgtttactacactcggatatttgatatgtggatttcgagtcgtcttaatgtatagatttgaagaagagctgtttctgaggagccttcaggattacaagattcaaagtgcgctgctggtgccaaccctattctccttcttcgccaaaagcactctgattgacaaatacgatttatctaatttacacgaaattgcttctggtggcgctcccctctctaaggaagtcggggaagcggttgccaagaggttccatctgccaggtatcaggcaaggatatgggctcactgagactacatcagctattctgattacacccgagggggatgataaaccgggcgcggtcggtaaagttgttccattttttgaagcgaaggttgtggatctggataccgggaaaacgctgggcgttaatcaaagaggcgaactgtgtgtgagaggtcctatgattatgtccggttatgtaaacaatccggaagcgaccaacgccttgattgacaaggatggatggctacattctggagacatagcttactgggacgaagacgaacacttcttcatcgttgaccgcctgaagtctctgattaagtacaaaggctatcaggtggctcccgctgaattggaatccatcttgctccaacaccccaacatcttcgacgcaggtgtcgcaggtcttcccgacgatgacgccggtgaacttcccgccgccgttgttgttttggagcacggaaagacgatgacggaaaaagagatcgtggattacgtcgccagtcaagtaacaaccgcgaaaaagttgcgcggaggagttgtgtttgtggacgaagtaccgaaaggtcttaccggaaaactcgacgcaagaaaaatcagagagatcctcataaaggccaagaagggcggaaagatcgccgtgtaattctagagtcggggcggccggccgcttcgagcagacatgataagatacattgatgagtttggacaaaccacaactagaatgcagtgaaaaaaatgctttatttgtgaaatttgtgatgctattgctttatttgtaaccattataagctgcaataaacaagttaacaacaacaattgcattcattttatgtttcaggttcagggggaggtgtgggaggttttttaaagcaagtaaaacctctacaaatgtggtaaaatcgataaggatccgtcgaccgatgcccttgagagccttcaacccagtcagctccttccggtgggcgcggggcatgactatcgtcgccgcacttatgactgtcttctttatcatgcaactcgtaggacaggtgccggcagcgctcttccgcttcctcgctcactgactcgctgcgctcggtcgttcggctgcggcgagcggtatcagctcactcaaaggcggtaatacggttatccacagaatcaggggataacgcaggaaagaacatgtgagcaaaaggccagcaaaaggccaggaaccgtaaaaaggccgcgttgctggcgtttttccataggctccgcccccctgacgagcatc';
var sampleseq2='ggccgcatagataactgatccagtgtgctggaattaattcgctgtctgcgagggccagctgttggggtgagtactccctctcaaaagcgggcatgacttctgcgctaagattgtcagtttccaaaaacgaggaggatttgatattcacctggcccgcggtgatgcctttgagggtggccgcgtccatctggtcagaaaagacaatctttttgttgtcaagcttgaggtgtggcaggcttgagatctggccatacacttgagtgacaatgacatccactttgcctttctctccacaggtgtccactcccaggtccaactgcaggtcgagcatgcatctagggcggccaattccgcccctctccctcccccccccctaacgttactggccgaagccgcttggaataaggccggtgtgcgtttgtctatatgtgattttccaccatattgccgtcttttggcaatgtgagggcccggaaacctggccctgtcttcttgacgagcattcctaggggtctttcccctctcgccaaaggaatgcaaggtctgttgaatgtcgtgaaggaagcagttcctctggaagcttcttgaagacaaacaacgtctgtagcgaccctttgcaggcagcggaaccccccacctggcgacaggtgcctctgcggccaaaagccacgtgtataagatacacctgcaaaggcggcacaaccccagtgccacgttgtgagttggatagttgtggaaagagtcaaatggctctcctcaagcgtattcaacaaggggctgaaggatgcccagaaggtaccccattgtatgggatctgatctggggcctcggtgcacatgctttacatgtgtttagtcgaggttaaaaaaacgtctaggccccccgaaccacggggacgtggttttcctttgaaaaacacgatgataagcttgccacaacccacaaggagacgaccttccatgaccgagtacaagcccacggtgcgcctcgccacccgcgacgacgtcccccgggccgtacgcaccctcgccgccgcgttcgccgactaccccgccacgcgccacaccgtcgacccggaccgccacatcgagcgggtcaccgagctgcaagaactcttcctcacgcgcgtcgggctcgacatcggcaaggtgtgggtcgcggacgacggcgccgcggtggcggtctggaccacgccggagagcgtcgaagcgggggcggtgttcgccgagatcggcccgcgcatggccgagttgagcggttcccggctggccgcgcagcaacagatggaaggcctcctggcgccgcaccggcccaaggagcccgcgtggttcctggccaccgtcggcgtctcgcccgaccaccagggcaagggtctgggcagcgccgtcgtgctccccggagtggaggcggccgagcgcgccggggtgcccgccttcctggagacctccgcgccccgcaacctccccttctacgagcggctcggcttcaccgtcaccgccgacgtcgagtgcccgaaggaccgcgcgacctggtgcatgacccgcaagcccggtgcctgacgcccgccccacgacccgcagcgcccgaccgaaaggagcgcacgaccccatggctccgaccgaagccgacccgggcggccccgccgaccccgcacccgcccccgaggcccaccgactctagagctcgctgatcagcctcgactgtgccttctagttgccagccatctgttgtttgcccctcccccgtgccttccttgaccctggaaggtgccactcccactgtcctttcctaataaaatgaggaaattgcatcgcattgtctgagtaggtgtcattctattctggggggtggggtggggcaggacagcaagggggaggattgggaagacaatagcaggcatgctggggatgcggtgggctctatggcttctgaggcggaaagaaccagctggggc';
var sampleseq3='tcgaccgatgcccttgagagccttcaacccagtcagctccttccggtgggcgcggggcatgactatcgtcgccgcacttatgactgtcttctttatcatgcaactcgtaggacaggtgccggcagcgctcttccgcttcctcgctcactgactcgctgcgctcggtcgttcggctgcggcgagcggtatcagctcactcaaaggcggtaatacggttatccacagaatcaggggataacgcaggaaagaacatgtgagcaaaaggccagcaaaaggccaggaaccgtaaaaaggccgcgttgctggcgtttttccataggctccgcccccctgacgagcatcacaaaaatcgacgctcaagtcagaggtggcgaaacccgacaggactataaagataccaggcgtttccccctggaagctccctcgtgcgctctcctgttccgaccctgccgcttaccggatacctgtccgcctttctcccttcgggaagcgtggcgctttctcatagctcacgctgtaggtatctcagttcggtgtaggtcgttcgctccaagctgggctgtgtgcacgaaccccccgttcagcccgaccgctgcgccttatccggtaactatcgtcttgagtccaacccggtaagacacgacttatcgccactggcagcagccactggtaacaggattagcagagcgaggtatgtaggcggtgctacagagttcttgaagtggtggcctaactacggctacactagaagaacagtatttggtatctgcgctctgctgaagccagttaccttcggaaaaagagttggtagctcttgatccggcaaacaaaccaccgctggtagcggtggtttttttgtttgcaagcagcagattacgcgcagaaaaaaaggatctcaagaagatcctttgatcttttctacggggtctgacgctcagtggaacgaaaactcacgttaagggattttggtcatgagattatcaaaaaggatcttcacctagatccttttaaattaaaaatgaagttttaaatcaatctaaagtatatatgagtaaacttggtctgacagttaccaatgcttaatcagtgaggcacctatctcagcgatctgtctatttcgttcatccatagttgcctgactccccgtcgtgtagataactacgatacgggagggcttaccatctggccccagtgctgcaatgataccgcgagacccacgctcaccggctccagatttatcagcaataaaccagccagccggaagggccgagcgcagaagtggtcctgcaactttatccgcctccatccagtctattaattgttgccgggaagctagagtaagtagttcgccagttaatagtttgcgcaacgttgttgccattgctacaggcatcgtggtgtcacgctcgtcgtttggtatggcttcattcagctccggttcccaacgatcaaggcgagttacatgatcccccatgttgtgcaaaaaagcggttagctccttcggtcctccgatcgttgtcagaagtaagttggccgcagtgttatcactcatggttatggcagcactgcataattctcttactgtcatgccatccgtaagatgcttttctgtgactggtgagtactcaaccaagtcattctgagaatagtgtatgcggcgaccgagttgctcttgcccggcgtcaatacgggataataccgcgccacatagcagaactttaaaagtgctcatcattggaaaacgttcttcggggcgaaaactctcaaggatcttaccgctgttgagatccagttcgatgtaacccactcgtgcacccaactgatcttcagcatcttttactttcaccagcgtttctgggtgagcaaaaacaggaaggcaaaatgccgcaaaaaagggaataagggcgacacggaaatgttgaatactcatactcttcctttttcaatattattgaagcatttatcagggttattgtctcatgagcggatacatatttgaatgtatttagaaaaataaacaaataggggttccgcgcacatttccccgaaaagtgccacctgacgcgccctgtagcggcgcattaagcgcggcgggtgtggtggttacgcgcagcgtgaccgctacacttgccagcgccctagcgcccgctcctttcgctttcttcccttcctttctcgccacgttcgccggctttccccgtcaagctctaaatcgggggctccctttagggttccgatttagtgctttacggcacctcgaccccaaaaaacttgattagggtgatggttcacgtagtgggccatcgccctgatagacggtttttcgccctttgacgttggagtccacgttctttaatagtggactcttgttccaaactggaacaacactcaaccctatctcggtctattcttttgatttataagggattttgccgatttcggcctattggttaaaaaatgagctgatttaacaaaaatttaacgcgaattttaacaaaatattaacgcttacaatttgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagcccaagctaccatgataagtaagtaatattaaggtacgggaggtacttggagcggccgcaataaaatatctttattttcattacatctgtgtgttggttttttgtgtgaatcgatagtactaacatacgctctccatcaaaacaaaacgaaacaaaacaaactagcaaaataggctgtccccagtgcaagtgcaggtgccagaacatttctctatcgataggtaccgagctcttacgcgtgctagcccgggctcgagatctgcgatctaagtaagcttttaacctaaaagatattacccctgggggtcagaggcaaaatggagtcagtcatgctaagcctccctccactatttcaatttccccattgtcaaaggttcatcccacagtcttgtgggattggggaaaatgagacatcattactcacctggctacttcctgccaaacagggttgacaaggggtgactatggaatgaaaccatttgacctggctaaggaaatatttcgtagtgccatttttaggaacaatgatcatcggcatttccctttttgctttgatagttttagcgagacttgcacaacctttgtttacacagtacataataagttttactagaacgtaggccaccatgactaaaagaagaacatcaaggctgaatttaagaatgcctcccaagattgatggaattacactaggaatccaggagaataggtctttaaagcagtctctgtaagtgcccccagattaagcctgctttggtgttctaaggtttgttaaagccaggtagcctgttgtctaattgtatcaatatgggtctgtagaggaggaattaagctagcaacaggtggctagcttagggacgccatttggtaagtagaaagtaggcttgcggctgggcgcggtggctcacgcctgtaatcccagcactttgggaggccgaggcgggtggatcatgaggtcaggagatcgagaccatcctggctaacaaggtgaaaccccgtctctactaaaaatacaaaaaattagccaggcgcggtggcgggcacctgtagtcccagctactcgggaggctgaggcaggagaatggcgtgaacccgggaagcggagcttgcagtgagccgagattgcgccactgcagtccgcagtcctgcctgggcgacagagcgagactccgtctcaaaaaaaaaaaaaaagaaagtaggcttgcaggcttgtgggtccttattattgctttgcatgtagtgtctaatgaggtgctgcataagaaagaaacatggggcctctgggtatggagttatcaattggatcctatgtatgatttgagaaaccagcttctatagatctaatgcccaagaggctacatgactaaaattatgtgtacaggaacaactagaggatcagagtggtcatgtactgaacaaggtttaagatgacaaatctggcagtgtgatatgctagtgaaagaggcaatagattgagaaatcctaactcaagagttgtcttgccaaggaaacaaaaatctctaaaggacatgcaagacacataggggatacattttcattgtacttatctttttgtgaaacagtagctttcggtctttcaagtgctcacaagcccactgttttcctggtttccggattagtgggctgtcttctggtggtactgccttgacctgagtataatgtgcacatggctttactccagcaagtttaactgataagcgtgtgttcaccagcagctcaaatggccttgtccacttggcagcaaattggtgttcaggtccttgttctttccaggtatttaggaggatctaatttcccagttgaaaaggatgtaggaccacatctgctggatgagtggtcctgctagaagcaaactcatgaacagaagttagtatagtgcctagagtcttaatatttggtaattgccaaatctcttaaaacatcagttggttctcccaccaggacaaaaacctagaatgggctaccagataatacttcaaaggggctcaatttgaacctacttgagggagccactcgaatccacaacagcaatcagcaacatcttatcccaagtcaaattagtttcttgatatattttggcaatgcttctttttagagtatggttcatcttttcagtttttcccatggattgtggtctctaagatgataatctaaaggtttcaggaagagacaagtcacagctcccctgacactcctgtcaccatcatagatagtctttgaattaaggtaggtgggtattaactacagaatacgttgcccctgtatcaataagaaagtcaataagtttgttccccactgtcaattttacccagggctcctgtgggactatgacagcagttggctaagcatacatattcaatgtatgtatgttacagaagaagctacgaatatttatgaaggtgatcctgacacatgcgtattgtacaaacatgcatgttacatatgacccatgtttaccttgaggtgaaagcgtaacatttaaatgtactacaattaggccctgtacatcaaaaggtcttttcagaacacaaaggcatgcaaatgcacaatctctataactagctagaaccagttcatggccagcagtcttattatcaggagaaaattagtgaaatcagtcttttgttcaatcaaagctatagttatggctggtggaactggggttcagttagtcagcatctatgaactggatgagttgaaattgttttaatattgcttgtcttaaggccagtgcttgcttagctgctagagaaaaagagaaaccttgtgtcattgagaatatagcttattctttaagtgtaaggatgcatgacttaactcttgcctggcatggccttaggtcctgtttataatatggtattttattgccacaaaatttcagttatgtcagtcttatgacctctattttaacattagtgttgattagttattgtatctaaaccacaaaagggagagggtataatgaggcgtatctgacttcccatcacattatacctgaagactaagtttttaaggtttttctggggtccccttagccaagagggggtccattcagtcagcagggggcttaatattttatttttagttgacattctcccatttggccaagatataccaaaggcagcataaatggccaaacttttattttgttccatattgttgctgggggtgttgtggctatgtgccccaggtccatcacatcccttggtaggatccctgtggctaaggaactcaaagccaaaagacttgtagtcaattaaacgttttaggccatttggtaagggaggtggccaagcattcattaacccttaaaaccttttaagtaacataagagccaaaaccaaaagccaaatagcaaaggtacaaaactgacctttctataagttctatgtgttgagccatcagctgtttaggcatctgtgtacctatatttggaggatctgaactaattttactccttaaaagtaaaattagtacatcaaaaggtgttttgtgcccacctcttccatgagcgtccttgggcccagagggatttaatagttttttaaatcctggagatattaggtacagagagaaaggtaaacccaatttctataagctataaatagctcaaaaagaaaaaaggcgggccaggcgcagtggctcacgcctgtaatcccagcactttgggaggctgaggcaggcagatcatgaggtcaggagatcaagaccatctttgctaacatggtggaatcccgtctctactaaaaatacaaaaaattagctgggcgtggtggcacgtgcctgtagtcccagctacttgggaggctgagacaggagaatggtgtgaacccaggaggtggagcttgcagtgagccgagattgcgccgctgcactccagcctgggtgacagagcaagactccgtctcagaaaaaaaaaaaaggctttcttgactctggaaaacaaaacataaagaattagcaacatttcaaacttaatttaggattagattttgaggacatttgtcaaaatgttaaagcctcaaaccatttgatcaaaacagaaccgccggtctttgtaaaataataattattcatttcacaaaagtgataattaaaagactttaatagcaatacagaaagttacatgaatataaagacttaacctttctaaagctcagttttcctaagtaatcaaaaacctgataaagataacaagaatgaggaattatcttgagaaaatgtaaaatctttccttttattttttgagacagggtctcactctgtcatccaggctaaagtgcagtggcacaatcatagctcactacagccttgaactcctggactcaagtgatcctcccgcctcagcctccccagtagctaagactacaggcacgcaccaccacacccagctaatttttttcagagatggggtcttgctatattgccctggctggtcttgaacgagcttcaagtgagcgtgagcctcctacctcatcctcccaaagcactaggattacaggcatgagccactgtttcccagcctaaaataattgtttcttaggccagctaccaaaaacgcaaagaaaaactttctgtagtgtgattgcttcttcttatgggaagcccatttagataacctgtaagtcaaacctgatgaaaacaatacttgaatgtaatcagacacagaaagactgttcaaggctatgagtagctgagtccaagctcgtatcacttgccacacaacagccaataagtctagagacaaggtattgtggcaaggaaagctaccttattcagagaaccagaaaaccaagaagatggtggaccagcatcataaagaaccatctgaagtcagcatgaacgttaggctcttctttatgttaagggaaggggaagaagaaggggattgggatcaagaggtgactgatgaccacagacacctgggtgccagcaagggtctgaggacgttgtaaaacttcttttttctaggtcaggtcacaatgttcctatacatctttaacataacattgttatttgtctgtatatttccttatctccttgggggttagtttggggaaaggaactgttaccattttttttaaagttgaactgcaagctaaactcctataattagctggtctatgtacagagctaagcagaagcttttagcctaaaggataatacccctgggggtcagaggcaaaatggagtcagtcatgctaagtctccctccactctctttcttttttgagatggaatttcactcttattgcccaggccggagtgcagtggcatgatctcagctcactgcaacctccgcctcctgggttcaagcaattctcttgcctcagcctcctgagtagctgagattacaggtgtccatcaccacacccagctaatttttgtagtttagtggagatggggtttcaccattgttggtcaggctggtctggaactcctgacctcaggtgatctacccaccttggcctcccaaagtgctgggacaggtgtgagccaccatgcctggcccctctactcttataattaaaccagctgttgcttttcctgccaagaaaccagtcatgaagattcacccatgttctagatgggaaaactgggctgtagcctgggagaggccagtcagggacaaagccaaagttaatatagagaatggagcttccagggtataggggttgggtctgggctagggagctggaaacctaggttttacgcttgtcccagttttgatgttagccctgagcagtgctgtttctcatcagcctctgcctgctccaggggtcacagggccaagccagatagagggctgctagcgtcactggacacaagattgctttcccacagctgtccttcctccagcccctctgctccccatccggaaacctgggtacccttcacccacctagctctgtcccgcagtgagatttattgctgactgccctgccatctaccccagggtaataaatcagggcagagcagaattgcaatcaccccatgcatggagtgtataaaaggggaagggctaagggagccacagaacctcagtggatctgcgatctaagtaagctagcttggcattccggtactgttggtaaagccaccatggaagacgccaaaaacataaagaaaggcccggcgccattctatccgctggaagatggaaccgctggagagcaactgcataaggctatgaagagatacgccctggttcctggaacaattgcttttacagatgcacatatcgaggtggacatcacttacgctgagtacttcgaaatgtccgttcggttggcagaagctatgaaacgatatgggctgaatacaaatcacagaatcgtcgtatgcagtgaaaactctcttcaattctttatgccggtgttgggcgcgttatttatcggagttgcagttgcgcccgcgaacgacatttataatgaacgtgaattgctcaacagtatgggcatttcgcagcctaccgtggtgttcgtttccaaaaaggggttgcaaaaaattttgaacgtgcaaaaaaagctcccaatcatccaaaaaattattatcatggattctaaaacggattaccagggatttcagtcgatgtacacgttcgtcacatctcatctacctcccggttttaatgaatacgattttgtgccagagtccttcgatagggacaagacaattgcactgatcatgaactcctctggatctactggtctgcctaaaggtgtcgctctgcctcatagaactgcctgcgtgagattctcgcatgccagagatcctatttttggcaatcaaatcattccggatactgcgattttaagtgttgttccattccatcacggttttggaatgtttactacactcggatatttgatatgtggatttcgagtcgtcttaatgtatagatttgaagaagagctgtttctgaggagccttcaggattacaagattcaaagtgcgctgctggtgccaaccctattctccttcttcgccaaaagcactctgattgacaaatacgatttatctaatttacacgaaattgcttctggtggcgctcccctctctaaggaagtcggggaagcggttgccaagaggttccatctgccaggtatcaggcaaggatatgggctcactgagactacatcagctattctgattacacccgagggggatgataaaccgggcgcggtcggtaaagttgttccattttttgaagcgaaggttgtggatctggataccgggaaaacgctgggcgttaatcaaagaggcgaactgtgtgtgagaggtcctatgattatgtccggttatgtaaacaatccggaagcgaccaacgccttgattgacaaggatggatggctacattctggagacatagcttactgggacgaagacgaacacttcttcatcgttgaccgcctgaagtctctgattaagtacaaaggctatcaggtggctcccgctgaattggaatccatcttgctccaacaccccaacatcttcgacgcaggtgtcgcaggtcttcccgacgatgacgccggtgaacttcccgccgccgttgttgttttggagcacggaaagacgatgacggaaaaagagatcgtggattacgtcgccagtcaagtaacaaccgcgaaaaagttgcgcggaggagttgtgtttgtggacgaagtaccgaaaggtcttaccggaaaactcgacgcaagaaaaatcagagagatcctcataaaggccaagaagggcggaaagatcgccgtgtaattctagagtcggggcggccggcagcctgcagcgcggccgcatagataactgatccagtgtgctggaattaattcgctgtctgcgagggccagctgttggggtgagtactccctctcaaaagcgggcatgacttctgcgctaagattgtcagtttccaaaaacgaggaggatttgatattcacctggcccgcggtgatgcctttgagggtggccgcgtccatctggtcagaaaagacaatctttttgttgtcaagcttgaggtgtggcaggcttgagatctggccatacacttgagtgacaatgacatccactttgcctttctctccacaggtgtccactcccaggtccaactgcaggtcgagcatgcatctagggcggccaattccgcccctctccctcccccccccctaacgttactggccgaagccgcttggaataaggccggtgtgcgtttgtctatatgtgattttccaccatattgccgtcttttggcaatgtgagggcccggaaacctggccctgtcttcttgacgagcattcctaggggtctttcccctctcgccaaaggaatgcaaggtctgttgaatgtcgtgaaggaagcagttcctctggaagcttcttgaagacaaacaacgtctgtagcgaccctttgcaggcagcggaaccccccacctggcgacaggtgcctctgcggccaaaagccacgtgtataagatacacctgcaaaggcggcacaaccccagtgccacgttgtgagttggatagttgtggaaagagtcaaatggctctcctcaagcgtattcaacaaggggctgaaggatgcccagaaggtaccccattgtatgggatctgatctggggcctcggtgcacatgctttacatgtgtttagtcgaggttaaaaaaacgtctaggccccccgaaccacggggacgtggttttcctttgaaaaacacgatgataagcttgccacaacccacaaggagacgaccttccatgaccgagtacaagcccacggtgcgcctcgccacccgcgacgacgtcccccgggccgtacgcaccctcgccgccgcgttcgccgactaccccgccacgcgccacaccgtcgacccggaccgccacatcgagcgggtcaccgagctgcaagaactcttcctcacgcgcgtcgggctcgacatcggcaaggtgtgggtcgcggacgacggcgccgcggtggcggtctggaccacgccggagagcgtcgaagcgggggcggtgttcgccgagatcggcccgcgcatggccgagttgagcggttcccggctggccgcgcagcaacagatggaaggcctcctggcgccgcaccggcccaaggagcccgcgtggttcctggccaccgtcggcgtctcgcccgaccaccagggcaagggtctgggcagcgccgtcgtgctccccggagtggaggcggccgagcgcgccggggtgcccgccttcctggagacctccgcgccccgcaacctccccttctacgagcggctcggcttcaccgtcaccgccgacgtcgagtgcccgaaggaccgcgcgacctggtgcatgacccgcaagcccggtgcctgacgcccgccccacgacccgcagcgcccgaccgaaaggagcgcacgaccccatggctccgaccgaagccgacccgggcggccccgccgaccccgcacccgcccccgaggcccaccgactctagagctcgctgatcagcctcgactgtgccttctagttgccagccatctgttgtttgcccctcccccgtgccttccttgaccctggaaggtgccactcccactgtcctttcctaataaaatgaggaaattgcatcgcattgtctgagtaggtgtcattctattctggggggtggggtggggcaggacagcaagggggaggattgggaagacaatagcaggcatgctggggatgcggtgggctctatggcttctgaggcggaaagaaccagctggggc';

function clearseq(id){
	document.getElementById(id).value='';
	clearresults()

	document.getElementById("fileWarning").innerHTML = "";
}

function clearSequences(){
	clearseq('seq1')
	clearseq('seq2')
	clearseq('seq3')
	clearresults()
}

function setseq(id,seq){
	document.getElementById(id).value=seq;
	document.getElementById("fileWarning").innerHTML = "";
}

function clearresults(){
	document.getElementById("cutinseq1").innerHTML ='';
	document.getElementById("cutinseq2").innerHTML = '';
	document.getElementById("cutinseq3").innerHTML = '';
	document.getElementById("cutinseq1notin3").innerHTML = '';
	document.getElementById("cutinseq2notin3").innerHTML = '';
	document.getElementById("nocutinseq1").innerHTML ='';
	document.getElementById("nocutinseq2").innerHTML = '';
	document.getElementById("nocutinseq3").innerHTML = '';

	document.getElementById("fileWarning").innerHTML = "";

	resetListLabels();
}

function remvoveFastaID(seq){
	seqout=seq.replace(/^>.*\n/, '');
	//console.log(seqout);
	return seqout
}

function remvoveFurtherFastaSeqs(seq){
	seqout=seq.replace(/>[\s\S]*/m, '');
	//console.log(seqout);
	return seqout
}

function tidydna(seq){
	var seqout=seq.replace(/[^a-z,A-Z]|[\,]/g, '');
	//console.log(seq + '#'+ seqout);
	return seqout
}

function tidydnaATCG(seq){
	var seqout=seq.replace(/[^a,t,g,c,A,T,G,C]|[\,]/g, '');
	//console.log(seq + '#'+ seqout);
	return seqout
}

function getSequence(seqID){
	var commenttext = document.getElementById("commenton").innerHTML;
	// Get the value of the input field
	var seq=document.getElementById("seq" + seqID).value;
	seq = remvoveFastaID(seq);
	seqF = remvoveFurtherFastaSeqs(seq);
	var fRemoved=(seq.length!=seqF.length);
	seq = tidydna(seqF);
	commenttext = commenttext + "Sequence " + seqID + ": " + seq.length.toString().bold() + " chars, ";

	var checkseq=tidydnaATCG(seq);

	if(checkseq.length!=seq.length){
		commenttext = commenttext + ' but only ' + checkseq.length.toString().bold().fontcolor('red') + " ATGCs(!), please check input!, ".fontcolor('red');
	}

	if(fRemoved){
		commenttext = commenttext + "contains more than one FASTA sequence, additional sequences are ignored! ".fontcolor('red');
	}

	if(document.getElementById("circular" + seqID).checked == true){
		seq=seq+seq.substr(0, 30) //find matches also for the circular case
	}

	document.getElementById("commenton").innerHTML = commenttext;

	return seq;
}

function myFunction() {
	var seq1, seq2, seq3, checkseq, text1='', text2 = '', text3='',
		notext1='', notext2 = '', notext3='',text13='',text23 ='' ,
		nfw1,nrv1,nfw2,nrv2,nfw3,nrv3,
		commenttext='Info: ';

	var allSeqsNum = 0;

	var seq1CutNum = 0;
	var seq2CutNum = 0;
	var seq3CutNum = 0;

	var seq1NoCutNum = 0;
	var seq2NoCutNum = 0;
	var seq3NoCutNum = 0;

	var seq13CutNum = 0;
	var seq23CutNum = 0;

	document.getElementById("fileWarning").innerHTML = "";

	document.getElementById("commenton").innerHTML = commenttext;
	seq1=getSequence("1");
	seq2=getSequence("2");
	seq3=getSequence("3");

	var enzymesToUse     = document.getElementById("EnzymesToUse");

	for (var i = 0; i < enzymearray.length; i++) {

		if(enzymesToUse[i].hidden)
		{
			continue;
		}

		allSeqsNum++;

		nfw1=testforcut(seq1, regexfw[i]);
		nrv1=testforcut(seq1, regexrv[i]);
		nfw2=testforcut(seq2, regexfw[i]);
		nrv2=testforcut(seq2, regexrv[i]);
		nfw3=testforcut(seq3, regexfw[i]);
		nrv3=testforcut(seq3, regexrv[i]);

		n1=nfw1+nrv1
		if(n1 >-2 ){
			seq1CutNum++;
			text1 = text1 + enzymearray[i][0] + " " + recognition[i].bold() +
			' ' + numberofcut(seq1,regexfw[i])+ ' ' + numberofcut(seq1,regexrv[i])    +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}else{
			seq1NoCutNum++;
			notext1 = notext1 + enzymearray[i][0] + " " + recognition[i].bold()    +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}

		n2=nfw2+nrv2
		if(n2 >-2 ){
			seq2CutNum++;
			text2 = text2 + enzymearray[i][0] + " " + recognition[i].bold()+
			' ' + numberofcut(seq2,regexfw[i])+ ' ' + numberofcut(seq2,regexrv[i])    +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}else{
			seq2NoCutNum++;
			notext2 = notext2 + enzymearray[i][0] + " " + recognition[i].bold()    +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}

		n3=nfw3+nrv3
		if(n3 >-2 ){
			seq3CutNum++;
			text3 = text3 + enzymearray[i][0] + " " + recognition[i].bold() +
			' ' + numberofcut(seq3,regexfw[i])+ ' ' + numberofcut(seq3,regexrv[i])    +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}else{
			seq3NoCutNum++;
			notext3 = notext3 + enzymearray[i][0] + " " + recognition[i].bold()   +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}

		if((n1>-2)&&(n3==-2)){
			seq13CutNum++;
			text13 = text13 + enzymearray[i][0] + " " + recognition[i].bold()+
			' ' + numberofcut(seq1,regexfw[i])+ ' ' + numberofcut(seq1,regexrv[i])    +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}

		if((n2>-2)&&(n3==-2)){
			seq23CutNum++;
			text23 = text23 + enzymearray[i][0] + " " + recognition[i].bold()+
			' ' + numberofcut(seq2,regexfw[i])+ ' ' + numberofcut(seq2,regexrv[i])    +
			' <a href="http://rebase.neb.com/rebase/enz/'+ enzymearray[i][0] +'.html" target="_blank">'+ enzymearray[i][0]+'</a>'+
			'<BR>';
		}
	}

	document.getElementById("cutinseq1").innerHTML = text1;
	document.getElementById("cutinseq2").innerHTML = text2;
	document.getElementById("cutinseq3").innerHTML = text3;

	if(seq3.length>1){
		document.getElementById("cutinseq1notin3").innerHTML = text13;
		document.getElementById("cutinseq2notin3").innerHTML = text23;
	}
	else{
		document.getElementById("cutinseq1notin3").innerHTML = '';
		document.getElementById("cutinseq2notin3").innerHTML = '';
	}

	if(seq1.length>1){document.getElementById("nocutinseq1").innerHTML = notext1;} else document.getElementById("nocutinseq1").innerHTML = '';
	if(seq2.length>1){document.getElementById("nocutinseq2").innerHTML = notext2;} else document.getElementById("nocutinseq2").innerHTML = '';
	if(seq3.length>1){document.getElementById("nocutinseq3").innerHTML = notext3;} else document.getElementById("nocutinseq3").innerHTML = '';

	document.getElementById("cutinseq1notin3Label").innerHTML = cutinseq1notin3Label + " (" + seq13CutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("cutinseq2notin3Label").innerHTML = cutinseq2notin3Label + " (" + seq23CutNum + " of " + allSeqsNum + " selected enzymes):";

	document.getElementById("cutinseq1Label").innerHTML = cutinseq1Label + " (" + seq1CutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("cutinseq2Label").innerHTML = cutinseq2Label + " (" + seq2CutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("cutinseq3Label").innerHTML = cutinseq3Label + " (" + seq3CutNum + " of " + allSeqsNum + " selected enzymes):";

	document.getElementById("nocutinseq1Label").innerHTML = nocutinseq1Label + " (" + seq1NoCutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("nocutinseq2Label").innerHTML = nocutinseq2Label + " (" + seq2NoCutNum + " of " + allSeqsNum + " selected enzymes):";
	document.getElementById("nocutinseq3Label").innerHTML = nocutinseq3Label + " (" + seq3NoCutNum + " of " + allSeqsNum + " selected enzymes):";
}
