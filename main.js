import fetch from 'node-fetch';

import fs from 'fs';

import YoutubeInternal from './YoutubeInternal.js';

const PLAYLIST_ID = '';
const API_KEY = '';

let videoCount;
let totalDuration;

ipcMain.handle('youtube-getVideoCount', () => {
	return videoCount;
});
ipcMain.handle('youtube-getDuration', () => {
	return totalDuration;
});

(async() => {
	const content = await YoutubeInternal.processPlaylistForModule(PLAYLIST_ID, API_KEY);

	videoCount = content.videoCount;
	totalDuration = content.totalDuration;
})();
