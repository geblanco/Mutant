'use strict';
//console.log('ss');
var $ = require('jquery');
var ipc = require('electron').ipcRenderer;
var prevQ = '', selected = 0;
var _defaultIconPath = '../icons/application.png';
var MAX_CHAR = 100;

var _constructItem = function( selected, id, item ){
						
	// Item should have name and sub text, optionally an icon too
	// If no icon is provided, fall back to default
	// Add on click too
	var path = item.iconPath.split('/');;
	path = path.length < 2 ? _defaultIconPath : item.iconPath;
	
	return (
		$('<div/>', {
			"class": 'list-group-item row ' + (selected?'active':''),
			"id": id,
			"css":{ cursor: 'pointer' }
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
					"text": item.appName.length < MAX_CHAR? item.appName : item.appName.substring(0, MAX_CHAR) + '...'
				})
			).append(
				$('<p/>', {
					"class": 'list-group-item-text',
					"text": item.subText === '__unknown__' ? '' : item.subText.length < MAX_CHAR? item.subText : item.subText.substring(0, MAX_CHAR) + '...',
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

var _execute = function( id ){
	var data = $('#' + id ).data();
	ipc.send('execute', data.exec, $('#search').val());
}

$(function(){

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
			$('.list-group-item').on('click', function(){
				_execute( this.id );
			})
		}else{
			ipc.send('requestSize', 0 );
			$('#list').attr('hidden', true);
		}
	})

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
		// Enter
		event.preventDefault();
		_execute( 'li-' + selected );
	}
})