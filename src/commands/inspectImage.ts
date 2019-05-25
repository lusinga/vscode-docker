/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IActionContext } from "vscode-azureextensionui";
import DockerInspectDocumentContentProvider from "../dockerInspect";
import { ext } from "../extensionVariables";
import { ImageTreeItem } from "../tree/ImageTreeItem";

export async function inspectImage(context: IActionContext, node: ImageTreeItem | undefined): Promise<void> {
    if (!node) {
        node = await ext.imagesTree.showTreeItemPicker(ImageTreeItem.contextValue, context);
    }

    await DockerInspectDocumentContentProvider.openImageInspectDocument(node.image);
}