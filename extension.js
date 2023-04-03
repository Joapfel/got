// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const { parseJsonConfigFileContent } = require('typescript');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function getFirstCharacterUpperAndLower(functionName) {
	var firstCharacterUppercase = functionName.substring(0, 1).toUpperCase()
	var firstCharacterLowercase = functionName.substring(0, 1).toLowerCase()
	return [firstCharacterUppercase, firstCharacterLowercase]
}

function getFunctionNameWithoutFirstCharacter(functionName){
	return functionName.substring(1)
}

function createFunctionFromFunctionNames(functionName){
	var firstCharacterUppercase = getFirstCharacterUpperAndLower(functionName)[0]
	var functionNameWithoutFirstCharacter = getFunctionNameWithoutFirstCharacter(functionName)
	var functionDeclaration = "func Test" + firstCharacterUppercase + functionNameWithoutFirstCharacter + "(t *testing.T){"
	return [functionDeclaration, "}"]
}

async function isValidFile(){
	const fileUri = vscode.window.activeTextEditor.document.uri
	if (!fileUri.fsPath.endsWith(".go")){
		return false
	}
	var rval = true
	/*await vscode.workspace.openTextDocument(fileUri.fsPath).then((document) => {
		let firstLine = document.lineAt(0)
		if (!firstLine.text.includes("package")) {
			rval = false
		}
	});*/
	return rval
}

async function getPackageNameOfCurrentFile(){
	var packageName = ""

	const fileUri = vscode.window.activeTextEditor.document.uri
	await vscode.workspace.openTextDocument(fileUri.fsPath).then((document) => {
		for (let num = 0; num < document.lineCount-1; num++ ){
			let currentLine = document.lineAt(num)
			if (currentLine.text.includes("package")) {
				packageName = currentLine.text
				break
			}
		}
	});

	return packageName
}

async function getFunctionNamesOfCurrentFile(){
	var functionNames = []

	const fileUri = vscode.window.activeTextEditor.document.uri
	await vscode.workspace.openTextDocument(fileUri.fsPath).then((document) => {
		for (let num = 0; num < document.lineCount; num++) {
			let textLine = document.lineAt(num)

			if (textLine.text.includes("func")) {
				let lineParts = textLine.text.split(" ")

				if (lineParts[1] != "" && lineParts[1].charAt(0) != "(") {
					let functionNameEndIndex = lineParts[1].indexOf("(")
					functionNames.push(lineParts[1].substring(0, functionNameEndIndex))

				} else if (lineParts[1].charAt(0) == "(") {
					let typeNameEndIndex = lineParts[2].indexOf(")")
					let typeName = lineParts[2].substring(0, typeNameEndIndex)

					let functionNameEndIndex = lineParts[3].indexOf("(")
					let functionName = lineParts[3].substring(0, functionNameEndIndex)
					functionName = functionName.charAt(0).toUpperCase() + functionName.slice(1)

					functionNames.push(typeName + functionName)	
				}
			}
		}
	});

	return functionNames
}

function getTargetFileName(){
	const fileUri = vscode.window.activeTextEditor.document.uri
	return fileUri.fsPath.substring(0, fileUri.fsPath.length-3) + "_test.go"
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "got" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let createUnitTests = vscode.commands.registerCommand('got.createUnitTests', async function () {
		// The code you place here will be executed every time your command is executed

		var isValid = await isValidFile()
		if (!isValid) {
			vscode.window.showInformationMessage("not a valid .go file");
			return
		}

		var packageName = await getPackageNameOfCurrentFile()
		var functionNames = await getFunctionNamesOfCurrentFile()
		var targetFilename = getTargetFileName()

		vscode.window.showInformationMessage("creating " + targetFilename + " file");

		var fileContent = ""
		fileContent += packageName
		fileContent += "\n\n"

		const imports = "import (\n\t\"testing\"\n)"
		fileContent += imports
		fileContent += "\n\n"

		functionNames.forEach(function(functionName){
			var [functionDefinition, functionClosing] = createFunctionFromFunctionNames(functionName)

			fileContent += functionDefinition
			fileContent += "\n\n"	
			fileContent += functionClosing
			fileContent += "\n\n"
		});

		fs.writeFile(targetFilename, fileContent, function(){
		});
	});

	// The command has been defined in the package.json file^
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let createUnitTestsWithTable = vscode.commands.registerCommand('got.createUnitTestsWithTable', async function () {
		// The code you place here will be executed every time your command is executed

		var isValid = await isValidFile()
		if (!isValid) {
			vscode.window.showInformationMessage("not a valid .go file");
			return
		}

		var packageName = await getPackageNameOfCurrentFile()
		var functionNames = await getFunctionNamesOfCurrentFile()
		var targetFilename = getTargetFileName()
		
		vscode.window.showInformationMessage("creating " + targetFilename + " file");

		var fileContent = ""
		fileContent += packageName
		fileContent += "\n\n"

		const imports = "import (\n\t\"testing\"\n)"
		fileContent += imports
		fileContent += "\n\n"

		functionNames.forEach(function(functionName){
			console.log(functionName)
			var firstCharacterLowercase = getFirstCharacterUpperAndLower(functionName)[1]

			var functionNameWithoutFirstCharacter = getFunctionNameWithoutFirstCharacter(functionName)
			var [functionDefinition, functionClosing] = createFunctionFromFunctionNames(functionName)

			fileContent += functionDefinition
			fileContent += "\n\n"

			// add table driven tests
			fileContent += "\ttype " + firstCharacterLowercase + functionNameWithoutFirstCharacter + "Tests struct {"
			fileContent += "\n\n"	
			fileContent += "\t}"
			fileContent += "\n\n"

			fileContent += "\ttests := []" + firstCharacterLowercase + functionNameWithoutFirstCharacter + "Tests {"
			fileContent += "\n"
			fileContent += "\t\t{},"
			fileContent += "\n"
			fileContent += "\t}"
			fileContent += "\n\n"

			// loop over tests 
			fileContent += "\tfor _, test := range tests {"
			fileContent += "\n"
			fileContent += "\t\tt.Log(test)"
			fileContent += "\n\t}" 
			fileContent += "\n\n"	

			fileContent += functionClosing
			fileContent += "\n\n"
		});

		fs.writeFile(targetFilename, fileContent, function(){
		});
	});

		// The command has been defined in the package.json file^
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let createUnitTestsWithMockServer = vscode.commands.registerCommand('got.createUnitTestsWithMockServer', async function () {
		// The code you place here will be executed every time your command is executed

		var isValid = await isValidFile()
		if (!isValid) {
			vscode.window.showInformationMessage("not a valid .go file");
			return
		}

		var packageName = await getPackageNameOfCurrentFile()
		var functionNames = await getFunctionNamesOfCurrentFile()
		var targetFilename = getTargetFileName()
		
		vscode.window.showInformationMessage("creating " + targetFilename + " file");

		var fileContent = ""
		fileContent += packageName
		fileContent += "\n\n"

		const imports = "import (\n\t\"testing\"\n)"
		fileContent += imports
		fileContent += "\n\n"

		functionNames.forEach(function(functionName){
			console.log(functionName)
			var firstCharacterLowercase = getFirstCharacterUpperAndLower(functionName)[1]

			var functionNameWithoutFirstCharacter = getFunctionNameWithoutFirstCharacter(functionName)
			var [functionDefinition, functionClosing] = createFunctionFromFunctionNames(functionName)

			var mockServer = "\n\t\t/*requestChan := make(chan bool)\n\t\tts := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {\n\t\t\trequestChan <- true\n\t\t}))\n\t\t<-requestChan*/\n"

			fileContent += functionDefinition
			fileContent += "\n\n"

			// add table driven tests
			fileContent += "\ttype " + firstCharacterLowercase + functionNameWithoutFirstCharacter + "Tests struct {"
			fileContent += "\n\n"	
			fileContent += "\t}"
			fileContent += "\n\n"

			fileContent += "\ttests := []" + firstCharacterLowercase + functionNameWithoutFirstCharacter + "Tests {"
			fileContent += "\n"
			fileContent += "\t\t{},"
			fileContent += "\n"
			fileContent += "\t}"
			fileContent += "\n\n"

			// loop over tests 
			fileContent += "\tfor _, test := range tests {"
			fileContent += "\n"
			fileContent += "\t\tt.Log(test)"
			fileContent += mockServer
			fileContent += "\n\t}" 
			fileContent += "\n\n"	

			fileContent += functionClosing
			fileContent += "\n\n"
		});

		fs.writeFile(targetFilename, fileContent, function(){
		});
	});

	context.subscriptions.push(createUnitTests);
	context.subscriptions.push(createUnitTestsWithTable);
	context.subscriptions.push(createUnitTestsWithMockServer);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
