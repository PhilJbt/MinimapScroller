chrome.storage.sync.get(["blockedHosts"], (data) => {
	let blockedHosts = data.blockedHosts || [];
	const isStored = blockedHosts.includes(window.location.hostname);

	if (!isStored)
		init();
});