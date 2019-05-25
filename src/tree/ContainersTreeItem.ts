/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem, AzExtTreeItem, IActionContext } from "vscode-azureextensionui";
import { docker, ListContainerDescOptions } from "../utils/docker-endpoint";
import { ContainerTreeItem } from "./ContainerTreeItem";
import { getDockerErrorTreeItems } from "./getDockerErrorTreeItems";

const containerFilters: ListContainerDescOptions = {
    "filters": {
        "status": ["created", "restarting", "running", "paused", "exited", "dead"]
    }
};

export class ContainersTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = 'containers';
    public contextValue: string = ContainersTreeItem.contextValue;
    public label: string = 'Containers';
    public childTypeLabel: string = 'container';

    private _failedToConnect: boolean;

    public async loadMoreChildrenImpl(_clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let containers: Docker.ContainerDesc[]
        try {
            containers = await docker.getContainerDescriptors(containerFilters) || [];
            this._failedToConnect = false;
        } catch (error) {
            this._failedToConnect = true;
            return getDockerErrorTreeItems(this, error);
        }

        return containers.map(c => new ContainerTreeItem(this, c));
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public compareChildrenImpl(ti1: AzExtTreeItem, ti2: AzExtTreeItem): number {
        if (this._failedToConnect) {
            return 0;
        } else if (ti1 instanceof ContainerTreeItem && ti2 instanceof ContainerTreeItem) {
            // tslint:disable-next-line: no-unsafe-any no-any
            return (<any>ti2.container).Created - (<any>ti1.container).Created; // sort images by created time
        } else {
            return super.compareChildrenImpl(ti1, ti2);
        }
    }
}
