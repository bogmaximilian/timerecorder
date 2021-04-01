// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

let recordstart: string;
let isRecording = false;


function writetoLog() {
	//Set recording end
	const recordend = new Date();

	//Get log path from configuration
	const path = vscode.workspace.getConfiguration('timerecorder').get('defaultlogpath');

	//Write to file
	var regex = /\//gi; 
	fs.appendFile(path + `\\${recordend.toLocaleDateString().replace(regex, '_')}.txt`, `[${recordstart}-${recordend.toLocaleTimeString()}]\n`, (err)  => {
		if(err) {
			console.log(err);
		}
	});
}

function setdefaultlogpath() {
	//Open Select Folder Dialog
	const options: vscode.OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Select',
		canSelectFiles: false,
		canSelectFolders: true
	};
   
   vscode.window.showOpenDialog(options).then(fileUri => {
	   if (fileUri && fileUri[0]) {
		   vscode.workspace.getConfiguration('timerecorder').update('defaultlogpath', fileUri[0].fsPath, true);
	   }
   });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	//Check if Log Path has already been set
	const logpath = vscode.workspace.getConfiguration('timerecorder').defaultlogpath;
	if(logpath === '') {
		setdefaultlogpath();
	}

	let logpathcmd = vscode.commands.registerCommand('timerecorder.setdefaultlogpath', () => {
		setdefaultlogpath();
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let startcmd = vscode.commands.registerCommand('timerecorder.startrecording', () => {
		if(isRecording) {
			let items: string[] = ["Stop current recording, log it to file and start new recording", "Stop current recording log it to file"]; 
			
			vscode.window.showQuickPick(items).then(value => {
				isRecording = true;
				
				switch(items.indexOf(value as string)) {
					//Stop current recording log and start new options
					case 0:
						writetoLog();
						
						recordstart = new Date().toLocaleTimeString();
						isRecording = true;
						break;

					//Just stop recording
					case 1:
						writetoLog();
						isRecording = false;
						break;
				}
			});
		}
		else {
			//Start recording
			recordstart = new Date().toLocaleTimeString();
			isRecording = true;
			//Log output to user
			vscode.window.showInformationMessage('Started Recording at ' + recordstart);
		}
		
	});

	let stopcmd = vscode.commands.registerCommand('timerecorder.stoprecording', () => {

		if(isRecording) {
			let items: string[] = ["Stop current recording, log it to file", "Stop current recording and start new one"]; 
			
			vscode.window.showQuickPick(items).then(value => {
				isRecording = true;
				
				switch(items.indexOf(value as string)) {
					//Stop current recording log
					case 0:
						writetoLog();
						break;

					//Just stop recording
					case 1:
						writetoLog();
						
						recordstart = new Date().toLocaleTimeString();
						isRecording = true;
						break;
				}
			});

			//Log output to user
			vscode.window.showInformationMessage('Stopped Recording at ' + new Date().toLocaleTimeString());
		}
	});

	context.subscriptions.push(startcmd);
	context.subscriptions.push(stopcmd);
}

// this method is called when your extension is deactivated
export function deactivate() {}
