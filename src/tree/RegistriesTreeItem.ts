/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem, AzExtTreeItem } from "vscode-azureextensionui";

export class RegistriesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = 'registriesRootNode';
    public contextValue: string = RegistriesTreeItem.contextValue;
    public label: string = 'Registries';

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        throw new Error("Method not implemented.");
    }

    public hasMoreChildrenImpl(): boolean {
        throw new Error("Method not implemented.");
    }
}
