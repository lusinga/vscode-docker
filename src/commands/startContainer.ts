/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import * as fse from 'fs-extra';
import os = require('os');
import vscode = require('vscode');
import { IActionContext, parseError } from 'vscode-azureextensionui';
import { ImageNode } from '../../explorer/models/imageNode';
import { ext } from '../extensionVariables';
import { docker, DockerEngineType } from '../utils/docker-endpoint';
import { ImageItem, quickPickImage } from '../utils/quick-pick-image';

/**
 * Image -> Run
 */
export async function startContainer(context: IActionContext, node: ImageNode | undefined): Promise<void> {
    return await startContainerCore(context, node, false);
}

export async function startContainerCore(context: IActionContext, node: ImageNode | undefined, interactive: boolean): Promise<void> {
    let imageName: string;
    let imageToStart: Docker.ImageDesc;

    if (node instanceof ImageNode && node.imageDesc) {
        imageToStart = node.imageDesc;
        imageName = node.fullTag;
    } else {
        const selectedItem: ImageItem = await quickPickImage(context, false)
        if (selectedItem) {
            imageToStart = selectedItem.imageDesc;
            imageName = selectedItem.label;
        }
    }

    if (imageToStart) {
        let ports: string[] = [];
        try {
            ports = await docker.getExposedPorts(imageToStart.Id);
        } catch (error) {
            vscode.window.showWarningMessage(`Unable to retrieve exposed ports: ${parseError(error).message}`);
        }

        let options = `--rm ${interactive ? '-it' : '-d'}`;
        if (ports.length) {
            const portMappings = ports.map((port) => `-p ${port.split("/")[0]}:${port}`); //'port' is of the form number/protocol, eg. 8080/udp.
            // In the command, the host port has just the number (mentioned in the EXPOSE step), while the destination port can specify the protocol too
            options += ` ${portMappings.join(' ')}`;
        }

        const terminal = ext.terminalProvider.createTerminal(imageName);
        terminal.sendText(`docker run ${options} ${imageName}`);
        terminal.show();
    }
}

/**
 * Image -> Run Interactive
 */
export async function startContainerInteractive(context: IActionContext, node: ImageNode): Promise<void> {
    await startContainerCore(context, node, true);
}

export async function startAzureCLI(context: IActionContext): Promise<cp.ChildProcess> {

    // block of we are running windows containers...
    const engineType: DockerEngineType = await docker.getEngineType();
    context.telemetry.properties.engineType = DockerEngineType[engineType];

    if (engineType === DockerEngineType.Windows) {
        const selected = await vscode.window.showErrorMessage<vscode.MessageItem>(
            'Currently, you can only run the Azure CLI when running Linux based containers.',
            {
                title: 'More Information',
            },
            {
                title: 'Close',
                isCloseAffordance: true
            }
        );
        if (!selected || selected.isCloseAffordance) {
            return;
        }
        return cp.exec('start https://docs.docker.com/docker-for-windows/#/switch-between-windows-and-linux-containers');
    } else {
        const option: string = process.platform === 'linux' ? '--net=host' : '';

        // volume map .azure folder so don't have to log in every time
        const homeDir: string = process.platform === 'win32' ? os.homedir().replace(/\\/g, '/') : os.homedir();
        let vol: string = '';

        if (fse.existsSync(`${homeDir}/.azure`)) {
            vol += ` -v ${homeDir}/.azure:/root/.azure`;
        }
        if (fse.existsSync(`${homeDir}/.ssh`)) {
            vol += ` -v ${homeDir}/.ssh:/root/.ssh`;
        }
        if (fse.existsSync(`${homeDir}/.kube`)) {
            vol += ` -v ${homeDir}/.kube:/root/.kube`;
        }

        const cmd: string = `docker run ${option} ${vol.trim()} -it --rm azuresdk/azure-cli-python:latest`;
        const terminal: vscode.Terminal = vscode.window.createTerminal('Azure CLI');
        terminal.sendText(cmd);
        terminal.show();
    }
}
