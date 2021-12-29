import axios from 'axios';

const getLatestRepos = async (data) => {
	try {
		const username = data.githubUsername;
		const res = await axios.get(`https://api.github.com/users/${username}/repos`);
		let repos = res.data;
		var latestSixRepos;
		if (repos.length > 6) {
			latestSixRepos = repos.slice(0, 6);
		} else {
			latestSixRepos = repos.slice(0, repos.length);
		}
		return latestSixRepos;
	} catch (e) {
		console.log(e);
	}
};

export default getLatestRepos;
