# df [![Build Status](https://travis-ci.org/sindresorhus/df.svg?branch=master)](https://travis-ci.org/sindresorhus/df)

> Get free disk space info from [`df -k`](https://en.wikipedia.org/wiki/Df_\(Unix\))
Convert blocksize defined in http://man7.org/linux/man-pages/man1/df.1.html

Works on any Unix-based system like macOS and Linux. (also entware compatible)

*Created because all the other `df` wrappers are terrible. This one uses simple and explicit parsing. Uses `execa` rather than `exec`. Returns sizes in bytes and the capacity as a float.*


## Install

```
$ npm install @keltharan/df
```


## Usage

```js
const df = require('@keltharan/df');

(async () => {
	console.log(await df());
	/*
	[
		{
			filesystem: '/dev/disk1',
			size: 499046809600,
			used: 443222245376,
			available: 55562420224,
			capacity: 0.89,
			mountpoint: '/'
		},
		…
	]
	*/

	console.log(await df.fs('/dev/disk1'));
	/*
	{
		filesystem: '/dev/disk1',
		…
	}
	*/

	console.log(await df.file(__dirname));
	/*
	{
		filesystem: '/dev/disk1',
		…
	}
	*/
})();
```


## API

### df(args?)
args: overrules -k. can be used to change blocksize
Returns a `Promise<Object[]>` with a list of space info objects for each filesystem.

### df.fs(path)

Returns a `Promise<Object>` with the space info for the given filesystem path.

- `filesystem` - Name of the filesystem.
- `size` - Total size in bytes.
- `used` - Used size in bytes.
- `available` - Available size in bytes.
- `capacity` - Capacity as a float from `0` to `1`.
- `mountpoint` - Disk mount location.

#### path

Type: `string`

Path to a [filesystem device file](https://en.wikipedia.org/wiki/Device_file). Example: `'/dev/disk1'`.

### df.file(path)

Returns a `Promise<Object>` with the space info for the filesystem the given file is part of.

#### path

Type: `string`

Path to a file on the filesystem to get the space info for.


## License(origin)
MIT © [Sindre Sorhus](https://sindresorhus.com)
