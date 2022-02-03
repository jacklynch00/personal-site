const contactSubmission = (name, email, message) => {
	axios(options)
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log(err);
		});
};

export default contactSubmission;
