import React from 'react';
import Image from 'next/image';
import userData from '../constants/data';

const About = () => {
	return (
		<section className='bg-white dark:bg-gray-800'>
			<div className='h-48 max-w-6xl mx-auto bg-white dark:bg-gray-800'>
				<h1 className='py-20 text-5xl font-bold text-center md:text-9xl md:text-left'>About Me.</h1>
			</div>
			<div className='bg-[#F1F1F1] -mt-10 dark:bg-gray-900'>
				<div className='max-w-6xl pt-20 mx-auto text-container'>
					<p className='mx-4 text-2xl font-semibold leading-loose md:text-4xl' style={{ lineHeight: '3rem' }}>
						{userData.about.title}. Currently working on{' '}
						<a className='px-2 py-1 text-white bg-red-500 rounded-md' href={userData.about.currentProjectUrl}>
							{userData.about.currentProject}
						</a>
					</p>
				</div>
			</div>
			<div className='bg-[#F1F1F1] dark:bg-gray-900 px-4'>
				<div className='grid max-w-6xl grid-cols-1 pt-20 mx-auto md:grid-cols-3 gap-y-20 gap-x-20'>
					{/* Social Buttons */}
					<div className='inline-flex flex-col'>
						{/* Achievements */}
						<div>
							<h1 className='text-xl font-bold text-gray-700 dark:text-gray-200'>Achievements</h1>
							<div className='p-3 mt-2 mb-2 bg-slate-800 rounded-xl'>
								<h1 className='text-lg italic font-semibold text-gray-500 dark:text-gray-300'>Hackathon Finalist</h1>
								<p className='text-gray-500 text-ms dark:text-gray-300'>
									&bull; Runner up among 9 teams in the 2021 OHI/O Hackathon as a solo-team building a full-stack project for AEP to crowdsource info and annotate
									images of their power supply chain.
								</p>
								<p className='text-gray-500 text-ms dark:text-gray-300'>
									&bull;{' '}
									<a className='underline' rel='noreferrer' href='https://github.com/jacklynch00/aep-power-lines.git'>
										View The Project Here
									</a>
								</p>
							</div>
							<div className='p-3 mt-2 mb-2 bg-slate-800 rounded-xl'>
								<h1 className='text-lg italic font-semibold text-gray-500 dark:text-gray-300'>First Place OSU Launch Pad</h1>
								<p className='text-gray-500 text-ms dark:text-gray-300'>
									&bull; First place in a business pitch competition to help reduce the amount of time people spend shopping for groceries.
								</p>
								<p className='text-gray-500 text-ms dark:text-gray-300'>
									&bull;{' '}
									<a
										className='underline'
										rel='noreferrer'
										href='https://docs.google.com/presentation/d/1oCCoTUWa2yvRh_Burueoj4SYEJbB5_BmgpjuWjRX1wo/edit?usp=sharing'>
										View The Pitch Deck Here
									</a>
								</p>
							</div>
						</div>
						{/* Contact Me */}
						<div className='mt-8'>
							<h1 className='text-xl font-bold text-gray-700 dark:text-gray-200'>Contact</h1>
							<p className='mt-4 text-lg text-gray-500 dark:text-gray-300'>
								Shoot me an{' '}
								<a href={`mailto:${userData.email}`} className='font-bold text-gray-800 border-b-2 border-gray-800 dark:border-gray-300 dark:text-gray-300'>
									email
								</a>{' '}
								and I&apos;ll get back ASAP... I promise :)
							</p>
						</div>
						{/* Resume */}
						<div className='mt-8'>
							<h1 className='text-xl font-bold text-gray-700 dark:text-gray-200'>Job Opportunities</h1>
							<p className='mt-4 text-lg text-gray-500 dark:text-gray-300'>
								I&apos;m currently looking for new opportunites. If you see me as a good fit, check out my{' '}
								<a
									href={userData.resumeUrl}
									target='__blank'
									rel='noreferrer'
									className='font-bold text-gray-800 border-b-2 border-gray-800 dark:border-gray-300 dark:text-gray-300'>
									Resume
								</a>{' '}
								and reach out!
							</p>
						</div>
						{/* Social Links */}
						<h1 className='mt-8 text-xl font-bold text-gray-700 dark:text-gray-200'>Social Links</h1>
						<div className='mt-4 ml-4'>
							<div className='flex flex-row items-center justify-start'>
								<a href={userData.socialLinks.twitter} target='_blank' rel='noreferrer' className='flex flex-row items-center space-x-4 group'>
									<div className='my-4'>&rarr;</div>
									<p className='relative overflow-hidden font-mono text-lg text-gray-500 dark:text-gray-300'>
										<div className='absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-24 group-hover:translate-x-0 transition duration-300'></div>
										Twitter
									</p>
								</a>
							</div>
							<div className='flex flex-row items-center justify-start'>
								<a href={userData.socialLinks.github} target='_blank' rel='noreferrer' className='flex flex-row items-center space-x-4 group'>
									<div className='my-4'>&rarr;</div>
									<p className='relative overflow-hidden font-mono text-lg text-gray-500 dark:text-gray-300'>
										<div className='absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-24 group-hover:translate-x-0 transition duration-300'></div>
										GitHub
									</p>
								</a>
							</div>
							<div className='flex flex-row items-center justify-start'>
								<a href={userData.socialLinks.linkedin} target='_blank' rel='noreferrer' className='flex flex-row items-center space-x-4 group'>
									<div className='my-4'>&rarr;</div>
									<p className='relative overflow-hidden font-mono text-lg text-gray-500 dark:text-gray-300'>
										<div className='absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-24 group-hover:translate-x-0 transition duration-300'></div>
										LinkedIn
									</p>
								</a>
							</div>
							<div className='flex flex-row items-center justify-start'>
								<a href={userData.socialLinks.twitter} target='_blank' rel='noreferrer' className='flex flex-row items-center space-x-4 group'>
									<div className='my-4'>&rarr;</div>
									<p className='relative overflow-hidden font-mono text-lg text-gray-500 dark:text-gray-300'>
										<div className='absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-28 group-hover:translate-x-0 transition duration-300'></div>
										Instagram
									</p>
								</a>
							</div>
						</div>
					</div>
					{/* Text area */}
					<div className='col-span-1 md:col-span-2'>
						{userData.about.description?.map((desc, i) => (
							<p key={i} className='mb-4 text-xl text-gray-700 dark:text-gray-300 '>
								{desc}
							</p>
						))}

						<h1 className='inline-block px-2 py-1 text-3xl font-bold bg-red-500 rounded-md text-gray-50'>Tech Stack</h1>
						<div className='flex flex-row flex-wrap items-stretch mt-8'>
							{/* TODO: Add my own images here to speed it up */}
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/javascript.png' width={150} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/python.png' width={200} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/html.png' width={100} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/css.png' width={150} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/react.png' width={150} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/redux.png' width={150} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/django.png' width={200} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/express.png' width={300} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/firebase.png' width={200} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/git.png' width={200} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/linux.png' width={200} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/mysql.png' width={200} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/node.png' width={150} height={100} />
							<Image alt='tech-stack-image' className='w-20 h-20 mx-4 my-10' src='/tech-stack/postgresql.png' width={150} height={100} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
export default About;
