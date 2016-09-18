'use strict';

var program   = require('commander');

var _statOrNull = function( path ){

	let ret = null;
	try{ ret = fs.lstatSync( path ) }
	catch( e ){}
	finally{ return ret }

}

var _getAbsolutePath = function( path ){

	let ret = null;
	let stat = null
	// Check if its absolute yet
	if( path.indexOf('/') === 0 ){
		// If it does not exist
		ret = path
		stat = _statOrNull( ret );

	}else{

		ret = upath.joinSafe(process.cwd(), path)
		stat = _statOrNull( ret );

	}
	if( stat === null ){
		
		ret = null;

	}

	return ret;

}

var _getDirFromPathOrNull = function( path ){

	let ret = _getAbsolutePath( path );
	if( ret !== null ){

		let stat = _statOrNull( ret );

		if( stat.isFile() ){
			// Trim file
			ret = ret.split('/');
			ret.pop();
			ret = ret.join('/');

		}

	}

	return ret;

}

var _getFileFromPathOrNull = function( path ){

	let ret = _getAbsolutePath( path );
	if( ret !== null ){

		let stat = _statOrNull( ret );

		if( !stat.isFile() ){

			ret = null;

		}

	}

	return ret;

}

var _getInDescriptorFromPathOrNull = function( path ){

	let ret = _getAbsolutePath( path );
	if( ret !== null ){

		let stat = _statOrNull( ret );
		// Input shall be a file or a directory
		if( !stat.isFile() && !stat.isDirectory() ){

			ret = null;

		}

	}

	return ret;

}

var _getOutDescriptorFromPathOrNull = function( path ){

	let ret = null;
	let tmp = null;
	if( !(ret = _getDirFromPathOrNull(path)) ){
		// We are given a file
		tmp = path.split('/');
		ret = tmp.pop();
		if( !(path = _getDirFromPathOrNull(tmp.join('/'))) ){
			// Bad directory path
			ret = null;
		}else{
			ret = upath.joinSafe( path, ret );
		}
	}
	return ret;

}

var prepareProgram = function(){

	// Parse command line
	program
	  .version('0.0.1')
		.option('-l, --logdir [path]', 'Path to log directory', _getOutDescriptorFromPathOrNull)
	  .option('-v, --verbose', 'Increase verbosity', (v,t) => t + 1 , 0)
	  .parse(process.argv);

	console.log('Parsed:',
		'\n\tLog dir ->', program.logdir
		'\n\tVerbosity ->', program.verbose
	);

}

prepareProgram();