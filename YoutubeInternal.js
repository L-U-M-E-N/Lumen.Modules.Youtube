import fetch from 'node-fetch';

const iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;
function parseISO8601Duration(iso8601Duration) {
	const matches = iso8601Duration.match(iso8601DurationRegex);

	return {
		sign: matches[1] === undefined ? '+' : '-',
		years: matches[2] === undefined ? 0 : parseInt(matches[2]),
		months: matches[3] === undefined ? 0 : parseInt(matches[3]),
		weeks: matches[4] === undefined ? 0 : parseInt(matches[4]),
		days: matches[5] === undefined ? 0 : parseInt(matches[5]),
		hours: matches[6] === undefined ? 0 : parseInt(matches[6]),
		minutes: matches[7] === undefined ? 0 : parseInt(matches[7]),
		seconds: matches[8] === undefined ? 0 : parseInt(matches[8])
	};
}

export default class YoutubeInternal {
	static async getVideoData(videoId, API_KEY) {
		const res = await fetch(
			`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}`
		);

		return await res.json();
	}

	static async getVideosData(videosId, API_KEY) {
		const res = await fetch(
			`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videosId.join(',')}&key=${API_KEY}`
		);

		return await res.json();
	}

	static async getPlayListData(playlistId, API_KEY) {
		const finalResult = [];
		let obj = {};
		do {
			let res;

			if(obj.nextPageToken) {
				res = await fetch(
					`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}&pageToken=${obj.nextPageToken}`
				);
			} else {
				res = await fetch(
					`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`
				);
			}

			obj = await res.json();

			const videos = await YoutubeInternal.getVideosData(obj.items.map((elt) => elt.snippet.resourceId.videoId), API_KEY);
			finalResult.push(...obj.items.map((elt) => {
				elt.videoData = videos.items.filter((video) =>
					video.id === elt.snippet.resourceId.videoId
				)[0];

				return elt;
			}));
		} while(obj.nextPageToken);

		return finalResult;
	}

	static async processPlaylistForModule(PLAYLIST_ID, API_KEY) {
		let videoCount = 0;
		let totalDuration = { hours: 0, minutes: 0, seconds: 0 };

		if(!PLAYLIST_ID || PLAYLIST_ID === '' || !API_KEY || API_KEY === '') {
			return;
		}

		const playlistData = await YoutubeInternal.getPlayListData(PLAYLIST_ID, API_KEY);

		console.log('Video count: ', playlistData.length);
		totalDuration = playlistData.reduce((acc, item) => {
			if(item.snippet.title === 'Deleted video') {
				console.log(`Warning: video ${item.snippet.resourceId.videoId} has been deleted from youtube`);
				return acc;
			}

			const duration = parseISO8601Duration(item.videoData.contentDetails.duration);

			acc.hours += duration.days * 24;
			acc.hours += duration.hours;
			acc.minutes += duration.minutes;
			acc.seconds += duration.seconds;

			while(acc.seconds >= 60) {
				acc.seconds -= 60;
				acc.minutes++;
			}

			while(acc.minutes >= 60) {
				acc.minutes -= 60;
				acc.hours++;
			}

			videoCount++;

			return acc;
		}, { hours: 0, minutes: 0, seconds: 0 });
		console.log('Total duration: ', totalDuration.hours.toString().padStart(2, '0') + ':' + totalDuration.minutes.toString().padStart(2, '0') + ':' + totalDuration.seconds.toString().padStart(2, '0'));

		return { totalDuration, videoCount };
	}
}
