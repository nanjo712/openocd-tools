// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { assert } from 'console';
import { stat } from 'fs';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "openocd-tools" is now active!');
	const cfgFileName = context.workspaceState.get("openocd-tools.cfg", "").split("/").pop();
	const targetFileName = context.workspaceState.get("openocd-tools.target", "").split("/").pop();

	const statusBarChooseCfg = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarChooseCfg.text = "$(file-directory) Choose cfg";
	statusBarChooseCfg.command = "openocd-tools.chooseCfg";
	statusBarChooseCfg.tooltip = "CFG file for OpenOCD: [" + cfgFileName + "]";
	statusBarChooseCfg.show();

	const statusBarChooseTarget = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarChooseTarget.text = "$(file-directory) Choose target";
	statusBarChooseTarget.command = "openocd-tools.chooseTarget";
	statusBarChooseTarget.tooltip = "Target file for OpenOCD: [" + targetFileName + "]";
	statusBarChooseTarget.show();

	const statusBarFlash = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarFlash.text = "$(triangle-right) Flash";
	statusBarFlash.command = "openocd-tools.flash";
	statusBarFlash.show();

	const statusBarDebug = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarDebug.text = "$(bug) Debug";
	statusBarDebug.command = "openocd-tools.debug";
	statusBarDebug.show();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposableForFlash = vscode.commands.registerCommand('openocd-tools.flash', () => {
		const cfgFile = context.workspaceState.get("openocd-tools.cfg", "");
		const targetFile = context.workspaceState.get("openocd-tools.target", "");
		if (cfgFile === '') {
			vscode.window.showErrorMessage("Please choose a cfg file first");
			return;
		}
		if (targetFile === '') {
			vscode.window.showErrorMessage("Please choose a target file first");
			return;
		}
		vscode.commands.executeCommand("cmake.build").then((ret) => {
			if (ret) {
				vscode.window.showErrorMessage("Build failed");
				return;
			}
			const terminal = vscode.window.createTerminal("OpenOCD Flash");
			terminal.show();
			terminal.sendText(`openocd -f ${cfgFile} -c "program ${targetFile} verify reset exit"`);
		});
	});
	context.subscriptions.push(disposableForFlash);	

	const disposableForDebug = vscode.commands.registerCommand('openocd-tools.debug', () => {
		const cfgFile = context.workspaceState.get("openocd-tools.cfg", "");
		const targetFile = context.workspaceState.get("openocd-tools.target", "");
		if (cfgFile === '') {
			vscode.window.showErrorMessage("Please choose a cfg file first");
			return;
		}
		if (targetFile === '') {
			vscode.window.showErrorMessage("Please choose a target file first");
			return;
		}
		vscode.commands.executeCommand("cmake.build").then((ret) => {
			if (ret) {
				vscode.window.showErrorMessage("Build failed");
				return;
			}
			const terminal = vscode.window.createTerminal("OpenOCD Debug");
			terminal.show();
			terminal.sendText(`openocd -f ${cfgFile} -c "gdb_port 3333"`);
		});
	});
	context.subscriptions.push(disposableForDebug);

	const disposableForChooseCfg = vscode.commands.registerCommand('openocd-tools.chooseCfg', () => {
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			defaultUri: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined,
			filters: {
				"OpenOCD Config": ["cfg"],
				"All Files": ["*"]
			}
		}).then((fileUri) => {
			if (fileUri) {
				const filePath = fileUri[0].fsPath;
				const cfgFile = filePath;
				const fileName = filePath.split("/").pop();
				statusBarChooseCfg.tooltip = "CFG file for OpenOCD: [" + fileName + "]";
				context.workspaceState.update("openocd-tools.cfg", cfgFile);
			}
		});
	});
	context.subscriptions.push(disposableForChooseCfg);

	const disposableForChooseTarget = vscode.commands.registerCommand('openocd-tools.chooseTarget', () => {
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			// set default path to workspace's build directory
			defaultUri: vscode.workspace.workspaceFolders ? vscode.Uri.file(vscode.workspace.workspaceFolders[0].uri.fsPath + "/build") : undefined,
			filters: {
				"Executable and Linkable Format": ["elf"],
				"All Files": ["*"]
			}
		}).then((fileUri) => {
			if (fileUri) {
				const filePath = fileUri[0].fsPath;
				const targetFile = filePath;
				const fileName = filePath.split("/").pop();
				statusBarChooseTarget.tooltip = "Target file for OpenOCD: [" + fileName + "]";
				context.workspaceState.update("openocd-tools.target", targetFile);
			}
		});
	});
	context.subscriptions.push(disposableForChooseTarget);
}

// This method is called when your extension is deactivated
export function deactivate() {}
