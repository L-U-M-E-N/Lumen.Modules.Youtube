window.addEventListener('load', async() => {
	document.getElementById('module-youtube-videoCount').innerText = await ipcRenderer.invoke('youtube-getVideoCount');

	const totalDuration = await ipcRenderer.invoke('youtube-getDuration');
	document.getElementById('module-youtube-videoDuration').innerText = totalDuration.hours.toString().padStart(2, '0') + ':' + totalDuration.minutes.toString().padStart(2, '0') + ':' + totalDuration.seconds.toString().padStart(2, '0');
});