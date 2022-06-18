import YoutubeInternal from './YoutubeInternal.js';

export default class Youtube {
	static init() {
		Youtube.update();

		Youtube.interval = setInterval(Youtube.update, 5 * 60 * 1000); // Update every 5 minutes

		Discord.registerCmd(
			'ytstats',
			Youtube.showStatusOnDiscord,
			{
				description: 'Get current youtube watchlist status',
			}
		);
	}

	static async showStatusOnDiscord(discordClient, interaction) {
		const content = await YoutubeInternal.processPlaylistForModule(config.PLAYLIST_ID, config.API_KEY);

		if(!content) { return; }

		const {
			totalDuration,
			videoCount
		} = content;

		interaction.reply({
			content: `Youtube status: ${videoCount} videos, ${YoutubeInternal.formatDuration(totalDuration)}`,
			ephemeral: true
		})
	}

	static close() {
		clearInterval(Youtube.interval);
	}

	static async update() {
		try {
			const content = await YoutubeInternal.processPlaylistForModule(config.PLAYLIST_ID, config.API_KEY);

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
		} catch(e) {
			console.error(e);
		}
	}
}