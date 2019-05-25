/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem, AzExtTreeItem, InvalidTreeItem } from "vscode-azureextensionui";
import { isLinux } from "../../src/utils/osVersion";
import { OpenUrlTreeItem } from "./OpenUrlTreeItem";

export async function getDockerErrorTreeItems(parent: AzExtParentTreeItem, error: unknown): Promise<AzExtTreeItem[]> {
    const connectionMessage = 'Failed to connect. Is Docker installed and running?';
    const installDockerUrl = 'https://aka.ms/AA37qtj';
    const linuxPostInstallUrl = 'https://aka.ms/AA37yk6';
    const troubleshootingUrl = 'https://aka.ms/AA37qt2';

    const result: AzExtTreeItem[] = [
        new InvalidTreeItem(parent, error, { label: connectionMessage, contextValue: 'dockerConnectionError', description: '' }),
        new OpenUrlTreeItem(parent, 'Install Docker...', installDockerUrl),
        new OpenUrlTreeItem(parent, 'Additional Troubleshooting...', troubleshootingUrl),
    ];

    if (isLinux()) {
        result.push(new OpenUrlTreeItem(parent, 'Manage Docker as a non-root user on Linux...', linuxPostInstallUrl))
    }

    return result;
}
