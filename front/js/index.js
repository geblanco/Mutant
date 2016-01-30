'use strict';
//console.log('ss');
var $ = require('jquery');
var ipc = require('electron').ipcRenderer;
var prevQ = '', selected = 0;
var _defaultIconPath = '../icons/application-x-executable.png';

var _constructItem = function( selected, id, item ){
	// Item should have name and sub text, optionally an icon too
	// If no icon is provided, fall back to default
	// Add on click too
	/*return $('<div/>', {
		"class": 'list-group-item ' + (selected?'active':''),
		"id": id
	}).append($('<h4/>', {
		"class": 'list-group-item-heading',
		"text": item.name
	})).append($('<p/>', {
		"class": 'list-group-item-text',
		"text": item.subText
	}))*/
	var path = item.iconPath.split('/');
	//console.log(path);
	path = path.length < 2 ? _defaultIconPath : item.iconPath;

	return (
		$('<div/>', {
			"class": 'list-group-item row ' + (selected?'active':''),
			"id": id
		}).append(
			$('<div/>', {
				"class": 'icon col-xs-3 col-md-4'
			}).append(
				$('<a/>', {
					"href": '#',
					"class": 'img-rounded'
				}).append(
					$('<img/>', {
						"src": path,
						'viewBox':"0 0 48 48",
						"alt": null
					}).css({width: 48, height: 48})
				)
			)
		).append(
			$('<div/>', {
				"class": 'col-xs-9 col-md-8'
			}).append(
				$('<h4/>', {
					"class": 'list-group-item-heading',
					"text": item.appName.length < 80? item.appName : item.appName.substring(0, 80) + '...'
				})
			).append(
				$('<p/>', {
					"class": 'list-group-item-text',
					"text": item.subText === '__unknown__' ? '' : item.subText.length < 80? item.subText : item.subText.substring(0, 80) + '...',
				})
			)
		)
	);
}

var _scroll = function( direction ){
	if( direction === 'UP' ){
		if( selected-1 >= 0 ){
			$('[id^="li-"').removeClass('active');
			$('#li-' + --selected).addClass('active');
			var elem = $('#li-' + selected);
			//console.log('calc', elem.offset().top - elem.height());
			if( elem.offset().top - elem.height() <=  (window.outerHeight + $(window).scrollTop()) ){
				window.scrollBy(0, -(elem.height() + elem.height()/2) + 4);
			}
		}
	}else{
		if( selected+1 < $('.list-group .list-group-item').length ){// 0 based idx
			$('[id^="li-"').removeClass('active');
			$('#li-' + ++selected).addClass('active');
			var elem = $('#li-' + selected);
			//console.log('calc', elem.offset().top + elem.height());
			if( elem.offset().top + elem.height() >=  (window.outerHeight + $(window).scrollTop()) ){
				window.scrollBy(0, elem.height() + elem.height()/2 + 3);
			}
		}
	}
}

$(function(){
	console.log('ready');
	$('#search').keypress(function( evt ){
		// Little delay for value setup
		// TODO => Filter non-letter keypresses (ctrl, alt...)
		setTimeout(function() {
			var q = $('#search').val();
			console.log('search keypress', 'q', q, 'prevQ', prevQ);
			if( (q !== '' && q !== ' ') ){
				//console.log(q);
				prevQ = q;
				ipc.send( 'query', q );
			}else if( (prevQ !== '' && prevQ !== ' ') && (q === '' || q === ' ') ){
				prevQ = '';
				ipc.send( 'query', q );
			}
		}, 10);
	})

	$('#search').keydown(function( evt ){
		// Little delay for value setup
		setTimeout(function() {
			var q = $('#search').val();
			console.log('search keydown', 'q', q, 'prevQ', prevQ);
			if( prevQ !== q ){
				console.log('differ');
				setTimeout(function(){
					prevQ = q;
					ipc.send( 'query',q );
				}, 10);
			}
		}, 10);
	})

	if( $('#list').attr('hidden') ){
		$('#list').attr('hidden', false);
	}

	ipc.on('dirty', function( event, bool ){
		//$('body').css('overflow', (bool?'auto':'hidden'));
	})

	ipc.on('resultsForView', function( event, list ) {
		selected = 0;
		$('[id^="li-"').remove();
		//console.log('resultsForView', list);
		if( list.length ){
			if( $('#list').attr('hidden') ){
				$('#list').attr('hidden', false);
			}
			list.forEach(function( item, idx ){
				var el = $(_constructItem( !!(idx === 0), ('li-' + idx), item ));
				// Wrap object
				el.data('exec', item);
				$('#list').append( el );
				ipc.send('requestSize', $('[id^=li-').length, $(('#li-' + idx)).height() );
			})	
		}else{
			ipc.send('requestSize', 0 );
			$('#list').attr('hidden', true);
		}
	})
	var appent =0;
	ipc.on('appendToView', function( event, list ) {
		setTimeout(function() {
			if( list.length ){
				if( $('#list').attr('hidden') ){
					$('#list').attr('hidden', false);
				}
				list.forEach(function( item, idx ){
					var el = $(_constructItem( false, ('li-' + ($('[id^=li-').length + idx)), item ));
					// Wrap object
					el.data('exec', item);
					$('#list').append( el );
					ipc.send('requestSize', $('[id^=li-').length, $(('#li-' + idx)).height() );
				});
			}
		}, 10);
	})
	ipc.on('halt', function(){
		$('#search').val('');
		$('[id^="li-"').remove();
		ipc.send('requestSize', 0, 0 );
		$('#list').attr('hidden', true);
	})
	ipc.send('mainReady');
}).keydown(function( event ){
	if( event.which === 38 || event.which === 40){
		event.preventDefault();
		// Up/Down
		_scroll( event.which === 38?'UP':'DOWN' );
	}else if( event.which === 13 ){
		event.preventDefault();
		var data = $('#li-' + selected).data();
		ipc.send('execute', data.exec, $('#search').val());
		console.log($('#li-' + selected).data());
	}
})