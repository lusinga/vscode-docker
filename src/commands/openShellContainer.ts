/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IActionContext } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ContainerTreeItem } from '../tree/ContainerTreeItem';
import { docker, DockerEngineType } from '../utils/docker-endpoint';

function getEngineTypeShellCommands(engineType: DockerEngineType): string {
    const configOptions: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('docker');
    switch (engineType) {
        case DockerEngineType.Linux:
            return configOptions.get('attachShellCommand.linuxContainer');
        case DockerEngineType.Windows:
            return configOptions.get('attachShellCommand.windowsContainer');
        default:
            throw new Error(`Unexpected engine type ${engineType}`);
    }
}

export async function openShellContainer(context: IActionContext, node: ContainerTreeItem | undefined): Promise<void> {
    if (!node) {
        node = await ext.containersTree.showTreeItemPicker(ContainerTreeItem.allContextValueRegExp, context);
    }

    let engineType = await docker.getEngineType();
    context.telemetry.properties.engineType = DockerEngineType[engineType];
    const shellCommand = getEngineTypeShellCommands(engineType);
    context.telemetry.properties.shellCommand = shellCommand;
    const terminal = ext.terminalProvider.createTerminal(`Shell: ${node.container.Image}`);
    terminal.sendText(`docker exec -it ${node.container.Id} ${shellCommand}`);
    terminal.show();
}
