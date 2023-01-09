// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

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
	let disposable = vscode.commands.registerCommand('got.createUnitTests', async function () {
		// The code you place here will be executed every time your command is executed

		var functionNames = []
		var packageName = ""

		const fileUri = vscode.window.activeTextEditor.document.uri

		await vscode.workspace.openTextDocument(fileUri.fsPath).then((document) => {
			
			let firstLine = document.lineAt(0)
			if (firstLine.text.includes("package")) {
				packageName = firstLine.text
			}

			for (let num = 0; num < document.lineCount; num++) {
				let textLine = document.lineAt(num)
				if (textLine.text.includes("func")) {
					let lineParts = textLine.text.split(" ")
					if (lineParts[1] != "") {
						let functionNameEndIndex = lineParts[1].indexOf("(")
						let firstCharacterUppercase = lineParts[1].substring(0, 1).toUpperCase()
						functionNames.push("Test" + firstCharacterUppercase + lineParts[1].substring(1, functionNameEndIndex) + "(t *testing.T){}")
					}
				}
			}
		});

		var targetFilename = fileUri.fsPath.substring(0, fileUri.fsPath.length-3) + "_test.go"
		vscode.window.showInformationMessage("creating " + targetFilename + "file");

		var fileContent = ""
		fileContent += packageName
		fileContent += "\n\n"

		const imports = "import (\n\t\"testing\"\n)"
		fileContent += imports
		fileContent += "\n\n"

		functionNames.forEach(function(functionName){
			fileContent += "func " + functionName
			fileContent += "\n\n"
		});

		fs.writeFile(targetFilename, fileContent, function(){
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
