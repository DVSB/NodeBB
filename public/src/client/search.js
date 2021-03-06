'use strict';

/* globals app, define, utils, socket*/

define('forum/search', ['search', 'autocomplete'], function(searchModule, autocomplete) {
	var	Search = {};

	Search.init = function() {
		var searchQuery = $('#results').attr('data-search-query');

		$('#advanced-search #search-input').val(searchQuery);

		var searchIn = $('#advanced-search #search-in');

		fillOutForm();

		searchIn.on('change', function() {
			updateFormItemVisiblity(searchIn.val());
		});

		highlightMatches(searchQuery);

		$('#advanced-search').off('submit').on('submit', function(e) {
			e.preventDefault();

			var input = $(this).find('#search-input');

			var searchData = getSearchData();
			searchData.term = input.val();

			searchModule.query(searchData, function() {
				input.val('');
			});
		});

		handleSavePreferences();

		enableAutoComplete();
	};

	function getSearchData() {
		var form = $('#advanced-search');
		var searchData = {
			in: form.find('#search-in').val()
		};

		if (searchData.in === 'posts' || searchData.in === 'titlesposts' || searchData.in === 'titles') {
			searchData.by = form.find('#posted-by-user').val();
			searchData.categories = form.find('#posted-in-categories').val();
			searchData.searchChildren = form.find('#search-children').is(':checked');
			searchData.replies = form.find('#reply-count').val();
			searchData.repliesFilter = form.find('#reply-count-filter').val();
			searchData.timeFilter = form.find('#post-time-filter').val();
			searchData.timeRange = form.find('#post-time-range').val();
			searchData.sortBy = form.find('#post-sort-by').val();
			searchData.sortDirection = form.find('#post-sort-direction').val();
			searchData.showAs = form.find('#show-as-topics').is(':checked') ? 'topics' : 'posts';
		}

		return searchData;
	}

	function updateFormItemVisiblity(searchIn) {
		var hide = searchIn.indexOf('posts') === -1 && searchIn.indexOf('titles') === -1;
		$('.post-search-item').toggleClass('hide', hide);
	}

	function fillOutForm() {
		var params = utils.params();
		var searchData = getSearchPreferences();
		params = utils.merge(searchData, params);

		if (params) {
			if (params.in) {
				$('#search-in').val(params.in);
				updateFormItemVisiblity(params.in);
			}

			if (params.by) {
				$('#posted-by-user').val(params.by);
			}

			if (params.categories) {
				$('#posted-in-categories').val(params.categories);
			}

			if (params.searchChildren) {
				$('#search-children').prop('checked', true);
			}

			if (params.replies) {
				$('#reply-count').val(params.replies);
				$('#reply-count-filter').val(params.repliesFilter);
			}

			if (params.timeRange) {
				$('#post-time-range').val(params.timeRange);
				$('#post-time-filter').val(params.timeFilter);
			}

			if (params.sortBy) {
				$('#post-sort-by').val(params.sortBy);
				$('#post-sort-direction').val(params.sortDirection);
			}

			if (params.showAs) {
				var isTopic = params.showAs === 'topics';
				var isPost = params.showAs === 'posts';
				$('#show-as-topics').prop('checked', isTopic).parent().toggleClass('active', isTopic);
				$('#show-as-posts').prop('checked', isPost).parent().toggleClass('active', isPost);
			}
		}
	}

	function highlightMatches(searchQuery) {
		if (!searchQuery) {
			return;
		}
		var searchTerms = searchQuery.split(' ');
		var regexes = [];
		for (var i=0; i<searchTerms.length; ++i) {
			var regex = new RegExp(searchTerms[i], 'gi');
			regexes.push({regex: regex, term: searchTerms[i]});
		}

		$('.search-result-text').each(function() {
			var result = $(this);
			var text = result.html();
			for(var i=0; i<regexes.length; ++i) {
				text = text.replace(regexes[i].regex, '<strong>' + regexes[i].term + '</strong>');
			}
			result.html(text).find('img').addClass('img-responsive');
		});
	}

	function handleSavePreferences() {
		$('#save-preferences').on('click', function() {
			localStorage.setItem('search-preferences', JSON.stringify(getSearchData()));
			app.alertSuccess('[[search:search-preferences-saved]]');
			return false;
		});

		$('#clear-preferences').on('click', function() {
			localStorage.removeItem('search-preferences');
			app.alertSuccess('[[search:search-preferences-cleared]]');
			return false;
		});
	}

	function getSearchPreferences() {
		try {
			return JSON.parse(localStorage.getItem('search-preferences'));
		} catch(e) {
			return {};
		}
	}

	function enableAutoComplete() {
		autocomplete.user($('#posted-by-user'));
	}

	return Search;
});
