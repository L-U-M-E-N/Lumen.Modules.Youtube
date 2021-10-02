async function render() {
	const videoCount = await ipcRenderer.invoke('youtube-getVideoCount');
	const totalDuration = await ipcRenderer.invoke('youtube-getDuration');

	if(typeof videoCount === 'undefined' || typeof totalDuration === 'undefined') {
		setTimeout(render, 250);
		return;
	}

	document.getElementById('module-youtube-videoCount').innerText = videoCount;
	document.getElementById('module-youtube-videoDuration').innerText = totalDuration.hours.toString().padStart(2, '0') + ':' + totalDuration.minutes.toString().padStart(2, '0') + ':' + totalDuration.seconds.toString().padStart(2, '0');
}

window.addEventListener('load', render);