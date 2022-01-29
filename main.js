import fetch from 'node-fetch';

import fs from 'fs';

import YoutubeInternal from './YoutubeInternal.js';

let videoCount;
let totalDuration;

ipcMain.handle('youtube-getVideoCount', () => {
	return videoCount;
});
ipcMain.handle('youtube-getDuration', () => {
	return totalDuration;
});

(async() => {
	const content = await YoutubeInternal.processPlaylistForModule(
		ConfigManager.get('youtube', 'PLAYLIST_ID'),
		ConfigManager.get('youtube', 'API_KEY')
	);

	if(!content) {
		videoCount = 0;
		totalDuration = 0;
		return;
	}

	videoCount = content.videoCount;
	totalDuration = content.totalDuration;
})();
