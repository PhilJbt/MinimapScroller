document.addEventListener("DOMContentLoaded", async () => {
  const hostnameElement = document.getElementById("hostname");
  const toggle = document.getElementById("toggle");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab === undefined) { document.getElementById('toggle').setAttribute('disabled', ''); return; }
  const url = new URL(tab.url);
  const hostname = url.hostname;
  hostnameElement.textContent = hostname;
	
	if (url.protocol !== 'https:'
	&& url.protocol !== 'http:') {
		document.getElementById('toggle').removeAttribute('checked');
		document.getElementById('toggle').setAttribute('disabled', '');
		document.getElementById('hostname').innerHTML = url;
	}
	else {
		const updateIcon = (isStored) => {
			if (isStored)
				toggle.removeAttribute('checked');
			else
				toggle.setAttribute('checked', '');
		};

		chrome.storage.sync.get(["blockedHosts"], (data) => {
			const isStored = (data.blockedHosts || []).includes(hostname);
			updateIcon(isStored);
		});

		toggle.addEventListener("change", () => {
			chrome.storage.sync.get(["blockedHosts"], (data) => {
				let blockedHosts = data.blockedHosts || [];
				const isStored = blockedHosts.includes(hostname);

				if (isStored) {
					blockedHosts = blockedHosts.filter((host) => host !== hostname);
				} else {
					blockedHosts.push(hostname);
				}

				chrome.storage.sync.set({ blockedHosts }, () => {
					updateIcon(!isStored);
				});
			});
		});
	}
});