/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TreeView, window, workspace, WorkspaceConfiguration } from "vscode";
import { AzExtTreeDataProvider, AzExtTreeItem } from "vscode-azureextensionui";
import { ext } from '../extensionVariables';
import { ContainersTreeItem } from './ContainersTreeItem';
import { ImagesTreeItem } from "./ImagesTreeItem";

export function initTrees(): void {
    const containersTreeItem = new ContainersTreeItem(undefined);
    ext.containersTree = new AzExtTreeDataProvider(containersTreeItem, 'docker.loadMore - todo');
    ext.containersTreeView = window.createTreeView('dockerContainers', { treeDataProvider: ext.containersTree });
    ext.context.subscriptions.push(ext.containersTreeView);
    initAutoRefresh(ext.containersTree, ext.containersTreeView);

    const imagesTreeItem = new ImagesTreeItem(undefined);
    ext.imagesTree = new AzExtTreeDataProvider(imagesTreeItem, 'docker.loadMore - todo');
    ext.imagesTreeView = window.createTreeView('dockerImages', { treeDataProvider: ext.imagesTree });
    ext.context.subscriptions.push(ext.imagesTreeView);
    initAutoRefresh(ext.imagesTree, ext.imagesTreeView);
}

export function initAutoRefresh(tree: AzExtTreeDataProvider, treeView: TreeView<AzExtTreeItem>): void {
    let intervalId: NodeJS.Timeout;
    ext.context.subscriptions.push(treeView.onDidChangeVisibility(e => {
        if (e.visible) {
            const configOptions: WorkspaceConfiguration = workspace.getConfiguration('docker');
            const refreshInterval: number = configOptions.get<number>('explorerRefreshInterval', 1000);
            intervalId = setInterval(async () => await tree.refresh(), refreshInterval);
        } else {
            clearInterval(intervalId);
        }
    }));
}
