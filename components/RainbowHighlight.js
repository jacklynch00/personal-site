import React from 'react';
import { RoughNotation } from 'react-rough-notation';

export const RainbowHighlight = ({ color, children }) => {
	const animationTime = Math.floor(30 * children.length);

	return (
		<RoughNotation type='highlight' multiline={true} padding={[0, 2]} iterations={1} animationDuration={animationTime} color={color}>
			{children}
		</RoughNotation>
	);
};
