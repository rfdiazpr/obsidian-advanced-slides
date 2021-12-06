import express from "express";
import path from 'path';
import { Server } from "http";
import { RevealRenderer } from "./revealRenderer";

export class RevealServer {

	private _app: express.Application;
	private _port: number = 3000;
	private _server: Server;
	private _baseDirectory: string;
	private _pluginDirectory: string;
	private _revealRenderer: RevealRenderer;
	private _staticDir = express.static;

	constructor(vaultDir: String) {
		this._baseDirectory = vaultDir.toString();
		this._pluginDirectory = path.join(this._baseDirectory, '/.obsidian/plugins/obsidian-advanced-slides/');
		this._app = express();
		this._revealRenderer = new RevealRenderer(this._baseDirectory);
	}

	getUrl() {
		return `http://localhost:${this._port}`;
	}

	start() {

		this._app.get('/', (req, res) => {
			res.send('Hello my friends!');
		});

		['plugin', 'dist', 'css'].forEach(dir => {
			this._app.use('/' + dir, this._staticDir(path.join(this._pluginDirectory, dir)));
		});


		this._app.get(/(\w+\.md)/, async (req, res) => {
			const filePath = path.join(this._baseDirectory, decodeURI(req.url));
			const markup = await this._revealRenderer.renderFile(filePath);
			res.send(markup);
		});

		this._server = this._app.listen(this._port, () => {
			// tslint:disable-next-line:no-console
			console.log(`server started at http://localhost:${this._port}`);
		});
	}

	stop() {
		this._server.close();
		console.log(`server stopped`);
	}

}

