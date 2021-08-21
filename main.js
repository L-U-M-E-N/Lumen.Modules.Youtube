const fetch = require('node-fetch');

const fs = require('fs');

const PLAYLIST_ID = '';
const API_KEY = '';

async function getVideoData(videoId) {
	const res = await fetch(
		`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}`
	);

	return await res.json();
}

async function getVideosData(videosId) {
	const res = await fetch(
		`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videosId.join(',')}&key=${API_KEY}`
	);

	return await res.json();
}

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

async function getPlayListData(playlistId) {
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
		const videos = await getVideosData(obj.items.map((elt) => elt.snippet.resourceId.videoId));
		finalResult.push(...obj.items.map((elt) => {
			elt.videoData = videos.items.filter((video) =>
				video.id === elt.snippet.resourceId.videoId
			)[0];

			return elt;
		}));
	} while(obj.nextPageToken);

	return finalResult;
}

(async() => {
	const playlistData = await getPlayListData(PLAYLIST_ID, 0);

	console.log('Video count: ', playlistData.length);
	const totalDuration = playlistData.reduce((acc, item) => {
		const duration = parseISO8601Duration(item.videoData.contentDetails.duration);

		acc.hours += duration.days * 24;
		acc.hours += duration.hours;
		acc.minutes += duration.minutes;
		acc.seconds += duration.seconds;

		while(acc.seconds > 60) {
			acc.seconds -= 60;
			acc.minutes++;
		}

		while(acc.minutes > 60) {
			acc.minutes -= 60;
			acc.hours++;
		}

		return acc;
	}, { hours: 0, minutes: 0, seconds: 0 });
	console.log('Total duration: ', totalDuration.hours.toString().padStart(2, '0') + ':' + totalDuration.minutes.toString().padStart(2, '0') + ':' + totalDuration.seconds.toString().padStart(2, '0'));
})();