const YoutubeInternal = require('./YoutubeInternal');

module.exports = class Youtube {
	static init() {
		Youtube.update();

		clearInterval(Youtube.interval);
		Youtube.interval = setInterval(Youtube.update, 60 * 60 * 1000); // Update every hour
	}

	static close() {
		clearInterval(Youtube.interval);
	}

	static async update() {
		const {
			totalDuration,
			videoCount
		} = await YoutubeInternal.processPlaylistForModule(youtubeCfg.PLAYLIST_ID, youtubeCfg.API_KEY);

		const [query, values] = Database.buildInsertQuery('yt_stats', {
			date: new Date(),
			duration: totalDuration.hours * 3600 + totalDuration.minutes * 60 + totalDuration.seconds,
			amount: videoCount
		});

		Database.execQuery(
			query,
			values
		);

		log('Saved current Youtube playlist status', 'info');
	}
};