chrome.storage.sync.get(["blockedHosts"], (data) => {
	let blockedHosts = data.blockedHosts || [];
	const isStored = blockedHosts.includes(window.location.hostname);

	if (!isStored)
		init();
});

function init() {
	let renderTimeout = null;
	let lastRenderTime = 0;
	let renderUID = 0;

	// Add minimap container to the page
	const minimapContainer = document.createElement('div');
	minimapContainer.id = 'dom-minimap-container';
	document.body.appendChild(minimapContainer);

	// Set the container to fill the height of the viewport
	minimapContainer.style.position = 'fixed';
	minimapContainer.style.top = '0';
	minimapContainer.style.right = '0';
	minimapContainer.style.width = '100px';  // You can adjust this width as necessary
	minimapContainer.style.height = '100vh'; // Full viewport height
	minimapContainer.style.overflow = 'hidden'; // Hide overflow to avoid scrolling

	// Scrollbox canvas
	const canvass = document.createElement('canvas');
	canvass.id = 'dom-scrollbox';
	canvass.style.transition = 'opacity 0.3s';
	minimapContainer.appendChild(canvass);
	const ctxs = canvass.getContext('2d');

	// Minimap canvas
	const canvasm = document.createElement('canvas');
	canvasm.id = 'dom-minimap';
	canvasm.style.transition = 'opacity 0.3s';
	minimapContainer.appendChild(canvasm);
	const ctxm = canvasm.getContext('2d');

	// Create the button to toggle visibility
	const toggleButton = document.createElement('button');
	toggleButton.innerHTML = '<svg width="32" height="32" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1500"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"/></svg>';
	toggleButton.id = 'dom-button-hide';
	toggleButton.style.position = 'absolute';
	toggleButton.style.bottom = '0px';
	toggleButton.style.right = '0px';
	toggleButton.style.width = '32px';
	toggleButton.style.height = '32px';
	toggleButton.style.zIndex = '1000'; // Ensure it's on top of the minimap
	toggleButton.style.padding = '10px';
	toggleButton.style.backgroundColor = 'rgb(0 0 0 / 26%)';
	toggleButton.style.border = 'none';
	toggleButton.style.borderRadius = '5px';
	toggleButton.style.cursor = 'pointer';
	minimapContainer.appendChild(toggleButton);

	// Set the initial minimap visible state
	let isMinimapVisible = true;

	// Toggle the minimap visibility
	const toggleMinimap = () => {
		isMinimapVisible = !isMinimapVisible;
		if (isMinimapVisible) {
			scheduleRender();
			canvass.style.opacity = '1';
			canvass.style.pointerEvents = 'auto';
			canvasm.style.opacity = '1';
			canvasm.style.pointerEvents = 'auto';
			toggleButton.innerHTML = '<svg width="32" height="32" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1500"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"/></svg>';
		} else {
			canvass.style.opacity = '0';
			canvass.style.pointerEvents = 'none';
			canvasm.style.opacity = '0';
			canvasm.style.pointerEvents = 'none';
			toggleButton.innerHTML = '<svg width="32" height="32" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1500"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>';
		}
	};

	// Add event listener to the toggle button
	toggleButton.addEventListener('click', toggleMinimap);

	// Variables for scrolling
	let isDragging = false;

	const renderScrollbox = () => {
		ctxs.clearRect(0, 0, canvass.width, canvass.height);
		
		ctxs.fillStyle = "transparent";
		ctxs.fillRect(0, 0, canvass.width, canvass.height);
		
		const verticalScaleS = canvass.height / document.body.scrollHeight;
		
		// Draw viewport rectangle
		const viewportTop = window.scrollY * verticalScaleS;
		const viewportHeightScaled = window.innerHeight * verticalScaleS;

		ctxs.fillStyle = 'rgba(0,0,0,.33)';
		ctxs.fillRect(0, viewportTop, canvass.width, viewportHeightScaled);
	};

	function isVisible(element) {
			const style = getComputedStyle(element);
			return style.display !== 'none' &&
						 style.visibility !== 'hidden' &&
						 style.opacity !== '0';
	}


	// Render DOM to minimap
	const renderMinimap = () => {
		renderUID += 1;
		
		const rect = document.body.getBoundingClientRect();

		// Adjust canvas dimensions to fit the container height (100vh)
		canvasm.width = rect.width * 0.1; // Scale horizontally
		canvasm.height = window.innerHeight; // Set canvas height to match the viewport height

		ctxm.clearRect(0, 0, canvasm.width, canvasm.height);

		// Calculate the vertical scaling factor
		const verticalScaleM = canvasm.height / document.body.scrollHeight;

		const renderElement = (element, offsetX, offsetY) => {
			// Ignore minimap
			if (element.id === 'dom-minimap-container') return;
			
			const elRect = element.getBoundingClientRect();
			
			const x = (elRect.x + offsetX) * 0.1; // Scale horizontally
			const y = (elRect.y + offsetY) * verticalScaleM;
			const width = elRect.width * 0.1;
			const height = elRect.height * verticalScaleM;

			// Get the element's background color
			let bgColorA = window.getComputedStyle(element, null).getPropertyValue('background-color');
			bgColorA = (bgColorA && bgColorA !== 'rgba(0, 0, 0, 0)' ? bgColorA : undefined);
			let bgColorB = element.style.backgroundColor;
			bgColorB = (bgColorB && bgColorB !== 'rgba(0, 0, 0, 0)' ? bgColorB : undefined);
			
			const style = element.currentStyle || window.getComputedStyle(element, false);
			let bi = undefined;
			if (style !== undefined
			&& style.backgroundImage !== undefined
			&& style.backgroundImage !== ''
			&& style.backgroundImage !== 'none'
			&& style.backgroundImage.includes('url'))
				bi = style.backgroundImage.replace(/"/g, "").slice(4, -1);
			
			if (isVisible(element)) {
				/*
				if (bi !== undefined
				&& bi !== '') {
					const uidCur = renderUID;
					const imgTmp = new Image();
					imgTmp.src = bi;
					imgTmp.onload = () => {
						if (renderUID === uidCur)
							ctxm.drawImage(imgTmp, x, y, width, height);
					};
				}
				else if (element.nodeName === 'IMG'
				&& element.src) {
					const uidCur = renderUID;
					const imgTmp = new Image();
					imgTmp.src = element.src;
					imgTmp.onload = () => {
						if (renderUID === uidCur)
							ctxm.drawImage(imgTmp, x, y, width, height);
					};
				}
				else */if (width !== 0 && height !== 0
				 && (bgColorA !== undefined || bgColorB !== undefined)
				 && element.nodeType === 1) { // === Node.ELEMENT_NODE
					// Use a default color for transparency or non-renderable elements
					ctxm.fillStyle = bgColorA || bgColorB;
					ctxm.fillRect(x, y, width, height);
				}
			}

			Array.from(element.children).forEach((child) =>
				renderElement(child, offsetX, offsetY)
			);
		};

		renderElement(document.body, -rect.left, -rect.top);
		renderScrollbox();
		renderTimeout = null;
	};

	// Map minimap click to scroll position
	const scrollToPosition = (event) => {
		const rect = canvass.getBoundingClientRect();

		// Calculate the percentage of the minimap height that was clicked
		const clickPercent = (event.clientY - rect.top) / rect.height;

		// Calculate the corresponding scroll position in the document
		const newScrollY = clickPercent * document.body.scrollHeight;

		// Calculate the offset to center the clicked position in the viewport
		const centerOffset = newScrollY - (window.innerHeight / 2);

		// Scroll to the calculated position, ensuring that the clicked point is centered
		window.scrollTo({ top: centerOffset, behavior: 'instant' });
	};

	// Handle drag scrolling
	const handleMouseDown = (event) => {
		isDragging = true;
		scrollToPosition(event);
	};

	const handleMouseMove = (event) => {
		if (isDragging) {
			scrollToPosition(event);
		}
	};

	const handleMouseUp = () => {
		isDragging = false;
	};

	// Add event listeners for canvas
	canvass.addEventListener('mousedown', handleMouseDown);
	canvass.addEventListener('mousemove', handleMouseMove);
	canvass.addEventListener('mouseup', handleMouseUp);
	canvass.addEventListener('mouseleave', handleMouseUp);

	// Schedule render based on DOM mutation
	const scheduleRender = () => {
		if (Date.now() - lastRenderTime < 2000) {
			if (renderTimeout !== null) {
				clearTimeout(renderTimeout);
				renderTimeout = setTimeout(() => {
					renderMinimap();
					lastRenderTime = Date.now();
				}, 2000);
			}
		} else {
			clearTimeout(renderTimeout);
			renderMinimap();
			lastRenderTime = Date.now();
		}
	};


	// Observe DOM changes
	const observer = new MutationObserver((e) => {
		//console.log(e.filter(e => e.attributeName));
		e.forEach(elm => {
			if ((elm.type === 'childList' || elm.attributeName === 'style')
			&& elm.target.id !== 'dom-minimap'
			&& elm.target.id !== 'dom-scrollbox'
			&& elm.target.id !== 'dom-minimap-container'
			&& elm.target.id !== 'dom-button-hide') {
				scheduleRender();
				return;
			}
		});
	});
	observer.observe(document.body, { childList: true, subtree: true, attributes: true });


	// Observe images changes
	/*
	const observerImg = new IntersectionObserver(entries => {
		scheduleRender();
	});

	const images = document.querySelectorAll('img');
	images.forEach(img => observerImg.observe(img));
	*/

	// Handle scroll events to update viewport rectangle
	window.addEventListener('scroll', () => {
		renderScrollbox();
	});

	// Adjust canvas size on window resize
	window.addEventListener('resize', () => {
		scheduleRender();
	});

	// Initial render
	setTimeout(() => {
		renderMinimap();
		lastRenderTime = Date.now();
	}, 1000);
}