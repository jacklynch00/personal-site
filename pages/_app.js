import '../styles/globals.css';
import { init } from 'emailjs-com';
import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
	init(process.env.EMAIL_USER_ID);
	return (
		<ThemeProvider defaultTheme='dark' attribute='class'>
			<Component {...pageProps} />
		</ThemeProvider>
	);
}

export default MyApp;
