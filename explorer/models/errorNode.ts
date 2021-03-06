/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { parseError } from 'vscode-azureextensionui';
import { treeUtils } from '../../src/utils/treeUtils';
import { NodeBase } from './nodeBase';

export type IconPath = string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } | vscode.ThemeIcon;

export class ErrorNode extends NodeBase {
    public static readonly getImagesErrorContextValue: string = 'ErrorNode.getImages';
    public static readonly getContainersErrorContextValue: string = 'ErrorNode.getContainers';

    public readonly iconPath: string = treeUtils.getIconPath('warning');

    constructor(error: unknown, public readonly contextValue: string) {
        super(parseError(error).message);
    }
}
