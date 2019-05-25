/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IActionContext } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ContainerTreeItem } from '../tree/ContainerTreeItem';

export async function showLogsContainer(context: IActionContext, node: ContainerTreeItem | undefined): Promise<void> {
    if (!node) {
        node = await ext.containersTree.showTreeItemPicker(ContainerTreeItem.allContextValueRegExp, context);
    }

    const terminal = ext.terminalProvider.createTerminal(node.container.Image);
    terminal.sendText(`docker logs -f ${node.container.Id}`);
    terminal.show();
}
