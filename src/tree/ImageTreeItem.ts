/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as Docker from 'dockerode';
import * as moment from 'moment';
import { AzExtParentTreeItem, AzExtTreeItem } from "vscode-azureextensionui";
import { ext, ImageGrouping } from '../extensionVariables';
import { docker } from '../utils/docker-endpoint';
import { treeUtils } from "../utils/treeUtils";
import { getImageLabel } from './getImageLabel';

export interface IImageRoot {
    image: Docker.ImageDesc;
    fullTag: string;
}

export class ImageTreeItem extends AzExtTreeItem {
    public static contextValue: string = 'image';
    public contextValue: string = ImageTreeItem.contextValue;

    public image: Docker.ImageDesc;
    public fullTag: string;

    public constructor(parent: AzExtParentTreeItem, root: IImageRoot) {
        super(parent);
        this.image = root.image;
        this.fullTag = root.fullTag;
    }

    public get id(): string {
        return this.image.Id + this.fullTag;
    }

    public get label(): string {
        let template: string;
        switch (ext.groupImagesBy) {
            case ImageGrouping.Repository:
                template = '{tag}';
                break;
            default:
                template = '{fullTag}';
        }
        return getImageLabel(this.fullTag, this.image, template);
    }

    public get group(): string | undefined {
        let template: string | undefined;
        switch (ext.groupImagesBy) {
            case ImageGrouping.ImageId:
                template = '{shortImageId}';
                break;
            case ImageGrouping.Repository:
                template = '{repository}';
                break;
            case ImageGrouping.RepositoryName:
                template = '{repositoryName}';
                break;
            default:
        }
        return template ? getImageLabel(this.fullTag, this.image, template) : undefined;
    }

    public get description(): string {
        return moment(new Date((this.image.Created || 0) * 1000)).fromNow();
    }

    public get iconPath(): treeUtils.IThemedIconPath {
        return treeUtils.getThemedIconPath('application');
    }

    public async deleteTreeItemImpl(): Promise<void> {
        await new Promise((resolve, reject) => {
            docker.getImage(this.image.Id).remove({ force: true }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

export function sortImages(ti1: ImageTreeItem, ti2: ImageTreeItem): number {
    return ti2.image.Created - ti1.image.Created; // sort images by created time
}
