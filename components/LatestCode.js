import React, { useEffect, useState } from 'react';
import userData from '../constants/data';

const GithubRepoCard = ({ latestRepo }) => {
	return (
		<div className='p-3 rounded-lg github-repo bg-slate-800/75'>
			<h1 className='text-xl font-semibold text-gray-700 dark:text-gray-200'>{latestRepo.name}</h1>
			<p className='my-4 text-base font-normal text-gray-500'>{latestRepo.description}</p>
			<a href={latestRepo.clone_url} target='_blank' rel='noreferrer' className='flex flex-row items-center w-full space-x-2 font-semibold group'>
				<p>View Repository </p>
				<div className='transition duration-300 transform group-hover:translate-x-2'>&rarr;</div>
			</a>
		</div>
	);
};

const LatestCode = ({ repos }) => {
	const [repositories, setRepositories] = useState([]);

	useEffect(() => {
		setRepositories(repos);
	}, [repos]);

	return (
		<section className='bg-[#F1F1F1] -mt-40 dark:bg-gray-900 pb-40'>
			<div className='max-w-6xl mx-auto'>
				<div className='flex flex-col items-center justify-between mx-10 md:flex-row md:pt-40'>
					<h1 className='max-w-lg my-20 text-6xl font-bold text-center text-gray-500 lg:text-9xl md:my-0 md:text-white dark:text-gray-600 lg:text-left'>Latest Code</h1>

					<a
						href={`https://github.com/${userData.githubUsername}`}
						className='flex flex-row items-center px-8 py-4 mb-20 space-x-4 text-xl font-semibold bg-white rounded-md shadow-lg md:mb-0 dark:text-gray-700'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							fill='currentColor'
							className='bi bi-arrow-up-right-square'
							stroke='4'
							strokeWidth='4'
							viewBox='0 0 16 16'>
							<path
								fillRule='evenodd'
								d='M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707l-4.096 4.096z'
							/>
						</svg>
						<p>View GitHub</p>
					</a>
				</div>
			</div>
			<div className='grid max-w-6xl grid-cols-1 gap-8 px-10 mx-auto md:grid-cols-2 lg:grid-cols-3 lg:-mt-10 gap-y-20'>
				{/* Single github Repo */}
				{repositories && repositories.map((latestRepo, i) => <GithubRepoCard latestRepo={latestRepo} key={i} />)}
			</div>
		</section>
	);
};

export default LatestCode;
