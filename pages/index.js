import Head from 'next/head';
import styles from '../styles/Home.module.css';
import ContainerModule from '../components/ContainerModule';
import Hero from '../components/Hero.js';
import FavProjects from '../components/FavProjects';
import LatestCode from '../components/LatestCode';
import userData from '@constants/data';

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
	return {
		props: { repos: [] },
	};
};

export default Home;
