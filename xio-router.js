const Router = (function() {
	let views = [];
	let baseUrl = "";
	let activeUrl = null;
	let activeRoute = null;
	let catchAll = null;

	class RouterView extends HTMLElement {

		createdCallback() {
			if(!this.id) throw new Error("<xio-view> is missing required attribute 'id'");

			views.push(this);
			console.log("view created", this);
			this.hide();
		}

		attachedCallback() {
			console.log("view attached", this);
		}

		detachedCallback() {
			console.log("view deleted", this);

		}

		attributeChangedCallback(attrName, oldVal, newVal) {
			console.log("view attribute changed", attrName, oldVal, newVal, this);
		}

		get pattern () {
			return this.getAttribute('pattern') || null;
		}

		in (params) {
			console.log(this.id + " is now active", params);
			if(this.onLoadCallback) {
				this.onLoadCallback(this, params);
			} else {
				this.show();
			}
		}

		update (data) {
			console.log("Update", data);
		}

		set onLoad(callback) {
			console.log("set onload");
			this.onLoadCallback = callback;
		}

		show() {
			//this.style.display = "";
			this.removeAttribute("hidden");
		}

		hide (data) {
			//this.style.display = "none";
			this.setAttribute("hidden","");
		}
	}
	document.registerElement('xio-view', RouterView);

	
	addEventListener("popstate", e => {
  		console.log("StatePop", "location: " + document.location + ", state: " + JSON.stringify(e.state));
		find();
	}, false);

	const setBaseUrl = function(base) {
		baseUrl = base;
	}

	const getView = function(viewId) {
		const matches = views.filter(view => view.id === viewId);
		if(matches.length === 1) return matches[0];
		else if(matches.length === 0) return null;

		console.error("Error! Multiple views with the same id, not allowed");
	}

	const addCatchAll = function(callback) {
		catchAll = callback;
	}

	const addOnLoad = function(viewId, callback) {
		const view = getView(viewId);
		if(view) view.onLoad = callback;
	}

	const find = function() {
		let matchingRoutes = [];
		const url = location.pathname.substr(baseUrl.length);
		views.forEach((route, index, array) => {
			const capturingGroups = [];
			let pattern = route.pattern;
			pattern = pattern.replace(/\:(\w+)/g, replaceDynamicParts);
			pattern = new RegExp('^' + pattern + '/?$');
			const match = url.match(pattern);

			if(match) {
				const parameterCount = capturingGroups.length;
				const data = {};
				for(var i=0; i<parameterCount; i++) {
					data[capturingGroups[i]] = match[i+1];
				}
				matchingRoutes.push({route:route, data:data});
			}

			function replaceDynamicParts(match, name, c, d, e) {
				capturingGroups.push(name);
				return "([^\/]+)";
			}
		});

		if(matchingRoutes.length === 0) {
			console.log("no match");
			if(catchAll) catchAll(url);
		} else if(matchingRoutes.length > 1) {
			console.error("url matched multiple views", matchingRoutes);
			return false;
		} else {
			const match = matchingRoutes[0];
			console.log("MATCH!!", match);
			if(activeRoute) activeRoute.hide(match.data);
			activeRoute = match.route;
			activeRoute.in(match.data);
		}

		
	}

	function goto(url) {
		if(activeUrl === url) return;
		if(url==="") url="/";
		history.pushState(null, null, url);
		find();
	}

	return {
		addCatchAll: addCatchAll,
		addOnLoad: addOnLoad,
		getView: getView,
		find: find,
		goto: goto,
		setBaseUrl : setBaseUrl
	}
}());

