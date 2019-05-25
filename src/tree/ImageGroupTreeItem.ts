/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { AzExtParentTreeItem, AzExtTreeItem } from "vscode-azureextensionui";
import { ext, ImageGrouping } from "../extensionVariables";
import { treeUtils } from "../utils/treeUtils";
import { IImageRoot, ImageTreeItem, sortImages } from "./ImageTreeItem";

export class ImageGroupTreeItem extends AzExtParentTreeItem {
    public static readonly contextValue: string = 'imageGroup';
    public readonly contextValue: string = ImageGroupTreeItem.contextValue;
    public label: string;
    public childTypeLabel: string = 'image';

    private _roots: IImageRoot[];

    public constructor(parent: AzExtParentTreeItem, label: string, roots: IImageRoot[]) {
        super(parent);
        this.label = label;
        this._roots = roots;
    }

    public get iconPath(): treeUtils.IThemedIconPath {
        let icon: string;
        switch (ext.groupImagesBy) {
            case ImageGrouping.ImageId:
                icon = 'applicationGroup';
                break;
            case ImageGrouping.Repository:
                icon = 'repository';
                break;
            case ImageGrouping.RepositoryName:
                icon = 'applicationGroup';
                break;
            default:
                assert(`Unexpected groupImagesBy ${ext.groupImagesBy}`);
        }
        return treeUtils.getThemedIconPath(icon);
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        return this._roots.map(r => new ImageTreeItem(this, r));
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public compareChildrenImpl(ti1: AzExtTreeItem, ti2: AzExtTreeItem): number {
        if (ti1 instanceof ImageTreeItem && ti2 instanceof ImageTreeItem) {
            return sortImages(ti1, ti2);
        } else {
            return super.compareChildrenImpl(ti1, ti2);
        }
    }
}
