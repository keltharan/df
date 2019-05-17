'use strict';

const execa = require('execa');

const flag = '-k';
const blockParse = /\d+\w*(?=-blocks)/gi;
const blockSize = /(\d+)([KMG])/g;
const mntPoint = /\s(\/.*)\s*$/i;
const devicePlaceholder = '\\s*(.*)(?:\\s+on\\s+{MOUNTPOINT})';

const run = async args => {
	const mount = (await execa('mount')).stdout;
	const {stdout} = await execa('df', args);
	const table = stdout.trim().split('\n');
	const head = table.shift().split(/\s+/);
	const convertMatch = blockParse.exec(head[1]);
	let convert = 1;

	if (convertMatch) {
		const convertK = blockSize.exec(convertMatch[0]);
		if (convertK) {
			// http://man7.org/linux/man-pages/man1/df.1.html
			convert = convertK[1] * getSize(convertK[2]);
		} else {
			convert = parseInt(convertMatch[0], 10);
		}
	}

	return table.map(line => {
		line = prepareLine(line, mount);
		const cl = line.split(/\s+(?=[\d/])/);

		return {
			filesystem: cl[0],
			size: parseInt(cl[1], 10) * convert,
			used: parseInt(cl[2], 10) * convert,
			available: parseInt(cl[3], 10) * convert,
			capacity: parseInt(cl[4], 10) / 100,
			mountpoint: cl[5]
		};
	});
};

const getSize = size => {
	let value = 1;
	switch (size) {
		case 'G':
			value *= 1024;
			// falls through
		case 'M':
			value *= 1024;
			// falls through
		case 'K':
			value *= 1024;
			// falls through
		default:
			return value;
	}
};

const prepareLine = (line, mount) => {
	const mnt = mntPoint.exec(line);

	if (!mnt || mnt.length !== 2) {
		throw new TypeError('Mountpoint cannot be found!');
	}

	const deviceParser = new RegExp(devicePlaceholder.replace('{MOUNTPOINT}', mnt[1]), 'gi');

	for (const mountLine of mount.split('\n')) {
		const mountPointAccess = deviceParser.exec(mountLine);
		if (mountPointAccess) {
			return line.replace(mountPointAccess[1], mountPointAccess[1] + ' ');
		}
	}

	return line;
};

const df = async (call, file) => {
	if (typeof call !== 'string') {
		call = flag;
	}

	return run((file) ? [call, file] : [call]);
};

df.fs = async name => {
	if (typeof name !== 'string') {
		throw new TypeError('The `name` parameter required');
	}

	const data = await df();

	for (const item of data) {
		if (item.filesystem === name) {
			return item;
		}
	}

	throw new Error(`The specified filesystem \`${name}\` doesn't exist`);
};

df.file = async file => {
	if (typeof file !== 'string') {
		throw new TypeError('The `file` parameter is required');
	}

	let data;
	try {
		data = await df(null, file);
	} catch (error) {
		if (/No such file or directory/.test(error.message) ||
			/can't find mount point/.test(error.message)) {
			throw new Error(`The specified file \`${file}\` doesn't exist`);
		}

		throw error;
	}

	return data[0];
};

module.exports = df;
