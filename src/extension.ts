import { assert } from 'console';
import { stat } from 'fs';
import * as vscode from 'vscode';

class OpenOCDTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
	
	constructor(private context: vscode.ExtensionContext) {}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
		if (!element) {
				const items = [];
				const cfgFile = this.context.workspaceState.get("openocd-tools.cfg", "");
				const targetFile = this.context.workspaceState.get("openocd-tools.target", "");
				const svdFile = this.context.workspaceState.get("openocd-tools.svd", "");
				const cfgFileName = cfgFile.split(/[/\\]+/).pop();
				const targetFileName = targetFile.split(/[/\\]+/).pop();
				const svdFileName = svdFile.split(/[/\\]+/).pop();
				if (cfgFile === "") {
					const item = new vscode.TreeItem("Choose CFG file", vscode.TreeItemCollapsibleState.None);
					item.command = { command: "openocd-tools.chooseCfg", title: "Choose CFG file" };
					items.push(item);
				} else {
					const item = new vscode.TreeItem("CFG file: " + cfgFileName, vscode.TreeItemCollapsibleState.None);
					item.command = { command: "openocd-tools.chooseCfg", title: "Choose CFG file" };
					items.push(item);
				}
				if (targetFile === "") {
					const item = new vscode.TreeItem("Choose Target file", vscode.TreeItemCollapsibleState.None);
					item.command = { command: "openocd-tools.chooseTarget", title: "Choose Target file" };
					items.push(item);
				} else {
					const item = new vscode.TreeItem("Target file: " + targetFileName, vscode.TreeItemCollapsibleState.None);
					item.command = { command: "openocd-tools.chooseTarget", title: "Choose Target file" };
					items.push(item);
				}
				if (svdFile === "") {
					const item = new vscode.TreeItem("Choose SVD file", vscode.TreeItemCollapsibleState.None);
					item.command = { command: "openocd-tools.chooseSVD", title: "Choose SVD file" };
					items.push(item);
				} else {
					const item = new vscode.TreeItem("SVD file: " + svdFileName, vscode.TreeItemCollapsibleState.None);
					item.command = { command: "openocd-tools.chooseSVD", title: "Choose SVD file" };
					items.push(item);
				}
				const flashItem = new vscode.TreeItem("Flash", vscode.TreeItemCollapsibleState.None);
				flashItem.command = { command: "openocd-tools.flash", title: "Flash" };
				items.push(flashItem);
				const debugItem = new vscode.TreeItem("Debug", vscode.TreeItemCollapsibleState.None);
				debugItem.command = { command: "openocd-tools.debug", title: "Debug" };
				items.push(debugItem);
				return Promise.resolve(items);
			}
		return Promise.resolve([]);
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "openocd-tools" is now active!');

	let DebugTerminal: vscode.Terminal | undefined = undefined;
	let FlashTerminal: vscode.Terminal | undefined = undefined;
	
	const openocdTreeDataProvider = new OpenOCDTreeDataProvider(context);
	vscode.window.registerTreeDataProvider("openocd-tools", openocdTreeDataProvider);

	const statusBarFlash = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarFlash.text = "$(triangle-right) Flash";
	statusBarFlash.command = "openocd-tools.flash";
	statusBarFlash.show();

	const statusBarDebug = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarDebug.text = "$(bug) Debug";
	statusBarDebug.command = "openocd-tools.debug";
	statusBarDebug.show();

	const disposableForFlash = vscode.commands.registerCommand('openocd-tools.flash', () => {
		const openocdExec = vscode.workspace.getConfiguration("openocd-tools").get("path", "openocd");
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
			if (!FlashTerminal || FlashTerminal.exitStatus) {
				FlashTerminal = vscode.window.createTerminal("OpenOCD Flash");
			}
			FlashTerminal.show();
			FlashTerminal.sendText(`${openocdExec} -f ${cfgFile} -c "program ${targetFile} verify reset exit"`);
		});
	});
	context.subscriptions.push(disposableForFlash);	

	const disposableForDebug = vscode.commands.registerCommand('openocd-tools.debug', () => {
		const openocdExec = vscode.workspace.getConfiguration("openocd-tools").get("path", "openocd");
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
			if (!DebugTerminal || DebugTerminal.exitStatus) {
				DebugTerminal = vscode.window.createTerminal("OpenOCD Debug");
			}
			DebugTerminal.show();
			DebugTerminal.sendText(`${openocdExec} -f ${cfgFile} -c "gdb_port 3333" -c "tcl_port disabled" -c "telnet_port 4444"`);
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
				openocdTreeDataProvider.refresh();
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
				openocdTreeDataProvider.refresh();
				statusBarFlash.tooltip = "Flash target file: [" + fileName + "]";
				statusBarDebug.tooltip = "Debug target file: [" + fileName + "]";
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
				openocdTreeDataProvider.refresh();
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
