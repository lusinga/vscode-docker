/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem, AzExtTreeItem, IActionContext } from "vscode-azureextensionui";
import { ext, ImageGrouping } from "../extensionVariables";
import { docker } from "../utils/docker-endpoint";
import { getDockerErrorTreeItems } from "./getDockerErrorTreeItems";
import { getImageLabel } from "./getImageLabel";
import { ImageGroupTreeItem } from './ImageGroupTreeItem';
import { IImageRoot, ImageTreeItem, sortImages } from "./ImageTreeItem";

const imageFilters = {
    "filters": {
        "dangling": ["false"]
    }
};

export class ImagesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = ImagesTreeItem.contextValue;
    public contextValue: string = 'images';
    public label: string = 'Images';
    public readonly imageTreeItems: ImageTreeItem[] = [];

    private _failedToConnect: boolean;

    public get childTypeLabel(): string {
        switch (ext.groupImagesBy) {
            case ImageGrouping.ImageId:
                return 'image id';
            case ImageGrouping.Repository:
                return 'repository';
            case ImageGrouping.RepositoryName:
                return 'repository name';
            default:
                return 'image';
        }
    }

    public async loadMoreChildrenImpl(_clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let images: Docker.ImageDesc[];
        try {
            images = await docker.getImageDescriptors(imageFilters) || [];
            this._failedToConnect = false;
        } catch (error) {
            this._failedToConnect = true;
            return getDockerErrorTreeItems(this, error);
        }

        let imageRoots: IImageRoot[] = [];
        for (const image of images) {
            if (!image.RepoTags) {
                imageRoots.push({ image, fullTag: '<none>:<none>' });
            } else {
                for (let fullTag of image.RepoTags) {
                    imageRoots.push({ image, fullTag });
                }
            }
        }

        const groupMap = new Map<string | undefined, IImageRoot[]>();
        for (const root of imageRoots) {
            let groupTemplate: string | undefined;
            switch (ext.groupImagesBy) {
                case ImageGrouping.ImageId:
                    groupTemplate = '{shortImageId}';
                    break;
                case ImageGrouping.Repository:
                    groupTemplate = '{repository}';
                    break;
                case ImageGrouping.RepositoryName:
                    groupTemplate = '{repositoryName}';
                    break;
                default:
            }

            const group: string = groupTemplate ? getImageLabel(root.fullTag, root.image, groupTemplate) : undefined;
            if (!groupMap.has(group)) {
                groupMap.set(group, []);
            }

            groupMap.get(group).push(root);
        }

        const result: AzExtTreeItem[] = [];
        for (const [group, groupedImageRoots] of groupMap.entries()) {
            if (!group) {
                result.push(...groupedImageRoots.map(r => new ImageTreeItem(this, r)));
            } else {
                result.push(new ImageGroupTreeItem(this, group, groupedImageRoots));
            }
        }

        return result;
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public compareChildrenImpl(ti1: AzExtTreeItem, ti2: AzExtTreeItem): number {
        if (this._failedToConnect) {
            return 0; // children are already sorted
        } else if (ti1 instanceof ImageTreeItem && ti2 instanceof ImageTreeItem) {
            return sortImages(ti1, ti2);
        } else if (ti2 instanceof ImageTreeItem) {
            return 1;
        } else if (ti1 instanceof ImageTreeItem) {
            return -1;
        } else {
            return super.compareChildrenImpl(ti1, ti2);
        }
    }
}
