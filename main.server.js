import YoutubeInternal from './YoutubeInternal.js';

export default class Youtube {
	static init() {
		Youtube.update();

		Youtube.interval = setInterval(Youtube.update, 5 * 60 * 1000); // Update every 5 minutes
	}

	static close() {
		clearInterval(Youtube.interval);
	}

	static async update() {
		const content = await YoutubeInternal.processPlaylistForModule(youtubeCfg.PLAYLIST_ID, youtubeCfg.API_KEY);

		if(!content) { return; }

		const {
			totalDuration,
			videoCount
		} = content;
		const duration = totalDuration.hours * 3600 + totalDuration.minutes * 60 + totalDuration.seconds;

		if(duration === Youtube.prevTotalDuration && Youtube.prevVideoCount === videoCount) {
			return;
		}

		const [query, values] = Database.buildInsertQuery('yt_stats', {
			date: new Date(),
			duration,
			amount: videoCount
		});

		Database.execQuery(
			query,
			values
		);

		Youtube.prevTotalDuration = duration;
		Youtube.prevVideoCount = videoCount;

		log('Saved current Youtube playlist status', 'info');
	}
}