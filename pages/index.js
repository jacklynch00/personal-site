import Head from 'next/head';
import amplitude from 'amplitude-js';

import styles from '@/styles/Home.module.css';
import ContainerModule from '@/components/ContainerModule';
import Hero from '@/components/Hero.js';
import FavProjects from '@/components/FavProjects';
import LatestCode from '@/components/LatestCode';
import userData from '@/constants/data';
import getLatestRepos from '@/lib/getLatestRepos';

const Home = ({ repos }) => {
	return (
		<ContainerModule
			title='Jack Lynch | Developer, Learner, Leader'
			description="I've just finished college and I'm ready to apply my learnings and work ethic to something I'm passionate about!">
			<Hero />
			<FavProjects />
			<LatestCode repos={repos} />
		</ContainerModule>
	);
};

export const getServerSideProps = async () => {
	const repos = await getLatestRepos(userData);
	return {
		props: { repos },
	};
};

export default Home;
