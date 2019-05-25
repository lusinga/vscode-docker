/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as Docker from 'dockerode';
import { AzExtParentTreeItem, AzExtTreeItem } from "vscode-azureextensionui";
import { docker } from '../utils/docker-endpoint';
import { treeUtils } from "../utils/treeUtils";

export class ContainerTreeItem extends AzExtTreeItem {
    public static allContextValueRegExp: RegExp = /Container$/;
    public container: Docker.ContainerDesc;

    public constructor(parent: AzExtParentTreeItem, container: Docker.ContainerDesc) {
        super(parent);
        this.container = container;
    }

    public get label(): string {
        let image = this.container.Image;
        let name = this.container.Names[0].substr(1); // Remove start '/'
        let status = this.container.Status;
        return `${image} (${name}) (${status})`;
    }

    public get id(): string {
        return this.container.Id;
    }

    public get contextValue(): string {
        return this.container.State + 'Container';
    }

    public get iconPath(): treeUtils.IThemedIconPath {
        let icon: string;
        if (this.isUnhealthy) {
            icon = 'StatusWarning_16x';
        } else {
            switch (this.container.State) {
                case "created":
                case "dead":
                case "exited":
                    icon = 'StatusStop_16x';
                    break;
                case "paused":
                    icon = 'StatusPause_16x';
                    break;
                case "restarting":
                    icon = 'Restart_16x';
                    break;
                case "running":
                default:
                    icon = 'StatusRun_16x';
            }
        }

        return treeUtils.getThemedIconPath(icon);
    }

    public async deleteTreeItemImpl(): Promise<void> {
        await new Promise((resolve, reject) => {
            docker.getContainer(this.container.Id).remove({ force: true }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private get isUnhealthy(): boolean {
        return this.container.Status.includes('(unhealthy)');
    }
}
