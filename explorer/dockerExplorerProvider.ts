/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { callWithTelemetryAndErrorHandling, IActionContext } from 'vscode-azureextensionui';
import { NodeBase } from './models/nodeBase';
import { RootNode } from './models/rootNode';

export class DockerExplorerProvider implements vscode.TreeDataProvider<NodeBase> {

    private _onDidChangeTreeData: vscode.EventEmitter<NodeBase> = new vscode.EventEmitter<NodeBase>();
    public readonly onDidChangeTreeData: vscode.Event<NodeBase> = this._onDidChangeTreeData.event;
    private _registriesNode: RootNode | undefined;

    public refresh(): void {
        this.refreshRegistries();
    }

    public refreshRegistries(): void {
        this._onDidChangeTreeData.fire(this._registriesNode);
    }

    public refreshNode(element: NodeBase): void {
        this._onDidChangeTreeData.fire(element);
    }

    public getTreeItem(element: NodeBase): vscode.TreeItem {
        return element.getTreeItem();
    }

    public async getChildren(element?: NodeBase): Promise<NodeBase[]> {
        return await callWithTelemetryAndErrorHandling('getChildren', async (context: IActionContext) => {
            context.telemetry.suppressIfSuccessful = true;
            context.telemetry.properties.source = 'dockerExplorer';

            if (!element) {
                return this.getRootNodes();
            }
            return element.getChildren(element);
        });
    }

    private async getRootNodes(): Promise<RootNode[]> {
        const rootNodes: RootNode[] = [];
        let node: RootNode;

        node = new RootNode('Registries', 'registriesRootNode', this._onDidChangeTreeData);
        this._registriesNode = node;
        rootNodes.push(node);

        return rootNodes;
    }
}
