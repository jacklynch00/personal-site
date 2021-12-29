import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';

const ContainerModule = ({ children, ...customMeta }) => {
	const router = useRouter();

	const meta = {
		title: 'Jack Lynch - Developer, Learner, and Leader',
		description: "I've just finished college and I'm ready to apply my learnings and work ethic to something I'm passionate about!",
		image: '/avatar.png',
		type: 'website',
		...customMeta,
	};

	return (
		<div>
			<Head>
				<title>{meta.title}</title>
				<meta name='robots' content='follow, index' />
				<meta content={meta.description} name='description' />
				<meta property='og:url' content={`https://yourwebsite.com${router.asPath}`} />
				<meta canonical='canonical' href={`https://yourwebsite.com${router.asPath}`} />
				<meta property='og:type' content={meta.type} />
				<meta property='og:site_name' content='Jack Lynch' />
				<meta property='og:description' content={meta.description} />
				<meta property='og:title' content={meta.title} />
				<meta property='og:image' content={meta.image} />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:site' content='@jack_lynch00' />
				<meta name='twitter:title' content={meta.title} />
				<meta name='twitter:description' content={meta.description} />
				<meta name='twitter:image' content={meta.image} />
				{meta.date && <meta property='article:published_time' content={meta.date} />}
			</Head>
			<main className='dark:bg-gray-800 w-full'>
				<Navbar />
				<div>{children}</div>
				<Footer />
			</main>
		</div>
	);
};

export default ContainerModule;
