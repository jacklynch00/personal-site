import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/router';

import * as ga from '../lib/ga';
import '../styles/globals.css';

import { init as EmailInit } from 'emailjs-com';

function MyApp({ Component, pageProps }) {
	const router = useRouter();
	EmailInit(process.env.EMAIL_USER_ID);

	useEffect(() => {
		const handleRouteChange = (url) => {
			ga.pageview(url);
		};

		//When the component is mounted, subscribe to router changes
		//and log those page views
		router.events.on('routeChangeComplete', handleRouteChange);

		// If the component is unmounted, unsubscribe
		// from the event with the `off` method
		return () => {
			router.events.off('routeChangeComplete', handleRouteChange);
		};
	}, [router.events]);

	return (
		<ThemeProvider defaultTheme='dark' attribute='class'>
			<Component {...pageProps} />
		</ThemeProvider>
	);
}

export default MyApp;
