function createThemeStore() {
	// app.html's inline script already sets the .dark class before paint;
	// this just mirrors that into reactive state once the app hydrates.
	let dark = $state(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

	function apply() {
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			// Private browsing / storage disabled — theme just won't persist.
		}
	}

	function toggle() {
		dark = !dark;
		apply();
	}

	return {
		get dark() {
			return dark;
		},
		toggle
	};
}

export const theme = createThemeStore();
