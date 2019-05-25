/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import vscode = require('vscode');
import { IActionContext } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { ImageTreeItem } from '../tree/ImageTreeItem';

export async function removeImage(context: IActionContext, node: ImageTreeItem | undefined): Promise<void> {
    let nodes: ImageTreeItem[] = [];
    if (node) {
        nodes = [node];
    } else {
        nodes = await ext.imagesTree.showTreeItemPicker(ImageTreeItem.contextValue, { ...context, canPickMany: true });
    }

    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: "Removing Image(s)..." }, async () => {
        await Promise.all(nodes.map(async n => await n.deleteTreeItem(context)));
    });
}
