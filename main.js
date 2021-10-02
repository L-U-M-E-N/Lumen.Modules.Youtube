import fetch from 'node-fetch';

import fs from 'fs';

import YoutubeInternal from './YoutubeInternal.js';

const PLAYLIST_ID = '';
const API_KEY = '';

(async() => {
	const {
		totalDuration,
		videoCount
	} = await YoutubeInternal.processPlaylistForModule(PLAYLIST_ID, API_KEY);

	ipcMain.handle('youtube-getVideoCount', () => {
		return videoCount;
	});
	ipcMain.handle('youtube-getDuration', () => {
		return totalDuration;
	});
})();
