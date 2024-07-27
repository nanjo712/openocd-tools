import { assert } from 'console';
import { stat } from 'fs';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "openocd-tools" is now active!');
	const cfgFileName = context.workspaceState.get("openocd-tools.cfg", "").split("/").pop();
	const targetFileName = context.workspaceState.get("openocd-tools.target", "").split("/").pop();
	const svdFileName = context.workspaceState.get("openocd-tools.svd", "").split("/").pop();	

	let DebugTerminal: vscode.Terminal | undefined = undefined;
	let FlashTerminal: vscode.Terminal | undefined = undefined;

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

	const statusBarChooseSVD = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarChooseSVD.text = "$(file-directory) Choose SVD";
	statusBarChooseSVD.command = "openocd-tools.chooseSVD";
	statusBarChooseSVD.tooltip = "SVD file for OpenOCD: [" + svdFileName + "]";
	statusBarChooseSVD.show();

	const statusBarFlash = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarFlash.text = "$(triangle-right) Flash";
	statusBarFlash.command = "openocd-tools.flash";
	statusBarFlash.show();

	const statusBarDebug = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarDebug.text = "$(bug) Debug";
	statusBarDebug.command = "openocd-tools.debug";
	statusBarDebug.show();

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
			if (!FlashTerminal) {
				FlashTerminal = vscode.window.createTerminal("OpenOCD Flash");
			}
			FlashTerminal.show();
			FlashTerminal.sendText(`openocd -f ${cfgFile} -c "program ${targetFile} verify reset exit"`);
		});
	});
	context.subscriptions.push(disposableForFlash);	

	const disposableForDebug = vscode.commands.registerCommand('openocd-tools.debug', () => {
		const cfgFile = context.workspaceState.get("openocd-tools.cfg", "");
		const targetFile = context.workspaceState.get("openocd-tools.target", "");
		const svdFile = context.workspaceState.get("openocd-tools.svd", "");
		if (cfgFile === '') {
			vscode.window.showErrorMessage("Please choose a cfg file first");
			return;
		}
		if (targetFile === '') {
			vscode.window.showErrorMessage("Please choose a target file first");
			return;
		}
		if (svdFile === '') {
			vscode.window.showInformationMessage("No SVD file chosen, debugging without SVD file");
		}
		vscode.commands.executeCommand("cmake.build").then((ret) => {
			if (ret) {
				vscode.window.showErrorMessage("Build failed");
				return;
			}
			if (!DebugTerminal) {
				DebugTerminal = vscode.window.createTerminal("OpenOCD Debug");
			}
			DebugTerminal.show();
			DebugTerminal.sendText(`openocd -f ${cfgFile} -c "gdb_port 3333" -c "tcl_port disabled" -c "telnet_port 4444"`);
			const launchConfig = {
				name: "OpenOCD Debug",
            	type: "cppdbg",
            	request: "launch",
	            program: targetFile,
    	        svdPath: svdFile,
        	    args: [],
            	stopAtEntry: false,
	            cwd: "${workspaceFolder}",
    	        environment: [],
        	    externalConsole: false,
            	MIMode: "gdb",
            	setupCommands: [
                	{
	                    "description": "Enable pretty-printing for gdb",
    	                "text": "-enable-pretty-printing",
        	            "ignoreFailures": true
            	    },
	                {
    	                "description": "Set Disassembly Flavor to Intel",
        	            "text": "-gdb-set disassembly-flavor intel",
            	        "ignoreFailures": true
	                },
    	            {
        	            "description": "Set remote target to port 3333",
            	        "text": "target remote :3333",
                	    "ignoreFailures": false
                	}
            	]
			};
			vscode.debug.startDebugging(vscode.workspace.workspaceFolders![0], launchConfig);
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

	const disposableForChooseSVD = vscode.commands.registerCommand('openocd-tools.chooseSVD', () => {
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			// set default path to workspace's build directory
			defaultUri: vscode.workspace.workspaceFolders ? vscode.Uri.file(vscode.workspace.workspaceFolders[0].uri.fsPath + "/build") : undefined,
			filters: {
				"System View Description": ["svd"],
				"All Files": ["*"]
			}
		}).then((fileUri) => {
			if (fileUri) {
				const filePath = fileUri[0].fsPath;
				const svdFile = filePath;
				const fileName = filePath.split("/").pop();
				statusBarChooseTarget.tooltip = "SVD file for OpenOCD: [" + fileName + "]";
				context.workspaceState.update("openocd-tools.svd", svdFile);
			}
		});
	});
	context.subscriptions.push(disposableForChooseSVD);

	const terminateDebug = vscode.debug.onDidTerminateDebugSession((session) => {
		if (session.name === "OpenOCD Debug") {
			if (DebugTerminal) {
				DebugTerminal.sendText("\x03");
			}
		}
	});
	context.subscriptions.push(terminateDebug);
}

// This method is called when your extension is deactivated
export function deactivate() {}
