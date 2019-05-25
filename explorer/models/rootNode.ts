/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { callWithTelemetryAndErrorHandling, IActionContext } from 'vscode-azureextensionui';
import { AzureUtilityManager } from '../../src/utils/azureUtilityManager';
import { AzureAccount } from '../../typings/azure-account.api';
import { NodeBase } from './nodeBase';
import { RegistryRootNode } from './registryRootNode';

export class RootNode extends NodeBase {
    constructor(
        public readonly label: string,
        public readonly contextValue: 'imagesRootNode' | 'containersRootNode' | 'registriesRootNode',
        public eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(label);
    }

    public getTreeItem(): vscode.TreeItem {
        let label = this.label;
        let id = this.label;

        return {
            label,
            id,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue,
        }

    }

    public async getChildren(element: RootNode): Promise<NodeBase[]> {
        return await callWithTelemetryAndErrorHandling('getChildren', async (context: IActionContext) => {
            context.telemetry.properties.source = 'rootNode';

            switch (element.contextValue) {
                case 'registriesRootNode':
                    return this.getRegistries();
                default:
                    throw new Error(`Unexpected contextValue ${element.contextValue}`);
            }
        });
    }

    private async getRegistries(): Promise<RegistryRootNode[]> {
        const registryRootNodes: RegistryRootNode[] = [];

        registryRootNodes.push(new RegistryRootNode('Docker Hub', "dockerHubRootNode", undefined, undefined));

        let azureAccount: AzureAccount = await AzureUtilityManager.getInstance().tryGetAzureAccount();
        if (azureAccount) {
            registryRootNodes.push(new RegistryRootNode('Azure', "azureRegistryRootNode", this.eventEmitter, azureAccount));
        }

        registryRootNodes.push(new RegistryRootNode('Private Registries', 'customRootNode', undefined, undefined));

        return registryRootNodes;
    }
}
